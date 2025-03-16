import {
  loadFixture,
  time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { PricingUtils } from '../../typechain-types/contracts/registry/IPricingRegistry';
import { getCycleDuration } from '../../utils/cycle-duration';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';

describe('PricingCalculator', () => {
  async function deployPricingCalculator() {
    const [owner] = await hre.ethers.getSigners();

    const ContractRegistry = await hre.ethers.getContractFactory(
      'ContractRegistry',
    );
    const contractRegistry = await ContractRegistry.deploy();

    const OrganizationAttributeProvider = await hre.ethers.getContractFactory(
      'OrganizationAttributeProvider',
    );
    const organizationAttributeProvider =
      await OrganizationAttributeProvider.deploy(contractRegistry);

    const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
      'OrganizationMetadataProvider',
    );
    const organizationMetadataProvider =
      await OrganizationMetadataProvider.deploy(
        contractRegistry,
        organizationAttributeProvider,
      );

    const OrganizationNFT = await hre.ethers.getContractFactory(
      'OrganizationNFT',
    );
    const organizationNFT = await OrganizationNFT.deploy(
      organizationMetadataProvider,
    );

    await organizationNFT.setMintOpen(true);

    const PaymentEscrow = await hre.ethers.getContractFactory('PaymentEscrow');
    const paymentEscrow = await PaymentEscrow.deploy(contractRegistry);

    const PricingRegistry = await hre.ethers.getContractFactory(
      'PricingRegistry',
    );
    const pricingRegistry = await PricingRegistry.deploy(contractRegistry);

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();

    await paymentEscrow.setWhitelistedToken(await mintToken.getAddress(), true);

    const PricingCalculator = await hre.ethers.getContractFactory(
      'PricingCalculator',
    );
    const pricingCalculator = await PricingCalculator.deploy(contractRegistry);

    const UsageRecorder = await hre.ethers.getContractFactory('UsageRecorder');
    const usageRecorder = await UsageRecorder.deploy(contractRegistry);

    await contractRegistry.setPricingRegistry(pricingRegistry);
    await contractRegistry.setPricingCalculator(pricingCalculator);
    await contractRegistry.setOrganizationNFT(organizationNFT);
    await contractRegistry.setUsageRecorder(usageRecorder);
    await contractRegistry.setPaymentEscrow(paymentEscrow);

    return {
      pricingCalculator,
      pricingRegistry,
      usageRecorder,
      organizationNFT,
      contractRegistry,
      paymentEscrow,
      mintToken,
      owner,
    };
  }

  describe('Deployment', () => {
    it('should the contract registry', async () => {
      const { pricingCalculator, contractRegistry } = await loadFixture(
        deployPricingCalculator,
      );

      expect(await pricingCalculator.registry()).to.equal(contractRegistry);
    });
  });

  describe('Change Subscription Cost', () => {
    it('should revert if the new pricing id is the same as the old pricing id', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      await expect(
        pricingCalculator.getChangeSubscriptionCost(1, 1, 0, 0, 0),
      ).to.be.revertedWith('Pricing ids are the same');
    });

    it('should revert if the current start date is after the current end date', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      const currentTime = await time.latest();

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentTime + 100,
          currentTime,
          0,
        ),
      ).to.be.revertedWith('Invalid date range');
    });

    it('should revert if the current dates are equal', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      const currentTime = await time.latest();

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentTime,
          currentTime,
          0,
        ),
      ).to.be.revertedWith('Invalid date range');
    });

    it('should revert if the current dates are in the past', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      const currentTime = await time.latest();

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentTime - 1000,
          currentTime - 100,
          0,
        ),
      ).to.be.revertedWith('Invalid date range');
    });

    it('should revert if the current dates are in the future', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      const currentTime = await time.latest();

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentTime + 100,
          currentTime + 1000,
          0,
        ),
      ).to.be.revertedWith('Invalid date range');
    });
  });

  describe('Change Subscription Cost - One Time', () => {
    it('should revert if any pricing is one time', async () => {
      const {
        pricingRegistry,
        pricingCalculator,
        organizationNFT,
        mintToken,
        owner,
      } = await loadFixture(deployPricingCalculator);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 100,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 2,
        flatPrice: 100,
        isRestricted: false,
      });

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + getCycleDuration(2);

      await time.increase(getCycleDuration(1));

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentStartDate,
          currentEndDate,
          0,
        ),
      ).to.be.revertedWithCustomError(pricingCalculator, 'InvalidChargeStyle');

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          2,
          1,
          currentStartDate,
          currentEndDate,
          0,
        ),
      ).to.be.revertedWithCustomError(pricingCalculator, 'InvalidChargeStyle');
    });
  });

  describe('Change Subscription Cost - Flat Rate', () => {
    async function loadFlatRatePricing(params: {
      firstChargeFrequency: number;
      secondChargeFrequency: number;
    }) {
      const contracts = await loadFixture(deployPricingCalculator);

      const { pricingRegistry, mintToken, organizationNFT, owner } = contracts;

      await organizationNFT.connect(owner).mint(owner);

      const mintTokenAddress = await mintToken.getAddress();

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: params.firstChargeFrequency,
        flatPrice: ethers.parseUnits('100', 6),
        isRestricted: false,
      });

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: params.secondChargeFrequency,
        flatPrice: ethers.parseUnits('150', 6),
        isRestricted: false,
      });

      // Get current subscription dates
      const currentStartDate = await time.latest();
      const currentEndDate =
        currentStartDate + getCycleDuration(params.firstChargeFrequency);

      return {
        ...contracts,
        currentStartDate,
        currentEndDate,
        mintTokenAddress,
      };
    }

    it('should return the correct cost for flat rate change for weekly to monthly', async () => {
      const {
        pricingCalculator,
        currentStartDate,
        currentEndDate,
        mintTokenAddress,
      } = await loadFlatRatePricing({
        firstChargeFrequency: 1,
        secondChargeFrequency: 2,
      });

      await time.increase(getCycleDuration(1) / 2);

      const [newEndDate, token, amount] =
        await pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentStartDate,
          currentEndDate,
          10,
        );

      expect(newEndDate).to.equal(currentStartDate + getCycleDuration(2));
      expect(amount).to.equal(ethers.parseUnits('132.5', 6));
      expect(token).to.equal(mintTokenAddress);
    });

    it('should return the correct cost for flat rate change for monthly to quarterly', async () => {
      const {
        pricingCalculator,
        currentStartDate,
        currentEndDate,
        mintTokenAddress,
      } = await loadFlatRatePricing({
        firstChargeFrequency: 2,
        secondChargeFrequency: 3,
      });

      await time.increase(getCycleDuration(2) / 4);

      const [newEndDate, token, amount] =
        await pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentStartDate,
          currentEndDate,
          20,
        );

      expect(newEndDate).to.equal(currentStartDate + getCycleDuration(3));
      expect(amount).to.equal(ethers.parseUnits('137.5', 6));
      expect(token).to.equal(mintTokenAddress);
    });

    it('should return the correct cost for flat rate change for quarterly to yearly', async () => {
      const {
        pricingCalculator,
        currentStartDate,
        currentEndDate,
        mintTokenAddress,
      } = await loadFlatRatePricing({
        firstChargeFrequency: 3,
        secondChargeFrequency: 4,
      });

      await time.increase(getCycleDuration(3) / 2);

      const [newEndDate, token, amount] =
        await pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentStartDate,
          currentEndDate,
          0,
        );

      expect(newEndDate).to.equal(currentStartDate + getCycleDuration(4));
      expect(amount).to.equal(ethers.parseUnits('131.506849', 6));
      expect(token).to.equal(mintTokenAddress);
    });

    it('should return 0 cost and the same end date if the new pricing has the same cycle duration', async () => {
      const {
        pricingCalculator,
        currentStartDate,
        currentEndDate,
        mintTokenAddress,
      } = await loadFlatRatePricing({
        firstChargeFrequency: 1,
        secondChargeFrequency: 1,
      });

      await time.increase(getCycleDuration(1) / 2);

      const [newEndDate, token, amount] =
        await pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentStartDate,
          currentEndDate,
          0,
        );

      expect(amount).to.equal(0);
      expect(newEndDate).to.equal(currentEndDate);
      expect(token).to.equal(mintTokenAddress);
    });

    it('should return 0 cost and the same end date if the new pricing has a smaller cycle duration', async () => {
      const {
        pricingCalculator,
        currentStartDate,
        currentEndDate,
        mintTokenAddress,
      } = await loadFlatRatePricing({
        firstChargeFrequency: 2,
        secondChargeFrequency: 1,
      });

      await time.increase(getCycleDuration(1) / 2);

      const [newEndDate, token, amount] =
        await pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentStartDate,
          currentEndDate,
          0,
        );

      expect(amount).to.equal(0);
      expect(newEndDate).to.equal(currentEndDate);
      expect(token).to.equal(mintTokenAddress);
    });
  });

  describe('Change Subscription Cost - Usage Based', () => {
    async function loadUsageBasedPricing() {
      const results = await loadFixture(deployPricingCalculator);

      const {
        pricingRegistry,
        mintToken,
        organizationNFT,
        owner,
        usageRecorder,
      } = results;

      await organizationNFT.connect(owner).mint(owner);

      await usageRecorder.connect(owner).createMeter(1, 1);

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        isVolume: true,
        isRestricted: false,
        usageMeterId: 1,
      });

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        isVolume: false,
        isRestricted: false,
        usageMeterId: 1,
      });

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 30,
            priceFlatRate: 40,
          },
        ],
        isVolume: false,
        isRestricted: false,
        usageMeterId: 1,
      });

      return {
        ...results,
        mintTokenAddress: await mintToken.getAddress(),
      };
    }

    it('should change from smaller to larger cycle duration', async () => {
      const { pricingCalculator, mintTokenAddress } =
        await loadUsageBasedPricing();

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + getCycleDuration(1);

      await time.increase(getCycleDuration(1) / 2);

      const [newEndDate, token, amount] =
        await pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          currentStartDate,
          currentEndDate,
          0,
        );

      expect(newEndDate).to.equal(currentStartDate + getCycleDuration(2));
      expect(amount).to.equal(0);
      expect(token).to.equal(mintTokenAddress);
    });

    it('should change from larger to smaller cycle duration', async () => {
      const { pricingCalculator, mintTokenAddress } =
        await loadUsageBasedPricing();

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + getCycleDuration(2);

      await time.increase(getCycleDuration(1) / 2);

      const [newEndDate, token, amount] =
        await pricingCalculator.getChangeSubscriptionCost(
          2,
          1,
          currentStartDate,
          currentEndDate,
          0,
        );

      expect(newEndDate).to.equal(currentEndDate);
      expect(amount).to.equal(0);
      expect(token).to.equal(mintTokenAddress);
    });

    it('should change from the same charge style pricing to another pricing with the same charge style', async () => {
      const { pricingCalculator, mintTokenAddress } =
        await loadUsageBasedPricing();

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + getCycleDuration(2);

      await time.increase(getCycleDuration(1) / 2);

      const [newEndDate, token, amount] =
        await pricingCalculator.getChangeSubscriptionCost(
          2,
          3,
          currentStartDate,
          currentEndDate,
          0,
        );

      expect(newEndDate).to.equal(currentEndDate);
      expect(amount).to.equal(0);
      expect(token).to.equal(mintTokenAddress);
    });

    it('revert if attempting to change to or from usage based pricing without a old usage based pricing', async () => {
      const {
        pricingCalculator,
        pricingRegistry,
        mintToken,
        owner,
        usageRecorder,
        purchaseTimeStamp,
      } = await loadWithPurchasedFlatRateSubscription();

      await time.increase(getCycleDuration(1) / 2);

      await usageRecorder.connect(owner).createMeter(1, 1);

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        isVolume: true,
        usageMeterId: 1,
        isRestricted: false,
      });

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
          0,
        ),
      ).to.be.revertedWithCustomError(
        pricingCalculator,
        'UsageBasedChargeStyleInconsistency',
      );

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          2,
          1,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
          0,
        ),
      ).to.be.revertedWithCustomError(
        pricingCalculator,
        'UsageBasedChargeStyleInconsistency',
      );
    });

    it('revert if attempting to change to or from tiered VOLUME based pricing without a old tiered VOLUME based pricing', async () => {
      const {
        pricingCalculator,
        pricingRegistry,
        mintToken,
        owner,
        purchaseTimeStamp,
      } = await loadWithPurchasedFlatRateSubscription();

      await time.increase(getCycleDuration(1) / 2);

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        isVolume: true,
        isRestricted: false,
      });

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
          0,
        ),
      ).to.be.revertedWithCustomError(
        pricingCalculator,
        'TieredChargeStyleInconsistency',
      );

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          2,
          1,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
          0,
        ),
      ).to.be.revertedWithCustomError(
        pricingCalculator,
        'TieredChargeStyleInconsistency',
      );
    });

    it('revert if attempting to change to or from tiered GRADUATED based pricing without a old tiered GRADUATED based pricing', async () => {
      const {
        pricingCalculator,
        pricingRegistry,
        mintToken,
        owner,
        purchaseTimeStamp,
      } = await loadWithPurchasedFlatRateSubscription();

      await time.increase(getCycleDuration(1) / 2);

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        isVolume: false,
        isRestricted: false,
      });

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          1,
          2,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
          0,
        ),
      ).to.be.revertedWithCustomError(
        pricingCalculator,
        'TieredChargeStyleInconsistency',
      );

      await expect(
        pricingCalculator.getChangeSubscriptionCost(
          2,
          1,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
          0,
        ),
      ).to.be.revertedWithCustomError(
        pricingCalculator,
        'TieredChargeStyleInconsistency',
      );
    });
  });

  describe('Initial Purchase Cost', () => {
    it('should return the correct cost for pricing ids', async () => {
      const {
        pricingCalculator,
        pricingRegistry,
        organizationNFT,
        usageRecorder,
        mintToken,
        owner,
      } = await loadFixture(deployPricingCalculator);

      await organizationNFT.connect(owner).mint(owner);

      const mintTokenAddress = await mintToken.getAddress();

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 100,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 1,
        flatPrice: 100,
        isRestricted: false,
      });

      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 1,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        isVolume: false,
        isRestricted: false,
      });

      await usageRecorder.connect(owner).createMeter(1, 1);

      await pricingRegistry.createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 1,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        isVolume: false,
        usageMeterId: 1,
        isRestricted: false,
      });

      expect(
        await pricingCalculator.getInitialPurchaseCost(
          [1, 2, 3, 4],
          [10, 20, 30, 40],
        ),
      ).to.equal(520);
    });

    it('should revert if no pricing ids are provided', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      await expect(
        pricingCalculator.getInitialPurchaseCost([], []),
      ).to.be.revertedWith('No pricing ids provided');
    });

    it('should revert if pricing ids and quantities are not the same length', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      await expect(
        pricingCalculator.getInitialPurchaseCost([1], [1, 2]),
      ).to.be.revertedWith('Invalid pricing ids');
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      expect(await pricingCalculator.supportsInterface('0x01ffc9a7')).to.be
        .true;
    });
  });

  describe('Pricing Cost Calculation', () => {
    it('should return the flat price if pricing is ONE_TIME', async () => {
      const { pricingCalculator, pricingRegistry, organizationNFT, owner } =
        await loadFixture(deployPricingCalculator);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 200,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(200);

      expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(200);

      await pricingRegistry.setPricingFlatPrice(1, 100);

      expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(100);
    });

    it('should return the flat price if pricing is FLAT_RATE subscription', async () => {
      const {
        pricingRegistry,
        organizationNFT,
        pricingCalculator,
        mintToken,
        owner,
      } = await loadFixture(deployPricingCalculator);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 100,
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        isRestricted: false,
      });

      expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(100);

      expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(100);

      await pricingRegistry.setPricingFlatPrice(1, 200);

      expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(200);
    });

    it('should return 0 if no tiers are provided for total volume cost', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      expect(await pricingCalculator.totalVolumeCost([], 100)).to.equal(0);
    });

    it('should return 0 if no tiers are provided for total graduated cost', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      expect(await pricingCalculator.totalGraduatedCost([], 100)).to.equal(0);
    });

    async function createTieredPricing(
      tiers: PricingUtils.PricingTierStruct[],
      isVolume: boolean,
    ) {
      const {
        pricingRegistry,
        pricingCalculator,
        organizationNFT,
        mintToken,
        owner,
      } = await loadFixture(deployPricingCalculator);

      await organizationNFT.connect(owner).mint(owner);

      const mintTokenAddress = await mintToken.getAddress();

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 1,
        tiers,
        isVolume,
        isRestricted: false,
      });

      return {
        pricingRegistry,
        pricingCalculator,
      };
    }

    describe('TIERED_VOLUME', () => {
      it('should return cost for single tier with flat unit price and flat rate', async () => {
        const { pricingCalculator } = await createTieredPricing(
          [
            {
              lowerBound: 1,
              upperBound: 0,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
          ],
          true,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(20);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(
          1020,
        );
      });

      it('should return cost for multiple tiers with flat unit prices and flat rates', async () => {
        const { pricingCalculator } = await createTieredPricing(
          [
            {
              lowerBound: 1,
              upperBound: 100,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
            {
              lowerBound: 101,
              upperBound: 101,
              pricePerUnit: 5,
              priceFlatRate: 10,
            },
            {
              lowerBound: 102,
              upperBound: 200,
              pricePerUnit: 2,
              priceFlatRate: 5,
            },
            {
              lowerBound: 201,
              upperBound: 0,
              pricePerUnit: 1,
              priceFlatRate: 2,
            },
          ],
          true,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(20);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 5)).to.equal(70);

        expect(await pricingCalculator.getPricingTotalCost(1, 50)).to.equal(
          520,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 99)).to.equal(
          1010,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(
          1020,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 101)).to.equal(
          515,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 102)).to.equal(
          209,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 103)).to.equal(
          211,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 199)).to.equal(
          403,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 200)).to.equal(
          405,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 201)).to.equal(
          203,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 202)).to.equal(
          204,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 1000)).to.equal(
          1002,
        );
      });

      it('should return cost for multiple tiers with some zero unit prices and flat rates', async () => {
        const { pricingCalculator } = await createTieredPricing(
          [
            {
              lowerBound: 1,
              upperBound: 10,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
            {
              lowerBound: 11,
              upperBound: 11,
              pricePerUnit: 0,
              priceFlatRate: 10,
            },
            {
              lowerBound: 12,
              upperBound: 50,
              pricePerUnit: 2,
              priceFlatRate: 0,
            },
            {
              lowerBound: 51,
              upperBound: 0,
              pricePerUnit: 1,
              priceFlatRate: 2,
            },
          ],
          true,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(20);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 5)).to.equal(70);

        expect(await pricingCalculator.getPricingTotalCost(1, 9)).to.equal(110);

        expect(await pricingCalculator.getPricingTotalCost(1, 10)).to.equal(
          120,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 11)).to.equal(10);

        expect(await pricingCalculator.getPricingTotalCost(1, 12)).to.equal(24);

        expect(await pricingCalculator.getPricingTotalCost(1, 13)).to.equal(26);

        expect(await pricingCalculator.getPricingTotalCost(1, 49)).to.equal(98);

        expect(await pricingCalculator.getPricingTotalCost(1, 50)).to.equal(
          100,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 51)).to.equal(53);

        expect(await pricingCalculator.getPricingTotalCost(1, 52)).to.equal(54);

        expect(await pricingCalculator.getPricingTotalCost(1, 1000)).to.equal(
          1002,
        );
      });
    });

    describe('TIERED_GRADUATED', () => {
      it('should return cost for single tier with flat unit price and flat rate', async () => {
        const { pricingCalculator } = await createTieredPricing(
          [
            {
              lowerBound: 0,
              upperBound: 0,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
          ],
          false,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(0);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(
          1020,
        );
      });

      it('should return cost for multiple tiers with flat unit prices and flat rates', async () => {
        const { pricingCalculator } = await createTieredPricing(
          [
            {
              lowerBound: 0,
              upperBound: 100,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
            {
              lowerBound: 101,
              upperBound: 101,
              pricePerUnit: 5,
              priceFlatRate: 10,
            },
            {
              lowerBound: 102,
              upperBound: 200,
              pricePerUnit: 2,
              priceFlatRate: 5,
            },
            {
              lowerBound: 201,
              upperBound: 0,
              pricePerUnit: 1,
              priceFlatRate: 2,
            },
          ],
          false,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(0);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 5)).to.equal(70);

        expect(await pricingCalculator.getPricingTotalCost(1, 50)).to.equal(
          520,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 99)).to.equal(
          1010,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(
          1020,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 101)).to.equal(
          1035,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 102)).to.equal(
          1042,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 103)).to.equal(
          1044,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 199)).to.equal(
          1236,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 200)).to.equal(
          1238,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 201)).to.equal(
          1241,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 202)).to.equal(
          1242,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 1000)).to.equal(
          2040,
        );
      });

      it('should return cost for multiple tiers with some zero unit prices and flat rates', async () => {
        const { pricingCalculator } = await createTieredPricing(
          [
            {
              lowerBound: 0,
              upperBound: 10,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
            {
              lowerBound: 11,
              upperBound: 11,
              pricePerUnit: 0,
              priceFlatRate: 10,
            },
            {
              lowerBound: 12,
              upperBound: 50,
              pricePerUnit: 2,
              priceFlatRate: 0,
            },
            {
              lowerBound: 51,
              upperBound: 0,
              pricePerUnit: 1,
              priceFlatRate: 2,
            },
          ],
          false,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(0);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 5)).to.equal(70);

        expect(await pricingCalculator.getPricingTotalCost(1, 9)).to.equal(110);

        expect(await pricingCalculator.getPricingTotalCost(1, 10)).to.equal(
          120,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 11)).to.equal(
          130,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 12)).to.equal(
          132,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 13)).to.equal(
          134,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 49)).to.equal(
          206,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 50)).to.equal(
          208,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 51)).to.equal(
          211,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 52)).to.equal(
          212,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 1000)).to.equal(
          1160,
        );
      });
    });

    async function createUsageBasedPricing(
      tiers: PricingUtils.PricingTierStruct[],
      isVolume: boolean,
    ) {
      const {
        pricingCalculator,
        pricingRegistry,
        organizationNFT,
        usageRecorder,
        mintToken,
        owner,
      } = await loadFixture(deployPricingCalculator);

      await organizationNFT.connect(owner).mint(owner);

      await usageRecorder.createMeter(1, 0);

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        tiers,
        usageMeterId: 1,
        isVolume,
        isRestricted: false,
      });

      return {
        pricingRegistry,
        pricingCalculator,
      };
    }

    describe('USAGE_BASED_VOLUME', () => {
      it('should return cost for single tier with flat unit price and flat rate', async () => {
        const { pricingCalculator } = await createUsageBasedPricing(
          [
            {
              lowerBound: 1,
              upperBound: 0,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
          ],
          true,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(20);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(
          1020,
        );
      });

      it('should return cost for multiple tiers with flat unit prices and flat rates', async () => {
        const { pricingCalculator } = await createUsageBasedPricing(
          [
            {
              lowerBound: 1,
              upperBound: 100,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
            {
              lowerBound: 101,
              upperBound: 101,
              pricePerUnit: 5,
              priceFlatRate: 10,
            },
            {
              lowerBound: 102,
              upperBound: 200,
              pricePerUnit: 2,
              priceFlatRate: 5,
            },
            {
              lowerBound: 201,
              upperBound: 0,
              pricePerUnit: 1,
              priceFlatRate: 2,
            },
          ],
          true,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(20);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 5)).to.equal(70);

        expect(await pricingCalculator.getPricingTotalCost(1, 50)).to.equal(
          520,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 99)).to.equal(
          1010,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(
          1020,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 101)).to.equal(
          515,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 102)).to.equal(
          209,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 103)).to.equal(
          211,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 199)).to.equal(
          403,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 200)).to.equal(
          405,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 201)).to.equal(
          203,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 202)).to.equal(
          204,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 1000)).to.equal(
          1002,
        );
      });

      it('should return cost for multiple tiers with some zero unit prices and flat rates', async () => {
        const { pricingCalculator } = await createUsageBasedPricing(
          [
            {
              lowerBound: 1,
              upperBound: 10,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
            {
              lowerBound: 11,
              upperBound: 11,
              pricePerUnit: 0,
              priceFlatRate: 10,
            },
            {
              lowerBound: 12,
              upperBound: 50,
              pricePerUnit: 2,
              priceFlatRate: 0,
            },
            {
              lowerBound: 51,
              upperBound: 0,
              pricePerUnit: 1,
              priceFlatRate: 2,
            },
          ],
          true,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(20);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 5)).to.equal(70);

        expect(await pricingCalculator.getPricingTotalCost(1, 9)).to.equal(110);

        expect(await pricingCalculator.getPricingTotalCost(1, 10)).to.equal(
          120,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 11)).to.equal(10);

        expect(await pricingCalculator.getPricingTotalCost(1, 12)).to.equal(24);

        expect(await pricingCalculator.getPricingTotalCost(1, 13)).to.equal(26);

        expect(await pricingCalculator.getPricingTotalCost(1, 49)).to.equal(98);

        expect(await pricingCalculator.getPricingTotalCost(1, 50)).to.equal(
          100,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 51)).to.equal(53);

        expect(await pricingCalculator.getPricingTotalCost(1, 52)).to.equal(54);

        expect(await pricingCalculator.getPricingTotalCost(1, 1000)).to.equal(
          1002,
        );
      });
    });

    describe('USAGE_BASED_GRADUATED', () => {
      it('should return cost for single tier with flat unit price and flat rate', async () => {
        const { pricingCalculator } = await createUsageBasedPricing(
          [
            {
              lowerBound: 0,
              upperBound: 0,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
          ],
          false,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(0);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(
          1020,
        );
      });

      it('should return cost for multiple tiers with flat unit prices and flat rates', async () => {
        const { pricingCalculator } = await createUsageBasedPricing(
          [
            {
              lowerBound: 0,
              upperBound: 100,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
            {
              lowerBound: 101,
              upperBound: 101,
              pricePerUnit: 5,
              priceFlatRate: 10,
            },
            {
              lowerBound: 102,
              upperBound: 200,
              pricePerUnit: 2,
              priceFlatRate: 5,
            },
            {
              lowerBound: 201,
              upperBound: 0,
              pricePerUnit: 1,
              priceFlatRate: 2,
            },
          ],
          false,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(0);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 5)).to.equal(70);

        expect(await pricingCalculator.getPricingTotalCost(1, 50)).to.equal(
          520,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 99)).to.equal(
          1010,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 100)).to.equal(
          1020,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 101)).to.equal(
          1035,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 102)).to.equal(
          1042,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 103)).to.equal(
          1044,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 199)).to.equal(
          1236,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 200)).to.equal(
          1238,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 201)).to.equal(
          1241,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 202)).to.equal(
          1242,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 1000)).to.equal(
          2040,
        );
      });

      it('should return cost for multiple tiers with some zero unit prices and flat rates', async () => {
        const { pricingCalculator } = await createUsageBasedPricing(
          [
            {
              lowerBound: 0,
              upperBound: 10,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
            {
              lowerBound: 11,
              upperBound: 11,
              pricePerUnit: 0,
              priceFlatRate: 10,
            },
            {
              lowerBound: 12,
              upperBound: 50,
              pricePerUnit: 2,
              priceFlatRate: 0,
            },
            {
              lowerBound: 51,
              upperBound: 0,
              pricePerUnit: 1,
              priceFlatRate: 2,
            },
          ],
          false,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 0)).to.equal(0);

        expect(await pricingCalculator.getPricingTotalCost(1, 1)).to.equal(30);

        expect(await pricingCalculator.getPricingTotalCost(1, 5)).to.equal(70);

        expect(await pricingCalculator.getPricingTotalCost(1, 9)).to.equal(110);

        expect(await pricingCalculator.getPricingTotalCost(1, 10)).to.equal(
          120,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 11)).to.equal(
          130,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 12)).to.equal(
          132,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 13)).to.equal(
          134,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 49)).to.equal(
          206,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 50)).to.equal(
          208,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 51)).to.equal(
          211,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 52)).to.equal(
          212,
        );

        expect(await pricingCalculator.getPricingTotalCost(1, 1000)).to.equal(
          1160,
        );
      });
    });
  });

  describe('Change Tiered Subscription Unit Quantity', () => {
    async function loadChangeUnitQuantity() {
      const contracts = await loadFixture(deployPricingCalculator);

      const { owner, organizationNFT } = contracts;

      await organizationNFT.connect(owner).setMintOpen(true);

      await organizationNFT.connect(owner).mint(owner);

      return contracts;
    }

    async function loadChangeUnitQuantityWithPricing(params: {
      initialQuantity: number;
      newQuantity: number;
      expectedAmount: bigint;
      isVolume: boolean;
      firstTier: {
        priceUnit: bigint;
        priceFlatRate: bigint;
      };
      secondTier: {
        priceUnit: bigint;
        priceFlatRate: bigint;
      };
    }) {
      const results = await loadChangeUnitQuantity();

      const { pricingRegistry, mintToken, pricingCalculator, owner } = results;

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: params.isVolume ? 1 : 0,
            upperBound: 10,
            pricePerUnit: params.firstTier.priceUnit,
            priceFlatRate: params.firstTier.priceFlatRate,
          },
          {
            lowerBound: 11,
            upperBound: 0,
            pricePerUnit: params.secondTier.priceUnit,
            priceFlatRate: params.secondTier.priceFlatRate,
          },
        ],
        isVolume: params.isVolume,
        isRestricted: false,
      });

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + getCycleDuration(2);

      await time.increase(getCycleDuration(2) / 2);

      const [token, amount] = await pricingCalculator.getChangeUnitQuantityCost(
        1,
        currentStartDate,
        currentEndDate,
        params.initialQuantity,
        params.newQuantity,
      );

      expect(token).to.equal(await mintToken.getAddress());
      expect(amount).to.equal(params.expectedAmount);

      return results;
    }

    it('should return correct prorated cost for GRADUATED pricing when quantity is increasing and more expensive', async () => {
      await loadChangeUnitQuantityWithPricing({
        initialQuantity: 5,
        newQuantity: 20,
        expectedAmount: ethers.parseUnits('42.5', 6),
        isVolume: false,
        firstTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('20', 6),
        },
        secondTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('10', 6),
        },
      });
    });

    it('should return correct prorated cost for GRADUATED pricing when quantity is decreasing and cheaper', async () => {
      await loadChangeUnitQuantityWithPricing({
        initialQuantity: 20,
        newQuantity: 5,
        expectedAmount: 0n,
        isVolume: false,
        firstTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('20', 6),
        },
        secondTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('10', 6),
        },
      });
    });

    it('should return correct prorated cost for VOLUME pricing when quantity is increasing and more expensive', async () => {
      await loadChangeUnitQuantityWithPricing({
        initialQuantity: 5,
        newQuantity: 20,
        expectedAmount: ethers.parseUnits('32.5', 6),
        isVolume: true,
        firstTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('20', 6),
        },
        secondTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('10', 6),
        },
      });
    });

    it('should return correct prorated cost for VOLUME pricing when quantity is increasing and cheaper', async () => {
      await loadChangeUnitQuantityWithPricing({
        initialQuantity: 5,
        newQuantity: 20,
        expectedAmount: 0n,
        isVolume: true,
        firstTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('100', 6),
        },
        secondTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('10', 6),
        },
      });
    });

    it('should return correct prorated cost for VOLUME pricing when quantity is increasing and the same price', async () => {
      await loadChangeUnitQuantityWithPricing({
        initialQuantity: 5,
        newQuantity: 20,
        expectedAmount: 0n,
        isVolume: true,
        firstTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('85', 6),
        },
        secondTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('10', 6),
        },
      });
    });

    it('should return zero cost if new quantity is lower than old quantity and cheaper', async () => {
      await loadChangeUnitQuantityWithPricing({
        initialQuantity: 5,
        newQuantity: 3,
        expectedAmount: 0n,
        isVolume: true,
        firstTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('85', 6),
        },
        secondTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('10', 6),
        },
      });
    });

    it('should return correct cost if new quantity is lower than old quantity and more expensive', async () => {
      await loadChangeUnitQuantityWithPricing({
        initialQuantity: 20, // 110
        newQuantity: 10, // 250
        expectedAmount: ethers.parseUnits('70', 6),
        isVolume: true,
        firstTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('200', 6),
        },
        secondTier: {
          priceUnit: ethers.parseUnits('5', 6),
          priceFlatRate: ethers.parseUnits('10', 6),
        },
      });
    });

    it('should revert if old quantity is the same as the new quantity', async () => {
      const { pricingCalculator, pricingRegistry, owner, mintToken } =
        await loadChangeUnitQuantity();

      const currentStartDate = (await time.latest()) - 100;
      const currentEndDate = currentStartDate + 10000;

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('5', 6),
            priceFlatRate: ethers.parseUnits('85', 6),
          },
        ],
        isVolume: true,
        isRestricted: false,
      });

      await expect(
        pricingCalculator.getChangeUnitQuantityCost(
          1,
          currentStartDate,
          currentEndDate,
          10,
          10,
        ),
      ).to.be.revertedWithCustomError(
        pricingCalculator,
        'UnitQuantityIsTheSame',
      );
    });

    it('should revert if date range zero', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      await expect(
        pricingCalculator.getChangeUnitQuantityCost(1, 0, 0, 0, 1),
      ).to.be.revertedWith('Invalid date range');
    });

    it('should revert if date range is in the past', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      const currentStartDate = await time.latest();

      await expect(
        pricingCalculator.getChangeUnitQuantityCost(
          1,
          currentStartDate - 1000,
          currentStartDate - 500,
          0,
          1,
        ),
      ).to.be.revertedWith('Invalid date range');
    });

    it('should revert if date range is in the future', async () => {
      const { pricingCalculator } = await loadFixture(deployPricingCalculator);

      const currentStartDate = await time.latest();

      await expect(
        pricingCalculator.getChangeUnitQuantityCost(
          1,
          currentStartDate + 1000,
          currentStartDate + 1500,
          0,
          1,
        ),
      ).to.be.revertedWith('Invalid date range');
    });

    it('should revert if pricing is ONE_TIME', async () => {
      const { pricingCalculator, pricingRegistry, owner } =
        await loadChangeUnitQuantity();

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + 10000;

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 100,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingCalculator.getChangeUnitQuantityCost(
          1,
          currentStartDate,
          currentEndDate,
          0,
          1,
        ),
      ).to.be.revertedWithCustomError(pricingCalculator, 'InvalidChargeStyle');
    });

    it('should revert if pricing is FLAT_RATE', async () => {
      const { pricingCalculator, pricingRegistry, mintToken, owner } =
        await loadChangeUnitQuantity();

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + 10000;

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 100,
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 1,
      });

      await expect(
        pricingCalculator.getChangeUnitQuantityCost(
          1,
          currentStartDate,
          currentEndDate,
          0,
          1,
        ),
      ).to.be.revertedWithCustomError(pricingCalculator, 'InvalidChargeStyle');
    });

    it('should revert if pricing is USAGE_BASED_VOLUME', async () => {
      const {
        pricingCalculator,
        pricingRegistry,
        mintToken,
        usageRecorder,
        owner,
      } = await loadChangeUnitQuantity();

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + 10000;

      await usageRecorder.connect(owner).createMeter(1, 1);

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        usageMeterId: 1,
        isVolume: true,
        isRestricted: false,
      });

      await expect(
        pricingCalculator.getChangeUnitQuantityCost(
          1,
          currentStartDate,
          currentEndDate,
          0,
          1,
        ),
      ).to.be.revertedWithCustomError(pricingCalculator, 'InvalidChargeStyle');
    });

    it('should revert if pricing is USAGE_BASED_GRADUATED', async () => {
      const {
        pricingCalculator,
        pricingRegistry,
        mintToken,
        usageRecorder,
        owner,
      } = await loadChangeUnitQuantity();

      const currentStartDate = await time.latest();
      const currentEndDate = currentStartDate + 10000;

      await usageRecorder.connect(owner).createMeter(1, 1);

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 10,
            priceFlatRate: 20,
          },
        ],
        usageMeterId: 1,
        isVolume: false,
        isRestricted: false,
      });

      await expect(
        pricingCalculator.getChangeUnitQuantityCost(
          1,
          currentStartDate,
          currentEndDate,
          0,
          1,
        ),
      ).to.be.revertedWithCustomError(pricingCalculator, 'InvalidChargeStyle');
    });
  });
});
