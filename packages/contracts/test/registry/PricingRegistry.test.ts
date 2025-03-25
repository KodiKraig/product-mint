import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { PricingUtils } from '../../typechain-types/contracts/registry/IPricingRegistry';
import { PricingRegistry, UsageRecorder } from '../../typechain-types';
import calculateInterfaceId from '../../utils/calculate-interface-id';
import { getCycleDuration } from '../../utils/cycle-duration';

describe('PricingRegistry', () => {
  async function deployPricingRegistry() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

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

    const MintToken = await hre.ethers.getContractFactory('MintToken');
    const mintToken = await MintToken.deploy();

    await paymentEscrow.setWhitelistedToken(await mintToken.getAddress(), true);

    const UsageRecorder = await hre.ethers.getContractFactory('UsageRecorder');
    const usageRecorder = await UsageRecorder.deploy(contractRegistry);

    const PricingRegistry = await hre.ethers.getContractFactory(
      'PricingRegistry',
    );
    const pricingRegistry = await PricingRegistry.deploy(contractRegistry);

    const OrganizationAdmin = await hre.ethers.getContractFactory(
      'OrganizationAdmin',
    );
    const organizationAdmin = await OrganizationAdmin.deploy(contractRegistry);

    await contractRegistry.setOrganizationNFT(organizationNFT);
    await contractRegistry.setUsageRecorder(usageRecorder);
    await contractRegistry.setPricingRegistry(pricingRegistry);
    await contractRegistry.setOrgAdmin(organizationAdmin);
    await contractRegistry.setPaymentEscrow(paymentEscrow);

    return {
      organizationNFT,
      usageRecorder,
      organizationAdmin,
      pricingRegistry,
      contractRegistry,
      paymentEscrow,
      mintToken,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('should set the correct dependencies', async () => {
      const { pricingRegistry, contractRegistry } = await loadFixture(
        deployPricingRegistry,
      );

      expect(await pricingRegistry.registry()).to.equal(contractRegistry);
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { pricingRegistry } = await loadFixture(deployPricingRegistry);

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await pricingRegistry.supportsInterface(interfaceId)).to.be.true;
    });
  });

  describe('Grant Restricted Access', () => {
    it('should grant/revoke restricted access', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 100,
        token: ethers.ZeroAddress,
        isRestricted: true,
      });

      await expect(
        pricingRegistry
          .connect(owner)
          .setRestrictedAccess(1, [owner, otherAccount], [true, true]),
      )
        .to.emit(pricingRegistry, 'RestrictedAccessGranted')
        .withArgs(1, 1, owner, true)
        .and.to.emit(pricingRegistry, 'RestrictedAccessGranted')
        .withArgs(1, 1, otherAccount, true);

      expect(await pricingRegistry.restrictedAccess(1, owner)).to.be.true;
      expect(await pricingRegistry.restrictedAccess(1, otherAccount)).to.be
        .true;

      await expect(
        pricingRegistry
          .connect(owner)
          .setRestrictedAccess(1, [otherAccount], [false]),
      )
        .to.emit(pricingRegistry, 'RestrictedAccessGranted')
        .withArgs(1, 1, otherAccount, false);

      expect(await pricingRegistry.restrictedAccess(1, owner)).to.be.true;
      expect(await pricingRegistry.restrictedAccess(1, otherAccount)).to.be
        .false;
    });

    it('should revert if not the owner', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 100,
        token: ethers.ZeroAddress,
        isRestricted: true,
      });

      await expect(
        pricingRegistry
          .connect(otherAccount)
          .setRestrictedAccess(1, [owner], [true]),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('should revert if no product pass owners are provided', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 100,
        token: ethers.ZeroAddress,
        isRestricted: true,
      });

      await expect(
        pricingRegistry.connect(owner).setRestrictedAccess(1, [], [true]),
      ).to.be.revertedWith('Incorrect lengths');
    });

    it('should revert if product pass owners and is restricted length mismatch', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 100,
        token: ethers.ZeroAddress,
        isRestricted: true,
      });

      await expect(
        pricingRegistry
          .connect(owner)
          .setRestrictedAccess(1, [owner], [true, false]),
      ).to.be.revertedWith('Incorrect lengths');
    });
  });

  describe('Checkout', () => {
    describe('Validate Checkout', () => {
      it('should revert if quantity is 0 for tiered volume or tiered graduated charge style', async () => {
        const { pricingRegistry, organizationNFT, mintToken, owner } =
          await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
          organizationId: 1,
          token: await mintToken.getAddress(),
          chargeFrequency: 1,
          tiers: [
            {
              lowerBound: 1,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          isVolume: true,
          isRestricted: false,
        });

        await expect(
          pricingRegistry.connect(owner).validateCheckout(1, owner, 1, 0),
        ).to.be.revertedWithCustomError(pricingRegistry, 'InvalidQuantity');
      });

      it('should not revert if pricing ids are valid for native token', async () => {
        const { pricingRegistry, organizationNFT, owner } = await loadFixture(
          deployPricingRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 100,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 1000,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        const [token, cycleDurations] = await pricingRegistry
          .connect(owner)
          .validateCheckoutBatch(1, owner, [1, 2], [0, 0]);

        expect(token).to.equal(ethers.ZeroAddress);
        expect(cycleDurations).to.deep.equal([0, 0]);
      });

      it('should not revert if pricing ids are valid for ERC20 token', async () => {
        const {
          pricingRegistry,
          organizationNFT,
          usageRecorder,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const mintTokenAddress = await mintToken.getAddress();

        await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
          organizationId: 1,
          flatPrice: 12,
          token: mintTokenAddress,
          chargeFrequency: 3,
          isRestricted: false,
        });

        await usageRecorder.connect(owner).createMeter(1, 1);

        await pricingRegistry
          .connect(owner)
          .createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 2,
            tiers: [
              {
                lowerBound: 1,
                upperBound: 0,
                pricePerUnit: 100,
                priceFlatRate: 10,
              },
            ],
            usageMeterId: 1,
            isVolume: true,
            isRestricted: false,
          });

        await pricingRegistry
          .connect(owner)
          .createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 3,
            tiers: [
              {
                lowerBound: 0,
                upperBound: 0,
                pricePerUnit: 100,
                priceFlatRate: 10,
              },
            ],
            usageMeterId: 1,
            isVolume: false,
            isRestricted: false,
          });

        await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
          organizationId: 1,
          token: mintTokenAddress,
          chargeFrequency: 4,
          tiers: [
            {
              lowerBound: 0,
              upperBound: 0,
              pricePerUnit: 10,
              priceFlatRate: 1,
            },
          ],
          isVolume: false,
          isRestricted: false,
        });

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 100,
          token: mintTokenAddress,
          isRestricted: false,
        });

        const [token, cycleDurations] = await pricingRegistry
          .connect(owner)
          .validateCheckoutBatch(1, owner, [1, 2, 3, 4, 5], [0, 0, 0, 5, 0]);

        expect(token).to.equal(mintTokenAddress);
        expect(cycleDurations).to.deep.equal([
          getCycleDuration(3),
          getCycleDuration(2),
          getCycleDuration(3),
          getCycleDuration(4),
          0,
        ]);
      });

      it('should revert if checking out with 2 different ERC20s', async () => {
        const {
          pricingRegistry,
          organizationNFT,
          mintToken,
          owner,
          paymentEscrow,
        } = await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const MintToken = await hre.ethers.getContractFactory('MintToken');
        const mintToken2 = await MintToken.deploy();

        await paymentEscrow.setWhitelistedToken(
          await mintToken2.getAddress(),
          true,
        );

        const mintTokenAddress = await mintToken.getAddress();

        await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
          organizationId: 1,
          flatPrice: 100,
          token: mintTokenAddress,
          chargeFrequency: 0,
          isRestricted: false,
        });

        const mintToken2Address = await mintToken2.getAddress();

        await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
          organizationId: 1,
          flatPrice: 100,
          token: mintToken2Address,
          chargeFrequency: 0,
          isRestricted: false,
        });

        await expect(
          pricingRegistry
            .connect(owner)
            .validateCheckoutBatch(1, owner, [1, 2], [0, 0]),
        ).to.be.revertedWithCustomError(
          pricingRegistry,
          'PricingTokensMismatch',
        );
      });

      it('should revert if no pricing ids are provided', async () => {
        const { pricingRegistry, owner } = await loadFixture(
          deployPricingRegistry,
        );

        await expect(
          pricingRegistry
            .connect(owner)
            .validateCheckoutBatch(1, owner, [], []),
        ).to.be.revertedWith('No pricing IDs provided');
      });

      it('should revert if pricing ids are not authorized', async () => {
        const { pricingRegistry, organizationNFT, owner } = await loadFixture(
          deployPricingRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 100,
          token: ethers.ZeroAddress,
          isRestricted: true,
        });

        await expect(
          pricingRegistry
            .connect(owner)
            .validateCheckoutBatch(1, owner, [1], [0]),
        ).to.be.revertedWithCustomError(
          pricingRegistry,
          'PricingRestrictedAccess',
        );
      });

      it('should revert if pricing id does not exist for org', async () => {
        const { pricingRegistry, organizationNFT, owner, otherAccount } =
          await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await organizationNFT.connect(otherAccount).mint(otherAccount);

        await pricingRegistry.connect(otherAccount).createOneTimePricing({
          organizationId: 2,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await expect(
          pricingRegistry
            .connect(owner)
            .validateCheckoutBatch(1, owner, [1, 2], [0, 0]),
        ).to.be.revertedWithCustomError(
          pricingRegistry,
          'PricingNotAuthorized',
        );
      });

      it('should revert if pricing is not active', async () => {
        const { pricingRegistry, organizationNFT, owner } = await loadFixture(
          deployPricingRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await pricingRegistry.connect(owner).setPricingActive(1, false);

        await expect(
          pricingRegistry
            .connect(owner)
            .validateCheckoutBatch(1, owner, [1], [0]),
        ).to.be.revertedWithCustomError(pricingRegistry, 'PricingInactive');
      });

      it('should revert if pricing tokens mismatch', async () => {
        const { pricingRegistry, organizationNFT, mintToken, owner } =
          await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await pricingRegistry.connect(owner).setPricingToken(1, mintToken);

        await expect(
          pricingRegistry
            .connect(owner)
            .validateCheckoutBatch(1, owner, [1, 2], [0, 0]),
        ).to.be.revertedWithCustomError(
          pricingRegistry,
          'PricingTokensMismatch',
        );
      });

      it('should revert if pricing has invalid quantities for pricing', async () => {
        const { pricingRegistry, organizationNFT, owner } = await loadFixture(
          deployPricingRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await expect(
          pricingRegistry
            .connect(owner)
            .validateCheckoutBatch(1, owner, [1], [1]),
        ).to.be.revertedWithCustomError(pricingRegistry, 'InvalidQuantity');
      });
    });

    describe('Validate Org Pricing', () => {
      it('should revert if pricing does not exist for org', async () => {
        const { pricingRegistry, owner } = await loadFixture(
          deployPricingRegistry,
        );

        await expect(
          pricingRegistry.connect(owner).validateOrgPricing(1, [1]),
        ).to.be.revertedWithCustomError(
          pricingRegistry,
          'PricingNotAuthorized',
        );
      });

      it('should revert if pricing does not belong to org', async () => {
        const { pricingRegistry, organizationNFT, owner, otherAccount } =
          await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await expect(
          pricingRegistry.validateOrgPricing(2, [1]),
        ).to.be.revertedWithCustomError(
          pricingRegistry,
          'PricingNotAuthorized',
        );

        await organizationNFT.connect(owner).mint(otherAccount);

        await expect(
          pricingRegistry.validateOrgPricing(2, [1, 2]),
        ).to.be.revertedWithCustomError(
          pricingRegistry,
          'PricingNotAuthorized',
        );
      });

      it('should not revert if pricing exists for org', async () => {
        const { pricingRegistry, organizationNFT, owner } = await loadFixture(
          deployPricingRegistry,
        );

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        });

        await pricingRegistry.connect(owner).validateOrgPricing(1, [1, 2, 3]);
      });
    });
  });

  describe('Get Pricing Details', () => {
    it('should get pricing details for multiple pricing ids', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 10,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 20,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await organizationNFT.connect(otherAccount).mint(otherAccount);

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: 30,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: 40,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      const pricing = await pricingRegistry.getPricingBatch([1, 2, 3, 4]);

      expect(pricing.length).to.equal(4);

      expect(pricing[0]).to.deep.equal([
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        10,
        0,
        true,
        false,
      ]);

      expect(pricing[1]).to.deep.equal([
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        20,
        0,
        true,
        false,
      ]);

      expect(pricing[2]).to.deep.equal([
        2,
        0,
        0,
        [],
        ethers.ZeroAddress,
        30,
        0,
        true,
        false,
      ]);

      expect(pricing[3]).to.deep.equal([
        2,
        0,
        0,
        [],
        ethers.ZeroAddress,
        40,
        0,
        true,
        false,
      ]);
    });

    it('should get pricing details for all pricing for org', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 10,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 20,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await organizationNFT.connect(otherAccount).mint(otherAccount);

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: 30,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: 40,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      const [pricingIds, pricing] = await pricingRegistry.getOrgPricing(1);

      expect(pricingIds.length).to.equal(2);

      expect(pricing.length).to.equal(2);
    });
  });

  describe('Pricing Creation', () => {
    it('cannot create pricing if org does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await expect(
        pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        }),
      )
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(1);

      await expect(
        pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          chargeFrequency: 0,
          isRestricted: false,
        }),
      )
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(1);

      await expect(
        pricingRegistry.connect(owner).createTieredSubscriptionPricing({
          organizationId: 1,
          token: ethers.ZeroAddress,
          chargeFrequency: 0,
          tiers: [],
          isVolume: false,
          isRestricted: false,
        }),
      )
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(1);

      await expect(
        pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
          organizationId: 1,
          token: ethers.ZeroAddress,
          chargeFrequency: 0,
          tiers: [],
          usageMeterId: 0,
          isVolume: true,
          isRestricted: false,
        }),
      )
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(1);
    });

    it('cannt create pricing if not org owner', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await expect(
        pricingRegistry.connect(otherAccount).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        }),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        pricingRegistry
          .connect(otherAccount)
          .createFlatRateSubscriptionPricing({
            organizationId: 1,
            flatPrice: 0,
            token: ethers.ZeroAddress,
            chargeFrequency: 0,
            isRestricted: false,
          }),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        pricingRegistry.connect(otherAccount).createTieredSubscriptionPricing({
          organizationId: 1,
          token: ethers.ZeroAddress,
          chargeFrequency: 0,
          tiers: [],
          isVolume: false,
          isRestricted: false,
        }),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        pricingRegistry
          .connect(otherAccount)
          .createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: ethers.ZeroAddress,
            chargeFrequency: 0,
            tiers: [],
            usageMeterId: 0,
            isVolume: true,
            isRestricted: false,
          }),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set tiers if pricing does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await expect(pricingRegistry.connect(owner).setPricingTiers(1, []))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(0);
    });

    it('cannot set tiers if org does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await expect(pricingRegistry.connect(owner).setPricingTiers(1, []))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(0);
    });

    it('cannot set tiers if pricing does not belong to org', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await expect(
        pricingRegistry.connect(owner).createOneTimePricing({
          organizationId: 1,
          flatPrice: 0,
          token: ethers.ZeroAddress,
          isRestricted: false,
        }),
      )
        .to.emit(pricingRegistry, 'PricingCreated')
        .withArgs(1, 1);

      await expect(
        pricingRegistry.connect(otherAccount).setPricingTiers(1, []),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set tiers if charge style is ONE_TIME', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingTiers(1, [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ]),
      ).to.be.revertedWithCustomError(pricingRegistry, 'InvalidChargeStyle');
    });

    it('cannot set tiers if charge style is FLAT_RATE', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: await mintToken.getAddress(),
        chargeFrequency: 0,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingTiers(1, [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ]),
      ).to.be.revertedWithCustomError(pricingRegistry, 'InvalidChargeStyle');
    });

    it('cannot set empty tiers', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 0,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ],
        isVolume: false,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingTiers(1, []),
      ).to.be.revertedWithCustomError(pricingRegistry, 'NoTiersFound');
    });

    describe('TIERED_VOLUME', () => {
      async function assertInvalidTierVolumeTiers(
        tiers: PricingUtils.PricingTierStruct[],
        error: string,
      ) {
        const { pricingRegistry, organizationNFT, mintToken, owner } =
          await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await expect(
          pricingRegistry.connect(owner).createTieredSubscriptionPricing({
            organizationId: 1,
            token: await mintToken.getAddress(),
            chargeFrequency: 2,
            tiers,
            isVolume: true,
            isRestricted: false,
          }),
        ).to.be.revertedWithCustomError(pricingRegistry, error);
      }

      it('cannot set if lower bound is not 1', async () => {
        await assertInvalidTierVolumeTiers(
          [
            {
              lowerBound: 0,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          'VolumeLowerBoundMustBeOne',
        );

        await assertInvalidTierVolumeTiers(
          [
            {
              lowerBound: 0,
              upperBound: 100,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
            {
              lowerBound: 101,
              upperBound: 0,
              pricePerUnit: 200,
              priceFlatRate: 20,
            },
          ],
          'VolumeLowerBoundMustBeOne',
        );
      });

      it('cannot set if lower bound is greater than upper bound', async () => {
        await assertInvalidTierVolumeTiers(
          [
            {
              lowerBound: 1,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },

            {
              lowerBound: 0,
              upperBound: 100,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          'LowerBoundGreaterThanUpperBound',
        );

        await assertInvalidTierVolumeTiers(
          [
            {
              lowerBound: 1,
              upperBound: 3,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
            {
              lowerBound: 4,
              upperBound: 3,
              pricePerUnit: 200,
              priceFlatRate: 20,
            },
          ],
          'LastTierUpperBoundMustBeZeroToRepresentInfinity',
        );
      });

      it('cannot set tiers if tier upper and next lower bound are not contiguous', async () => {
        await assertInvalidTierVolumeTiers(
          [
            {
              lowerBound: 1,
              upperBound: 100,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
            {
              lowerBound: 102,
              upperBound: 0,
              pricePerUnit: 200,
              priceFlatRate: 20,
            },
          ],
          'LowerBoundMustBeOneGreaterThanPreviousUpperBound',
        );

        await assertInvalidTierVolumeTiers(
          [
            {
              lowerBound: 1,
              upperBound: 100,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
            {
              lowerBound: 100,
              upperBound: 0,
              pricePerUnit: 200,
              priceFlatRate: 20,
            },
          ],
          'LowerBoundMustBeOneGreaterThanPreviousUpperBound',
        );

        await assertInvalidTierVolumeTiers(
          [
            {
              lowerBound: 1,
              upperBound: 100,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
            {
              lowerBound: 98,
              upperBound: 0,
              pricePerUnit: 200,
              priceFlatRate: 20,
            },
          ],
          'LowerBoundMustBeOneGreaterThanPreviousUpperBound',
        );
      });

      it('can set single tier', async () => {
        const { pricingRegistry, organizationNFT, mintToken, owner } =
          await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const mintTokenAddress = await mintToken.getAddress();

        await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
          organizationId: 1,
          token: mintTokenAddress,
          chargeFrequency: 2,
          tiers: [
            {
              lowerBound: 1,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          isVolume: true,
          isRestricted: false,
        });

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          2,
          2,
          [[1n, 0n, 100n, 10n]],
          mintTokenAddress,
          0,
          0,
          true,
          false,
        ]);

        await expect(
          pricingRegistry.connect(owner).setPricingTiers(1, [
            {
              lowerBound: 1,
              upperBound: 0,
              pricePerUnit: 10,
              priceFlatRate: 20,
            },
          ]),
        )
          .to.emit(pricingRegistry, 'PricingUpdated')
          .withArgs(1, 1);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          2,
          2,
          [[1n, 0n, 10n, 20n]],
          mintTokenAddress,
          0,
          0,
          true,
          false,
        ]);
      });

      it('can set multiple tiers and update tiers', async () => {
        const { pricingRegistry, organizationNFT, mintToken, owner } =
          await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const mintTokenAddress = await mintToken.getAddress();

        await expect(
          pricingRegistry.connect(owner).createTieredSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 2,
            tiers: [
              {
                lowerBound: 1,
                upperBound: 100,
                pricePerUnit: 100,
                priceFlatRate: 10,
              },
              {
                lowerBound: 101,
                upperBound: 200,
                pricePerUnit: 200,
                priceFlatRate: 20,
              },
              {
                lowerBound: 201,
                upperBound: 0,
                pricePerUnit: 300,
                priceFlatRate: 30,
              },
            ],
            isVolume: true,
            isRestricted: false,
          }),
        )
          .to.emit(pricingRegistry, 'PricingCreated')
          .withArgs(1, 1);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          2,
          2,
          [
            [1n, 100n, 100n, 10n],
            [101n, 200n, 200n, 20n],
            [201n, 0n, 300n, 30n],
          ],
          mintTokenAddress,
          0,
          0,
          true,
          false,
        ]);

        await expect(
          pricingRegistry.connect(owner).setPricingTiers(1, [
            {
              lowerBound: 1,
              upperBound: 150,
              pricePerUnit: 50,
              priceFlatRate: 5,
            },
            {
              lowerBound: 151,
              upperBound: 202,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
            {
              lowerBound: 203,
              upperBound: 0,
              pricePerUnit: 200,
              priceFlatRate: 10,
            },
          ]),
        )
          .to.emit(pricingRegistry, 'PricingUpdated')
          .withArgs(1, 1);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          2,
          2,
          [
            [1n, 150n, 50n, 5n],
            [151n, 202n, 100n, 10n],
            [203n, 0n, 200n, 10n],
          ],
          mintTokenAddress,
          0,
          0,
          true,
          false,
        ]);
      });
    });

    describe('TIERED_GRADUATED', () => {
      async function assertInvalidTierGraduatedTiers(
        tiers: PricingUtils.PricingTierStruct[],
        error: string,
      ) {
        const { pricingRegistry, organizationNFT, mintToken, owner } =
          await loadFixture(deployPricingRegistry);

        const mintTokenAddress = await mintToken.getAddress();

        await organizationNFT.connect(owner).mint(owner);

        await expect(
          pricingRegistry.connect(owner).createTieredSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 3,
            tiers,
            isVolume: false,
            isRestricted: false,
          }),
        ).to.be.revertedWithCustomError(pricingRegistry, error);
      }

      it('cannot set tiers if lower bound is not 0', async () => {
        await assertInvalidTierGraduatedTiers(
          [
            {
              lowerBound: 1,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          'GraduatedLowerBoundMustBeZero',
        );
      });

      it('can set single tier', async () => {
        const { pricingRegistry, organizationNFT, mintToken, owner } =
          await loadFixture(deployPricingRegistry);

        const mintTokenAddress = await mintToken.getAddress();

        await organizationNFT.connect(owner).mint(owner);

        await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
          organizationId: 1,
          token: mintTokenAddress,
          chargeFrequency: 3,
          tiers: [
            {
              lowerBound: 0,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          isVolume: false,
          isRestricted: false,
        });

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          3,
          3,
          [[0n, 0n, 100n, 10n]],
          mintTokenAddress,
          0,
          0,
          true,
          false,
        ]);
      });

      it('can set multiple tiers and update tiers', async () => {
        const { pricingRegistry, organizationNFT, mintToken, owner } =
          await loadFixture(deployPricingRegistry);

        const mintTokenAddress = await mintToken.getAddress();

        await organizationNFT.connect(owner).mint(owner);

        await expect(
          pricingRegistry.connect(owner).createTieredSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 3,
            tiers: [
              {
                lowerBound: 0,
                upperBound: 100,
                pricePerUnit: 100,
                priceFlatRate: 10,
              },
              {
                lowerBound: 101,
                upperBound: 200,
                pricePerUnit: 200,
                priceFlatRate: 20,
              },
              {
                lowerBound: 201,
                upperBound: 0,
                pricePerUnit: 300,
                priceFlatRate: 30,
              },
            ],
            isVolume: false,
            isRestricted: false,
          }),
        )
          .to.emit(pricingRegistry, 'PricingCreated')
          .withArgs(1, 1);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          3,
          3,
          [
            [0n, 100n, 100n, 10n],
            [101n, 200n, 200n, 20n],
            [201n, 0n, 300n, 30n],
          ],
          mintTokenAddress,
          0,
          0,
          true,
          false,
        ]);

        await pricingRegistry.connect(owner).setPricingTiers(1, [
          {
            lowerBound: 0,
            upperBound: 150,
            pricePerUnit: 50,
            priceFlatRate: 5,
          },
          {
            lowerBound: 151,
            upperBound: 202,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
          {
            lowerBound: 203,
            upperBound: 0,
            pricePerUnit: 200,
            priceFlatRate: 10,
          },
        ]);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          3,
          3,
          [
            [0n, 150n, 50n, 5n],
            [151n, 202n, 100n, 10n],
            [203n, 0n, 200n, 10n],
          ],
          mintTokenAddress,
          0,
          0,
          true,
          false,
        ]);
      });
    });

    describe('USAGE_BASED_VOLUME', () => {
      async function assertInvalidUsageVolumeTiers(
        tiers: PricingUtils.PricingTierStruct[],
        error: string,
      ) {
        const {
          pricingRegistry,
          organizationNFT,
          usageRecorder,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const mintTokenAddress = await mintToken.getAddress();

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 4,
            tiers,
            usageMeterId: 1,
            isVolume: true,
            isRestricted: false,
          }),
        ).to.be.revertedWithCustomError(pricingRegistry, error);
      }

      it('cannot set tiers if lower bound is not 1', async () => {
        await assertInvalidUsageVolumeTiers(
          [
            {
              lowerBound: 0,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          'VolumeLowerBoundMustBeOne',
        );
      });

      it('can set single tier', async () => {
        const {
          pricingRegistry,
          organizationNFT,
          usageRecorder,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const mintTokenAddress = await mintToken.getAddress();

        await usageRecorder.connect(owner).createMeter(1, 0);

        await pricingRegistry
          .connect(owner)
          .createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 3,
            tiers: [
              {
                lowerBound: 1,
                upperBound: 0,
                pricePerUnit: 100,
                priceFlatRate: 10,
              },
            ],
            usageMeterId: 1,
            isVolume: true,
            isRestricted: false,
          });

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          4,
          3,
          [[1n, 0n, 100n, 10n]],
          mintTokenAddress,
          0,
          1,
          true,
          false,
        ]);
      });

      it('can set multiple tiers and update tiers', async () => {
        const {
          pricingRegistry,
          organizationNFT,
          usageRecorder,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await usageRecorder.connect(owner).createMeter(1, 0);

        const mintTokenAddress = await mintToken.getAddress();

        await pricingRegistry
          .connect(owner)
          .createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 2,
            tiers: [
              {
                lowerBound: 1,
                upperBound: 100,
                pricePerUnit: 100,
                priceFlatRate: 10,
              },
              {
                lowerBound: 101,
                upperBound: 200,
                pricePerUnit: 200,
                priceFlatRate: 20,
              },
              {
                lowerBound: 201,
                upperBound: 0,
                pricePerUnit: 300,
                priceFlatRate: 30,
              },
            ],
            usageMeterId: 1,
            isVolume: true,
            isRestricted: false,
          });

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          4,
          2,
          [
            [1n, 100n, 100n, 10n],
            [101n, 200n, 200n, 20n],
            [201n, 0n, 300n, 30n],
          ],
          mintTokenAddress,
          0,
          1,
          true,
          false,
        ]);

        await pricingRegistry.connect(owner).setPricingTiers(1, [
          {
            lowerBound: 1,
            upperBound: 150,
            pricePerUnit: 50,
            priceFlatRate: 5,
          },
          {
            lowerBound: 151,
            upperBound: 202,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
          {
            lowerBound: 203,
            upperBound: 0,
            pricePerUnit: 200,
            priceFlatRate: 30,
          },
        ]);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          4,
          2,
          [
            [1n, 150n, 50n, 5n],
            [151n, 202n, 100n, 10n],
            [203n, 0n, 200n, 30n],
          ],
          mintTokenAddress,
          0,
          1,
          true,
          false,
        ]);
      });
    });

    describe('USAGE_BASED_GRADUATED', () => {
      async function assertInvalidUsageGraduatedTiers(
        tiers: PricingUtils.PricingTierStruct[],
        error: string,
      ) {
        const {
          pricingRegistry,
          organizationNFT,
          usageRecorder,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        await usageRecorder.connect(owner).createMeter(1, 0);

        const mintTokenAddress = await mintToken.getAddress();

        await expect(
          pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 4,
            tiers,
            usageMeterId: 1,
            isVolume: false,
            isRestricted: false,
          }),
        ).to.be.revertedWithCustomError(pricingRegistry, error);
      }

      it('cannot set tiers if lower bound is not 0', async () => {
        await assertInvalidUsageGraduatedTiers(
          [
            {
              lowerBound: 1,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          'GraduatedLowerBoundMustBeZero',
        );
      });

      it('can set single tier', async () => {
        const {
          pricingRegistry,
          organizationNFT,
          usageRecorder,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const mintTokenAddress = await mintToken.getAddress();

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 2,
            tiers: [
              {
                lowerBound: 0,
                upperBound: 0,
                pricePerUnit: 100,
                priceFlatRate: 10,
              },
            ],
            usageMeterId: 1,
            isVolume: false,
            isRestricted: false,
          }),
        )
          .to.emit(pricingRegistry, 'PricingCreated')
          .withArgs(1, 1);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          5,
          2,
          [[0n, 0n, 100n, 10n]],
          mintTokenAddress,
          0,
          1,
          true,
          false,
        ]);
      });

      it('can set multiple tiers and update tiers', async () => {
        const {
          pricingRegistry,
          organizationNFT,
          usageRecorder,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        await organizationNFT.connect(owner).mint(owner);

        const mintTokenAddress = await mintToken.getAddress();

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
            organizationId: 1,
            token: mintTokenAddress,
            chargeFrequency: 3,
            tiers: [
              {
                lowerBound: 0,
                upperBound: 0,
                pricePerUnit: 100,
                priceFlatRate: 10,
              },
            ],
            usageMeterId: 1,
            isVolume: false,
            isRestricted: false,
          }),
        )
          .to.emit(pricingRegistry, 'PricingCreated')
          .withArgs(1, 1);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          5,
          3,
          [[0n, 0n, 100n, 10n]],
          mintTokenAddress,
          0,
          1,
          true,
          false,
        ]);

        await expect(
          pricingRegistry.connect(owner).setPricingTiers(1, [
            {
              lowerBound: 0,
              upperBound: 100,
              pricePerUnit: 10,
              priceFlatRate: 1,
            },
            {
              lowerBound: 101,
              upperBound: 200,
              pricePerUnit: 20,
              priceFlatRate: 2,
            },
            {
              lowerBound: 201,
              upperBound: 300,
              pricePerUnit: 30,
              priceFlatRate: 3,
            },
            {
              lowerBound: 301,
              upperBound: 400,
              pricePerUnit: 40,
              priceFlatRate: 4,
            },
            {
              lowerBound: 401,
              upperBound: 0,
              pricePerUnit: 50,
              priceFlatRate: 5,
            },
          ]),
        )
          .to.emit(pricingRegistry, 'PricingUpdated')
          .withArgs(1, 1);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          5,
          3,
          [
            [0n, 100n, 10n, 1n],
            [101n, 200n, 20n, 2n],
            [201n, 300n, 30n, 3n],
            [301n, 400n, 40n, 4n],
            [401n, 0n, 50n, 5n],
          ],
          mintTokenAddress,
          0,
          1,
          true,
          false,
        ]);
      });
    });
  });

  describe('Set pricing token', () => {
    it('cannot set token if pricing does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner, mintToken } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await expect(pricingRegistry.connect(owner).setPricingToken(1, mintToken))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(0);
    });

    it('cannot set token if not whitelisted', async () => {
      const {
        pricingRegistry,
        organizationNFT,
        owner,
        mintToken,
        paymentEscrow,
      } = await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await paymentEscrow.setWhitelistedToken(
        await mintToken.getAddress(),
        false,
      );

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingToken(1, mintToken),
      ).to.be.revertedWithCustomError(pricingRegistry, 'TokenNotWhitelisted');
    });

    it('cannot set native token for a recurring charge', async () => {
      const { pricingRegistry, organizationNFT, owner, mintToken } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      const mintTokenAddress = await mintToken.getAddress();

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 0,
        isRestricted: false,
        flatPrice: 0,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingToken(1, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(pricingRegistry, 'RequiresERC20Token');
    });

    it('cannot set token if not the org owner', async () => {
      const {
        pricingRegistry,
        organizationNFT,
        owner,
        otherAccount,
        mintToken,
      } = await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(otherAccount).setPricingToken(1, mintToken),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('can set pricing token if IERC20', async () => {
      const { pricingRegistry, organizationNFT, owner, mintToken } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      const mintTokenAddress = await mintToken.getAddress();

      await expect(
        pricingRegistry.connect(owner).setPricingToken(1, mintTokenAddress),
      )
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        mintTokenAddress,
        0,
        0,
        true,
        false,
      ]);
    });

    it('can set pricing token to ERC20 and back to native token', async () => {
      const { pricingRegistry, organizationNFT, owner, mintToken } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      const mintTokenAddress = await mintToken.getAddress();

      await expect(
        pricingRegistry.connect(owner).setPricingToken(1, mintTokenAddress),
      )
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        mintTokenAddress,
        0,
        0,
        true,
        false,
      ]);

      await expect(
        pricingRegistry.connect(owner).setPricingToken(1, ethers.ZeroAddress),
      )
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        0,
        0,
        true,
        false,
      ]);
    });
  });

  describe('Set flat price', () => {
    it('cannot set flat price if pricing does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await expect(pricingRegistry.connect(owner).setPricingFlatPrice(1, 100))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(0);
    });

    it('cannot set flat price if not the org owner', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(otherAccount).setPricingFlatPrice(1, 100),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set flat price if charge style is not ONE_TIME or FLAT_RATE', async () => {
      const {
        pricingRegistry,
        organizationNFT,
        usageRecorder,
        mintToken,
        owner,
      } = await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      const mintTokenAddress = await mintToken.getAddress();

      await usageRecorder.connect(owner).createMeter(1, 0);

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 0,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ],
        usageMeterId: 1,
        isVolume: false,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingFlatPrice(1, 100),
      ).to.be.revertedWithCustomError(
        pricingRegistry,
        'RequiresOneTimeOrFlatRateChargeStyle',
      );

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 0,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ],
        usageMeterId: 1,
        isVolume: true,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingFlatPrice(2, 100),
      ).to.be.revertedWithCustomError(
        pricingRegistry,
        'RequiresOneTimeOrFlatRateChargeStyle',
      );

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 0,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ],
        isVolume: false,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingFlatPrice(3, 100),
      ).to.be.revertedWithCustomError(
        pricingRegistry,
        'RequiresOneTimeOrFlatRateChargeStyle',
      );

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 0,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ],
        isVolume: true,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingFlatPrice(4, 100),
      ).to.be.revertedWithCustomError(
        pricingRegistry,
        'RequiresOneTimeOrFlatRateChargeStyle',
      );
    });

    it('can set/update flat price if charge style is ONE_TIME', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(pricingRegistry.connect(owner).setPricingFlatPrice(1, 100))
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        100,
        0,
        true,
        false,
      ]);

      await expect(pricingRegistry.connect(owner).setPricingFlatPrice(1, 200))
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        200,
        0,
        true,
        false,
      ]);
    });

    it('can set/update flat price if charge style is FLAT_RATE', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      const mintTokenAddress = await mintToken.getAddress();

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 0,
        isRestricted: false,
      });

      await expect(pricingRegistry.connect(owner).setPricingFlatPrice(1, 100))
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        1,
        0,
        [],
        mintTokenAddress,
        100,
        0,
        true,
        false,
      ]);

      await expect(pricingRegistry.connect(owner).setPricingFlatPrice(1, 200))
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        1,
        0,
        [],
        mintTokenAddress,
        200,
        0,
        true,
        false,
      ]);
    });
  });

  describe('Set usage meter ID', () => {
    it('cannot set usage meter ID if pricing does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await expect(pricingRegistry.connect(owner).setPricingUsageMeterId(1, 1))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(0);
    });

    it('cannot set usage meter ID if not the org owner', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(otherAccount).setPricingUsageMeterId(1, 1),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set usage meter ID if usage meter does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(owner).setPricingUsageMeterId(1, 1),
      ).to.be.revertedWith('Usage meter not found');
    });

    describe('Incorrect charge style', () => {
      async function assertInvalidChargeStyle(
        createPricing: (params: {
          pricingRegistry: PricingRegistry;
          usageRecorder: UsageRecorder;
          mintTokenAddress: string;
        }) => Promise<any>,
      ) {
        const {
          pricingRegistry,
          organizationNFT,
          usageRecorder,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        const mintTokenAddress = await mintToken.getAddress();

        await organizationNFT.connect(owner).mint(owner);

        await createPricing({
          pricingRegistry,
          usageRecorder,
          mintTokenAddress,
        });

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          pricingRegistry.connect(owner).setPricingUsageMeterId(1, 1),
        ).to.be.revertedWithCustomError(
          pricingRegistry,
          'RequiresUsageChargeStyle',
        );
      }

      it('cannot set usage meter ID if charge style is ONE_TIME', async () => {
        await assertInvalidChargeStyle(({ pricingRegistry }) =>
          pricingRegistry.createOneTimePricing({
            organizationId: 1,
            flatPrice: 0,
            token: ethers.ZeroAddress,
            isRestricted: false,
          }),
        );
      });

      it('cannot set usage meter ID if charge style is FLAT_RATE', async () => {
        await assertInvalidChargeStyle(
          ({ pricingRegistry, mintTokenAddress }) =>
            pricingRegistry.createFlatRateSubscriptionPricing({
              organizationId: 1,
              flatPrice: 0,
              token: mintTokenAddress,
              chargeFrequency: 0,
              isRestricted: false,
            }),
        );
      });

      it('cannot set usage meter ID if charge style is TIERED_VOLUME', async () => {
        await assertInvalidChargeStyle(
          ({ pricingRegistry, mintTokenAddress }) =>
            pricingRegistry.createTieredSubscriptionPricing({
              organizationId: 1,
              token: mintTokenAddress,
              chargeFrequency: 0,
              tiers: [
                {
                  lowerBound: 1,
                  upperBound: 0,
                  pricePerUnit: 100,
                  priceFlatRate: 10,
                },
              ],
              isVolume: true,
              isRestricted: false,
            }),
        );
      });

      it('cannot set usage meter ID if charge style is TIERED_GRADUATED', async () => {
        await assertInvalidChargeStyle(
          ({ pricingRegistry, mintTokenAddress }) =>
            pricingRegistry.createTieredSubscriptionPricing({
              organizationId: 1,
              token: mintTokenAddress,
              chargeFrequency: 0,
              tiers: [
                {
                  lowerBound: 0,
                  upperBound: 0,
                  pricePerUnit: 100,
                  priceFlatRate: 10,
                },
              ],
              isVolume: false,
              isRestricted: false,
            }),
        );
      });
    });

    describe('Can set/update usage meter ID', () => {
      async function assertCanSetUpdateUsageMeterId(isVolume: boolean) {
        const {
          pricingRegistry,
          usageRecorder,
          organizationNFT,
          mintToken,
          owner,
        } = await loadFixture(deployPricingRegistry);

        const mintTokenAddress = await mintToken.getAddress();

        await organizationNFT.connect(owner).mint(owner);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await pricingRegistry.createUsageBasedSubscriptionPricing({
          organizationId: 1,
          token: mintTokenAddress,
          chargeFrequency: 3,
          tiers: [
            {
              lowerBound: isVolume ? 1 : 0,
              upperBound: 0,
              pricePerUnit: 100,
              priceFlatRate: 10,
            },
          ],
          usageMeterId: 1,
          isVolume,
          isRestricted: false,
        });

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          isVolume ? 4 : 5,
          3,
          [[isVolume ? 1 : 0n, 0n, 100n, 10n]],
          mintTokenAddress,
          0,
          1,
          true,
          false,
        ]);

        await usageRecorder.connect(owner).createMeter(1, 0);

        await expect(
          pricingRegistry.connect(owner).setPricingUsageMeterId(1, 2),
        )
          .to.emit(pricingRegistry, 'PricingUpdated')
          .withArgs(1, 1);

        expect(await pricingRegistry.getPricing(1)).to.deep.equal([
          1,
          isVolume ? 4 : 5,
          3,
          [[isVolume ? 1 : 0n, 0n, 100n, 10n]],
          mintTokenAddress,
          0,
          2,
          true,
          false,
        ]);
      }

      it('can set/update usage meter ID if charge style is USAGE_BASED_VOLUME', async () => {
        await assertCanSetUpdateUsageMeterId(true);
      });

      it('can set/update usage meter ID if charge style is USAGE_BASED_GRADUATED', async () => {
        await assertCanSetUpdateUsageMeterId(false);
      });
    });
  });

  describe('Set Pricing Active', () => {
    it('can set/update pricing status', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      const mintTokenAddress = await mintToken.getAddress();

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        isRestricted: false,
      });

      await expect(pricingRegistry.connect(owner).setPricingActive(1, false))
        .to.emit(pricingRegistry, 'PricingStatusChanged')
        .withArgs(1, 1, false);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        mintTokenAddress,
        0,
        0,
        false,
        false,
      ]);

      await expect(pricingRegistry.connect(owner).setPricingActive(1, true))
        .to.emit(pricingRegistry, 'PricingStatusChanged')
        .withArgs(1, 1, true);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        mintTokenAddress,
        0,
        0,
        true,
        false,
      ]);
    });

    it('cannot set pricing status if not org owner', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(otherAccount).setPricingActive(1, false),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set pricing status if pricing does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await expect(pricingRegistry.connect(owner).setPricingActive(1, false))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(0);
    });
  });

  describe('Set Pricing Restricted', () => {
    it('can set/update pricing restricted', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(pricingRegistry.connect(owner).setPricingRestricted(1, true))
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        0,
        0,
        true,
        true,
      ]);

      await expect(
        pricingRegistry.connect(owner).setPricingRestricted(1, false),
      )
        .to.emit(pricingRegistry, 'PricingUpdated')
        .withArgs(1, 1);

      expect(await pricingRegistry.getPricing(1)).to.deep.equal([
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        0,
        0,
        true,
        false,
      ]);
    });

    it('should revert if not the org owner', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await expect(
        pricingRegistry.connect(otherAccount).setPricingRestricted(1, true),
      ).to.be.revertedWith('Not an admin of the organization');
    });
  });

  describe('Get Pricing Details', () => {
    it('cannot get pricing details if pricing does not exist', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await expect(pricingRegistry.getPricing(0)).to.be.revertedWith(
        'Pricing not found',
      );

      await expect(pricingRegistry.getPricing(1)).to.be.revertedWith(
        'Pricing not found',
      );

      await expect(pricingRegistry.getPricing(2)).to.be.revertedWith(
        'Pricing not found',
      );
    });
  });

  describe('Get Org Pricing IDs', () => {
    it('return empty array if no pricing for org', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      expect(await pricingRegistry.getOrgPricingIds(1)).to.deep.equal([]);
    });

    it('return pricing IDs if pricing for org', async () => {
      const { pricingRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployPricingRegistry);

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      expect(await pricingRegistry.getOrgPricingIds(1)).to.deep.equal([1]);

      await organizationNFT.connect(otherAccount).mint(otherAccount);

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: 1,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      expect(await pricingRegistry.getOrgPricingIds(2)).to.deep.equal([2]);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 2,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: 1,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      expect(await pricingRegistry.getOrgPricingIds(1)).to.deep.equal([1, 3]);

      expect(await pricingRegistry.getOrgPricingIds(2)).to.deep.equal([2, 4]);
    });
  });

  describe('Get Pricing Cycle Duration', () => {
    it('should return 0 if pricing is one time', async () => {
      const { pricingRegistry, organizationNFT, owner } = await loadFixture(
        deployPricingRegistry,
      );

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      expect(await pricingRegistry.getCycleDuration(1)).to.equal(0);
    });

    it('should return 1 day if pricing is daily', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      const mintTokenAddress = await mintToken.getAddress();

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 0,
        isRestricted: false,
      });

      expect(await pricingRegistry.getCycleDuration(1)).to.equal(
        getCycleDuration(0),
      );
    });

    it('should return 7 days if pricing is weekly', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      const mintTokenAddress = await mintToken.getAddress();

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 1,
        isRestricted: false,
      });

      expect(await pricingRegistry.getCycleDuration(1)).to.equal(
        getCycleDuration(1),
      );
    });

    it('should return 30 days if pricing is monthly', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      const mintTokenAddress = await mintToken.getAddress();

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 2,
        isRestricted: false,
      });

      expect(await pricingRegistry.getCycleDuration(1)).to.equal(
        getCycleDuration(2),
      );
    });

    it('should return 90 days if pricing is quarterly', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      const mintTokenAddress = await mintToken.getAddress();

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 3,
        isRestricted: false,
      });

      expect(await pricingRegistry.getCycleDuration(1)).to.equal(
        getCycleDuration(3),
      );
    });

    it('should return 365 days if pricing is yearly', async () => {
      const { pricingRegistry, organizationNFT, mintToken, owner } =
        await loadFixture(deployPricingRegistry);

      const mintTokenAddress = await mintToken.getAddress();

      await organizationNFT.connect(owner).mint(owner);

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 4,
        isRestricted: false,
      });

      expect(await pricingRegistry.getCycleDuration(1)).to.equal(
        getCycleDuration(4),
      );
    });

    it('should return pricing cycle duration batch', async () => {
      const {
        pricingRegistry,
        organizationNFT,
        usageRecorder,
        mintToken,
        owner,
      } = await loadFixture(deployPricingRegistry);

      const mintTokenAddress = await mintToken.getAddress();

      await organizationNFT.connect(owner).mint(owner);

      await usageRecorder.connect(owner).createMeter(1, 0);

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: 0,
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 0,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 1,
        token: mintTokenAddress,
        chargeFrequency: 1,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 0,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 1,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: mintTokenAddress,
        chargeFrequency: 2,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 3,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ],
        usageMeterId: 1,
        isVolume: true,
        isRestricted: false,
      });

      await pricingRegistry.connect(owner).createTieredSubscriptionPricing({
        organizationId: 1,
        token: mintTokenAddress,
        chargeFrequency: 4,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: 100,
            priceFlatRate: 10,
          },
        ],
        isVolume: false,
        isRestricted: false,
      });

      expect(
        await pricingRegistry.getCycleDurationBatch([1, 2, 3, 4, 5, 6, 7, 8]),
      ).to.deep.equal([
        0,
        getCycleDuration(0),
        getCycleDuration(1),
        getCycleDuration(0),
        getCycleDuration(1),
        getCycleDuration(2),
        getCycleDuration(3),
        getCycleDuration(4),
      ]);
    });
  });

  describe('Get Charge Frequency Cycle Duration', () => {
    it('should return 1 day if charge frequency is daily', async () => {
      const { pricingRegistry } = await loadFixture(deployPricingRegistry);

      expect(await pricingRegistry.getChargeFrequencyCycleDuration(0)).to.equal(
        getCycleDuration(0),
      );
    });

    it('should return 7 days if charge frequency is weekly', async () => {
      const { pricingRegistry } = await loadFixture(deployPricingRegistry);

      expect(await pricingRegistry.getChargeFrequencyCycleDuration(1)).to.equal(
        getCycleDuration(1),
      );
    });

    it('should return 30 days if charge frequency is monthly', async () => {
      const { pricingRegistry } = await loadFixture(deployPricingRegistry);

      expect(await pricingRegistry.getChargeFrequencyCycleDuration(2)).to.equal(
        getCycleDuration(2),
      );
    });
  });

  it('should return 90 days if charge frequency is quarterly', async () => {
    const { pricingRegistry } = await loadFixture(deployPricingRegistry);

    expect(await pricingRegistry.getChargeFrequencyCycleDuration(3)).to.equal(
      getCycleDuration(3),
    );
  });

  it('should return 365 days if charge frequency is yearly', async () => {
    const { pricingRegistry } = await loadFixture(deployPricingRegistry);

    expect(await pricingRegistry.getChargeFrequencyCycleDuration(4)).to.equal(
      getCycleDuration(4),
    );
  });

  it('should revert if charge frequency is invalid', async () => {
    const { pricingRegistry } = await loadFixture(deployPricingRegistry);

    await expect(pricingRegistry.getChargeFrequencyCycleDuration(5)).to.be
      .reverted;
  });
});
