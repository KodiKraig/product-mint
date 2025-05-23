import hre, { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import { RenewalProcessor } from '../../typechain-types';
import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { getCycleDuration } from '../../utils/cycle-duration';
import calculateInterfaceId from '../../utils/calculate-interface-id';

async function assertNoRenewalEventEmitted(renewalProcessor: RenewalProcessor) {
  const events = await renewalProcessor.queryFilter(
    renewalProcessor.filters.RenewalProcessed,
  );
  expect(events).to.have.lengthOf(0);
}

describe('RenewalProcessor', () => {
  async function loadRenewalProcessor() {
    const results = await loadWithPurchasedFlatRateSubscription();

    const RenewalProcessor = await hre.ethers.getContractFactory(
      'RenewalProcessor',
    );
    const renewalProcessor = await RenewalProcessor.deploy(
      results.contractRegistry,
    );

    return { ...results, renewalProcessor };
  }

  async function loadRenewalProcessorWithOneTimePurchasedProduct() {
    const results = await loadRenewalProcessor();

    const {
      productRegistry,
      pricingRegistry,
      organizationNFT,
      purchaseManager,
      owner,
      otherAccount,
    } = results;

    // Create a new organization
    await organizationNFT.connect(owner).mint(owner);

    // Create a product
    await productRegistry.connect(owner).createProduct({
      orgId: 2,
      name: 'Test Product',
      description: 'Test Description',
      imageUrl: 'https://test.com/image.png',
      externalUrl: 'https://test.com',
      isTransferable: false,
    });

    // Create a pricing
    await pricingRegistry.connect(owner).createOneTimePricing({
      organizationId: 2,
      flatPrice: ethers.parseEther('0.1'),
      token: ethers.ZeroAddress,
      isRestricted: false,
    });

    // Link the pricing to the product
    await productRegistry.connect(owner).linkPricing(2, [2]);

    // Purchase the product pass
    await purchaseManager.connect(otherAccount).purchaseProducts(
      {
        to: otherAccount,
        organizationId: 2,
        productIds: [2],
        pricingIds: [2],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      },
      { value: ethers.parseEther('0.1') },
    );

    return results;
  }

  describe('Deployment', () => {
    it('should set the contract registry', async () => {
      const { renewalProcessor, contractRegistry } =
        await loadRenewalProcessor();

      expect(await renewalProcessor.registry()).to.equal(contractRegistry);
    });
  });

  describe('Supports Interface', () => {
    it('should support the IRenewalProcessor interface', async () => {
      const { renewalProcessor } = await loadRenewalProcessor();

      const interfaceId = calculateInterfaceId([
        'getAllPassRenewalStatusBatch(uint256[])',
        'getAllPassRenewalStatus(uint256)',
        'getSingleProductRenewalStatus(uint256,uint256)',
        'getSingleProductRenewalStatusBatch(uint256[],uint256[])',
        'processAllPassRenewal(uint256)',
        'processAllPassRenewalBatch(uint256[])',
        'processSingleProductRenewal(uint256,uint256)',
        'processSingleProductRenewalBatch(uint256[],uint256[])',
      ]);

      expect(await renewalProcessor.supportsInterface(interfaceId)).to.be.true;
    });

    it('should support the IERC165 interface', async () => {
      const { renewalProcessor } = await loadRenewalProcessor();

      expect(await renewalProcessor.supportsInterface('0x01ffc9a7')).to.be.true;
    });

    it('should not support other interfaces', async () => {
      const { renewalProcessor } = await loadRenewalProcessor();

      expect(await renewalProcessor.supportsInterface('0xffffffff')).to.be
        .false;
    });
  });

  describe('Get All Pass Renewal Status Batch', () => {
    it('should revert for invalid pass indexes', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getAllPassRenewalStatusBatch([1, 2]),
      ).to.be.revertedWith('Pass ID must be less than total supply');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getAllPassRenewalStatusBatch([0, 1]),
      ).to.be.revertedWith('Pass ID must be greater than 0');
    });

    it('should revert if no pass ids are provided', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor.connect(otherAccount).getAllPassRenewalStatusBatch([]),
      ).to.be.revertedWith('No pass IDs provided');
    });
  });

  describe('Get All Pass Renewal Status', () => {
    it('should revert for invalid pass id', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor.connect(otherAccount).getAllPassRenewalStatus(0),
      ).to.be.revertedWith('Pass ID must be greater than 0');

      await expect(
        renewalProcessor.connect(otherAccount).getAllPassRenewalStatus(10),
      ).to.be.revertedWith('Pass ID must be less than total supply');
    });

    it('should return the renewal status for all products on the pass', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      const renewalStatuses = await renewalProcessor
        .connect(otherAccount)
        .getAllPassRenewalStatus(1);

      expect(renewalStatuses).to.have.lengthOf(1);
      expect(renewalStatuses[0].passId).to.equal(1);
      expect(renewalStatuses[0].productId).to.equal(1);
      expect(renewalStatuses[0].renewalStatus).to.equal(2);
      expect(renewalStatuses[0].subStatus).to.equal(0);
    });
  });

  describe('Get Single Product Renewal Status', () => {
    it('should revert for invalid pass id', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getSingleProductRenewalStatus(0, 1),
      ).to.be.revertedWith('Pass ID must be greater than 0');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getSingleProductRenewalStatus(10, 1),
      ).to.be.revertedWith('Pass ID must be less than total supply');
    });

    it('should return the renewal status for the product on the pass', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      const renewalStatus = await renewalProcessor
        .connect(otherAccount)
        .getSingleProductRenewalStatus(1, 1);

      expect(renewalStatus.passId).to.equal(1);
      expect(renewalStatus.productId).to.equal(1);
      expect(renewalStatus.renewalStatus).to.equal(2);
      expect(renewalStatus.subStatus).to.equal(0);
    });
  });

  describe('Get Single Product Renewal Status Batch', () => {
    it('should revert for invalid array lengths', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getSingleProductRenewalStatusBatch([1], []),
      ).to.be.revertedWith('No product IDs provided');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getSingleProductRenewalStatusBatch([], [1]),
      ).to.be.revertedWith('No pass IDs provided');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getSingleProductRenewalStatusBatch([], []),
      ).to.be.revertedWith('No pass IDs provided');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getSingleProductRenewalStatusBatch([1], [1, 2]),
      ).to.be.revertedWith('Pass IDs and product IDs must be the same length');
    });

    it('should revert for invalid pass ids', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getSingleProductRenewalStatusBatch([1, 2], [1, 2]),
      ).to.be.revertedWith('Pass ID must be less than total supply');
    });

    it('should revert if the the product does not exist on the pass', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .getSingleProductRenewalStatusBatch([1], [2]),
      ).to.be.revertedWith('Subscription does not exist');
    });

    it('should return the renewal status for the products on the passes', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      const renewalStatuses = await renewalProcessor
        .connect(otherAccount)
        .getSingleProductRenewalStatusBatch([1], [1]);

      expect(renewalStatuses).to.have.lengthOf(1);
      expect(renewalStatuses[0].passId).to.equal(1);
      expect(renewalStatuses[0].productId).to.equal(1);
      expect(renewalStatuses[0].renewalStatus).to.equal(2);
      expect(renewalStatuses[0].subStatus).to.equal(0);
    });
  });

  describe('Process Single Product Renewal', () => {
    it('should revert for invalid pass index', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewal(0, 1),
      ).to.be.revertedWith('Pass ID must be greater than 0');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewal(10, 1),
      ).to.be.revertedWith('Pass ID must be less than total supply');
    });

    it('should not emit an event if the renewal is not ready', async () => {
      const { renewalProcessor } = await loadRenewalProcessor();

      // TEST
      await renewalProcessor.processSingleProductRenewal(1, 1);

      await assertNoRenewalEventEmitted(renewalProcessor);
    });

    it('should not emit an event even if the subscription is cancelled and not past due', async () => {
      const { renewalProcessor, purchaseManager, otherAccount } =
        await loadRenewalProcessor();

      await purchaseManager
        .connect(otherAccount)
        .cancelSubscription(1, 1, true);

      // TEST
      await renewalProcessor.processSingleProductRenewal(1, 1);

      await assertNoRenewalEventEmitted(renewalProcessor);
    });

    it('should emit cancelled event if the subscription is cancelled and past due', async () => {
      const {
        renewalProcessor,
        purchaseManager,
        subscriptionEscrow,
        mintToken,
        otherAccount,
      } = await loadRenewalProcessor();

      // Cancel subscription
      await purchaseManager
        .connect(otherAccount)
        .cancelSubscription(1, 1, true);

      // Increase time to past due
      const [subscription] = await subscriptionEscrow.getSubscription(1, 1);
      await time.increaseTo(subscription.endDate + 1n);

      // TEST
      await expect(renewalProcessor.processSingleProductRenewal(1, 1))
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(1, 1, 1, 3);

      // Assert no token balance change
      expect(await mintToken.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits('90', 6),
      );
    });

    it('should emit event if the subscription is paused and past due', async () => {
      const {
        renewalProcessor,
        purchaseManager,
        subscriptionEscrow,
        mintToken,
        owner,
        otherAccount,
      } = await loadRenewalProcessor();

      // Pause subscription
      await subscriptionEscrow.connect(owner).setSubscriptionsPausable(1, true);
      await purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true);

      // TEST
      await expect(renewalProcessor.processSingleProductRenewal(1, 1))
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(1, 1, 1, 4);

      // Assert no token balance change
      expect(await mintToken.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits('90', 6),
      );
    });

    it('should emit success event if the renewal succeeds', async () => {
      const { renewalProcessor, subscriptionEscrow, mintToken, otherAccount } =
        await loadRenewalProcessor();

      // Increase time to past due
      let [subscription, status] = await subscriptionEscrow.getSubscription(
        1,
        1,
      );
      await time.increaseTo(subscription.endDate + 1n);

      // TEST
      await expect(renewalProcessor.processSingleProductRenewal(1, 1))
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(1, 1, 1, 0);

      // Assert subscription status is active
      [subscription, status] = await subscriptionEscrow.getSubscription(1, 1);
      expect(status).to.equal(0);

      // Assert token balance change for renewal
      expect(await mintToken.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits('80', 6),
      );
    });

    it('should emit failed event if the renewal fails', async () => {
      const {
        renewalProcessor,
        subscriptionEscrow,
        paymentEscrow,
        mintToken,
        otherAccount,
      } = await loadRenewalProcessor();

      // Increase time to past due
      let [subscription, status] = await subscriptionEscrow.getSubscription(
        1,
        1,
      );
      await time.increaseTo(subscription.endDate + 1n);

      // Set token approval to 0 so renewal fails
      await mintToken.connect(otherAccount).approve(paymentEscrow, 0);

      // TEST
      await expect(renewalProcessor.processSingleProductRenewal(1, 1))
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(1, 1, 1, 1);

      // Assert subscription status is still past due
      [subscription, status] = await subscriptionEscrow.getSubscription(1, 1);
      expect(status).to.equal(2);

      // Assert no token balance change
      expect(await mintToken.balanceOf(otherAccount.address)).to.equal(
        ethers.parseUnits('90', 6),
      );
    });
  });

  describe('Process Single Product Renewal Batch', () => {
    it('should revert for invalid array lengths', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewalBatch([1], []),
      ).to.be.revertedWith('No product IDs provided');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewalBatch([], [1]),
      ).to.be.revertedWith('No pass IDs provided');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewalBatch([], []),
      ).to.be.revertedWith('No pass IDs provided');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewalBatch([1], [1, 2]),
      ).to.be.revertedWith('Pass IDs and product IDs must be the same length');
    });

    it('should revert for invalid pass ids', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewalBatch([1, 2], [1, 2]),
      ).to.be.revertedWith('Pass ID must be less than total supply');
    });

    it('should revert if the the product does not exist on the pass', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewalBatch([1], [2]),
      ).to.be.revertedWith('Subscription does not exist');
    });

    it('should process renewals for multiple products on a pass', async () => {
      const {
        renewalProcessor,
        mintToken,
        purchaseManager,
        paymentEscrow,
        otherAccount,
        otherAccount2,
        subscriptionEscrow,
      } = await loadRenewalProcessor();

      await mintToken
        .connect(otherAccount2)
        .mint(otherAccount2, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount2)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      // Mint Pass 2
      await purchaseManager.connect(otherAccount2).purchaseProducts({
        to: otherAccount2,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      // Advance time to past due
      const [subscription] = await subscriptionEscrow.getSubscription(2, 1);
      await time.increaseTo(subscription.endDate + 1n);

      // TEST - Process renewal for pass 1 and pass 2
      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processSingleProductRenewalBatch([1, 2], [1, 1]),
      )
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(1, 1, 1, 0)
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(1, 2, 1, 0);
    });
  });

  describe('Process All Pass Renewal', () => {
    it('should revert for invalid pass id', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor.connect(otherAccount).processAllPassRenewal(0),
      ).to.be.revertedWith('Pass ID must be greater than 0');

      await expect(
        renewalProcessor.connect(otherAccount).processAllPassRenewal(10),
      ).to.be.revertedWith('Pass ID must be less than total supply');
    });

    it('should ignore a product pass that does not have any subscriptions', async () => {
      const { renewalProcessor, owner } =
        await loadRenewalProcessorWithOneTimePurchasedProduct();

      // Process the renewal
      await renewalProcessor.connect(owner).processAllPassRenewal(1);

      // Assert no renewal event was emitted
      await assertNoRenewalEventEmitted(renewalProcessor);
    });
  });

  describe('Process All Pass Renewal Batch', () => {
    it('should revert for invalid pass input', async () => {
      const { renewalProcessor, otherAccount } = await loadRenewalProcessor();

      await expect(
        renewalProcessor.connect(otherAccount).processAllPassRenewalBatch([]),
      ).to.be.revertedWith('No pass IDs provided');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processAllPassRenewalBatch([1, 2]),
      ).to.be.revertedWith('Pass ID must be less than total supply');

      await expect(
        renewalProcessor
          .connect(otherAccount)
          .processAllPassRenewalBatch([0, 1]),
      ).to.be.revertedWith('Pass ID must be greater than 0');
    });

    it('should ignore a product pass that does not have any subscriptions', async () => {
      const { renewalProcessor, owner } =
        await loadRenewalProcessorWithOneTimePurchasedProduct();

      // Process the renewal
      await renewalProcessor.connect(owner).processAllPassRenewalBatch([1]);

      // Assert no renewal event was emitted
      await assertNoRenewalEventEmitted(renewalProcessor);
    });

    it('should process all renewals for multiple subscriptions and passes across multiple orgs', async () => {
      const {
        renewalProcessor,
        purchaseManager,
        mintToken,
        organizationNFT,
        productRegistry,
        pricingRegistry,
        paymentEscrow,
        subscriptionEscrow,
        owner,
        otherAccount,
        otherAccount2,
        otherAccount3,
        otherAccount4,
      } = await loadRenewalProcessorWithOneTimePurchasedProduct();

      // Pass 1 -> Org 1 -> Product 1 w/ SUCCESS renewal
      // Pass 2 -> Org 2 -> Product 2 w/ one time purchase
      // Pass 3 -> Org 3 -> Product 3 w/ SUCCESS renewal; Product 4 w/ SUCCESS renewal
      // Pass 4 -> Org 3 -> Product 3 w/ CANCELLED renewal; Product 4 w/ skipped renewal
      // Pass 5 -> Org 3 -> Product 3 w/ PAUSED renewal; Product 4 w/ FAILED renewal

      // Create Org 3
      await organizationNFT.connect(owner).mint(owner);

      // Create Product 3
      await productRegistry.connect(owner).createProduct({
        orgId: 3,
        name: 'Test Product 3',
        description: 'Test Description',
        imageUrl: 'https://test.com/image.png',
        externalUrl: 'https://test.com',
        isTransferable: false,
      });

      // Create Weekly Flat Rate Pricing
      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 3,
        flatPrice: ethers.parseUnits('1', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 2,
      });

      // Create Monthly Flat Rate Pricing
      await pricingRegistry.connect(owner).createFlatRateSubscriptionPricing({
        organizationId: 3,
        flatPrice: ethers.parseUnits('1', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 3,
      });

      // Create Product 4
      await productRegistry.connect(owner).createProduct({
        orgId: 3,
        name: 'Test Product 4',
        description: 'Test Description',
        imageUrl: 'https://test.com/image.png',
        externalUrl: 'https://test.com',
        isTransferable: false,
      });

      // Link Pricing
      await productRegistry.connect(owner).linkPricing(3, [3, 4]);
      await productRegistry.connect(owner).linkPricing(4, [3, 4]);

      // Mint tokens for purchase
      await mintToken
        .connect(otherAccount2)
        .mint(otherAccount2, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount2)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount3)
        .mint(otherAccount3, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount3)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount4)
        .mint(otherAccount4, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount4)
        .approve(paymentEscrow, ethers.parseUnits('2', 6));

      // Mint Pass 3
      await purchaseManager.connect(otherAccount2).purchaseProducts({
        to: otherAccount2,
        organizationId: 3,
        productIds: [3, 4],
        pricingIds: [3, 3],
        quantities: [0, 0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      // Mint Pass 4
      await purchaseManager.connect(otherAccount3).purchaseProducts({
        to: otherAccount3,
        organizationId: 3,
        productIds: [3, 4],
        pricingIds: [3, 4],
        quantities: [0, 0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });
      // Cancel subscription 3
      await purchaseManager
        .connect(otherAccount3)
        .cancelSubscription(4, 3, true);

      // Mint Pass 5
      await purchaseManager.connect(otherAccount4).purchaseProducts({
        to: otherAccount4,
        organizationId: 3,
        productIds: [3, 4],
        pricingIds: [3, 3],
        quantities: [0, 0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      // Pause subscription 3
      await subscriptionEscrow.connect(owner).setSubscriptionsPausable(3, true);
      await purchaseManager
        .connect(otherAccount4)
        .pauseSubscription(5, 3, true);

      // Assert total passes is 5
      expect(await purchaseManager.passSupply()).to.equal(5);

      // Assert renewal status - NOT READY
      let renewalStatuses = await renewalProcessor.getAllPassRenewalStatusBatch(
        Array.from({ length: 5 }, (_, i) => i + 1),
      );

      expect(renewalStatuses.length).to.equal(5);

      // Assert renewal status for pass 1
      expect(renewalStatuses[0].length).to.equal(1);
      expect(renewalStatuses[0][0].subscription.orgId).to.equal(1);
      expect(renewalStatuses[0][0].passId).to.equal(1);
      expect(renewalStatuses[0][0].productId).to.equal(1);
      expect(renewalStatuses[0][0].renewalStatus).to.equal(2);
      expect(renewalStatuses[0][0].subStatus).to.equal(0);

      // Assert renewal status for pass 2
      expect(renewalStatuses[1].length).to.equal(0);

      // Assert renewal status for pass 3
      expect(renewalStatuses[2].length).to.equal(2);
      expect(renewalStatuses[2][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[2][0].passId).to.equal(3);
      expect(renewalStatuses[2][0].productId).to.equal(3);
      expect(renewalStatuses[2][0].renewalStatus).to.equal(2);
      expect(renewalStatuses[2][0].subStatus).to.equal(0);
      expect(renewalStatuses[2][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[2][1].passId).to.equal(3);
      expect(renewalStatuses[2][1].productId).to.equal(4);
      expect(renewalStatuses[2][1].renewalStatus).to.equal(2);
      expect(renewalStatuses[2][1].subStatus).to.equal(0);

      // Assert renewal status for pass 4
      expect(renewalStatuses[3].length).to.equal(2);
      expect(renewalStatuses[3][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[3][0].passId).to.equal(4);
      expect(renewalStatuses[3][0].productId).to.equal(3);
      expect(renewalStatuses[3][0].renewalStatus).to.equal(2);
      expect(renewalStatuses[3][0].subStatus).to.equal(1);
      expect(renewalStatuses[3][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[3][1].passId).to.equal(4);
      expect(renewalStatuses[3][1].productId).to.equal(4);
      expect(renewalStatuses[3][1].renewalStatus).to.equal(2);
      expect(renewalStatuses[3][1].subStatus).to.equal(0);

      // Assert renewal status for pass 5
      expect(renewalStatuses[4].length).to.equal(2);
      expect(renewalStatuses[4][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[4][0].passId).to.equal(5);
      expect(renewalStatuses[4][0].productId).to.equal(3);
      expect(renewalStatuses[4][0].renewalStatus).to.equal(2);
      expect(renewalStatuses[4][0].subStatus).to.equal(3);
      expect(renewalStatuses[4][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[4][1].passId).to.equal(5);
      expect(renewalStatuses[4][1].productId).to.equal(4);
      expect(renewalStatuses[4][1].renewalStatus).to.equal(2);
      expect(renewalStatuses[4][1].subStatus).to.equal(0);

      // Advance time to past due for weekly flat rate subscription
      await time.increaseTo((await time.latest()) + getCycleDuration(2));

      // Assert renewal status
      renewalStatuses = await renewalProcessor.getAllPassRenewalStatusBatch(
        Array.from({ length: 5 }, (_, i) => i + 1),
      );

      expect(renewalStatuses.length).to.equal(5);

      // Assert renewal status for pass 1
      expect(renewalStatuses[0].length).to.equal(1);
      expect(renewalStatuses[0][0].subscription.orgId).to.equal(1);
      expect(renewalStatuses[0][0].passId).to.equal(1);
      expect(renewalStatuses[0][0].productId).to.equal(1);
      expect(renewalStatuses[0][0].renewalStatus).to.equal(5);
      expect(renewalStatuses[0][0].subStatus).to.equal(2);

      // Assert renewal status for pass 2
      expect(renewalStatuses[1].length).to.equal(0);

      // Assert renewal status for pass 3
      expect(renewalStatuses[2].length).to.equal(2);
      expect(renewalStatuses[2][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[2][0].passId).to.equal(3);
      expect(renewalStatuses[2][0].productId).to.equal(3);
      expect(renewalStatuses[2][0].renewalStatus).to.equal(5);
      expect(renewalStatuses[2][0].subStatus).to.equal(2);
      expect(renewalStatuses[2][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[2][1].passId).to.equal(3);
      expect(renewalStatuses[2][1].productId).to.equal(4);
      expect(renewalStatuses[2][1].renewalStatus).to.equal(5);
      expect(renewalStatuses[2][1].subStatus).to.equal(2);

      // Assert renewal status for pass 4
      expect(renewalStatuses[3].length).to.equal(2);
      expect(renewalStatuses[3][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[3][0].passId).to.equal(4);
      expect(renewalStatuses[3][0].productId).to.equal(3);
      expect(renewalStatuses[3][0].renewalStatus).to.equal(3);
      expect(renewalStatuses[3][0].subStatus).to.equal(2);
      expect(renewalStatuses[3][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[3][1].passId).to.equal(4);
      expect(renewalStatuses[3][1].productId).to.equal(4);
      expect(renewalStatuses[3][1].renewalStatus).to.equal(2);
      expect(renewalStatuses[3][1].subStatus).to.equal(0);

      // Assert renewal status for pass 5
      expect(renewalStatuses[4].length).to.equal(2);
      expect(renewalStatuses[4][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[4][0].passId).to.equal(5);
      expect(renewalStatuses[4][0].productId).to.equal(3);
      expect(renewalStatuses[4][0].renewalStatus).to.equal(4);
      expect(renewalStatuses[4][0].subStatus).to.equal(3);
      expect(renewalStatuses[4][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[4][1].passId).to.equal(5);
      expect(renewalStatuses[4][1].productId).to.equal(4);
      expect(renewalStatuses[4][1].renewalStatus).to.equal(5);
      expect(renewalStatuses[4][1].subStatus).to.equal(2);

      // TEST -> Process the renewals
      await expect(
        renewalProcessor
          .connect(owner)
          .processAllPassRenewalBatch([1, 2, 3, 4, 5]),
      )
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(1, 1, 1, 0)
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(3, 3, 3, 0)
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(3, 3, 4, 0)
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(3, 4, 3, 3)
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(3, 5, 3, 4)
        .to.emit(renewalProcessor, 'RenewalProcessed')
        .withArgs(3, 5, 4, 1);

      // Assert token balances
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('80', 6),
      );
      expect(await mintToken.balanceOf(otherAccount2)).to.equal(
        ethers.parseUnits('96', 6),
      );
      expect(await mintToken.balanceOf(otherAccount3)).to.equal(
        ethers.parseUnits('98', 6),
      );
      expect(await mintToken.balanceOf(otherAccount4)).to.equal(
        ethers.parseUnits('98', 6),
      );

      // Assert renewal status
      renewalStatuses = await renewalProcessor.getAllPassRenewalStatusBatch(
        Array.from({ length: 5 }, (_, i) => i + 1),
      );

      expect(renewalStatuses.length).to.equal(5);

      // Assert renewal status for pass 1
      expect(renewalStatuses[0].length).to.equal(1);
      expect(renewalStatuses[0][0].subscription.orgId).to.equal(1);
      expect(renewalStatuses[0][0].passId).to.equal(1);
      expect(renewalStatuses[0][0].productId).to.equal(1);
      expect(renewalStatuses[0][0].renewalStatus).to.equal(2);
      expect(renewalStatuses[0][0].subStatus).to.equal(0);

      // Assert renewal status for pass 2
      expect(renewalStatuses[1].length).to.equal(0);

      // Assert renewal status for pass 3
      expect(renewalStatuses[2].length).to.equal(2);
      expect(renewalStatuses[2][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[2][0].passId).to.equal(3);
      expect(renewalStatuses[2][0].productId).to.equal(3);
      expect(renewalStatuses[2][0].renewalStatus).to.equal(2);
      expect(renewalStatuses[2][0].subStatus).to.equal(0);
      expect(renewalStatuses[2][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[2][1].passId).to.equal(3);
      expect(renewalStatuses[2][1].productId).to.equal(4);
      expect(renewalStatuses[2][1].renewalStatus).to.equal(2);
      expect(renewalStatuses[2][1].subStatus).to.equal(0);

      // Assert renewal status for pass 4
      expect(renewalStatuses[3].length).to.equal(2);
      expect(renewalStatuses[3][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[3][0].passId).to.equal(4);
      expect(renewalStatuses[3][0].productId).to.equal(3);
      expect(renewalStatuses[3][0].renewalStatus).to.equal(3);
      expect(renewalStatuses[3][0].subStatus).to.equal(2);
      expect(renewalStatuses[3][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[3][1].passId).to.equal(4);
      expect(renewalStatuses[3][1].productId).to.equal(4);
      expect(renewalStatuses[3][1].renewalStatus).to.equal(2);
      expect(renewalStatuses[3][1].subStatus).to.equal(0);

      // Assert renewal status for pass 5
      expect(renewalStatuses[4].length).to.equal(2);
      expect(renewalStatuses[4][0].subscription.orgId).to.equal(3);
      expect(renewalStatuses[4][0].passId).to.equal(5);
      expect(renewalStatuses[4][0].productId).to.equal(3);
      expect(renewalStatuses[4][0].renewalStatus).to.equal(4);
      expect(renewalStatuses[4][0].subStatus).to.equal(3);
      expect(renewalStatuses[4][1].subscription.orgId).to.equal(3);
      expect(renewalStatuses[4][1].passId).to.equal(5);
      expect(renewalStatuses[4][1].productId).to.equal(4);
      expect(renewalStatuses[4][1].renewalStatus).to.equal(5);
      expect(renewalStatuses[4][1].subStatus).to.equal(2);
    });
  });
});
