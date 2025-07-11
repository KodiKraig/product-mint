import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadWithDefaultProduct, parseTimestamp } from './helpers';
import { getCycleDuration } from '../../utils/cycle-duration';
import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers';

describe('Dynamic Subscriptions', () => {
  async function loadWithFlatRateAndUsageDynamicSubscription() {
    const results = await loadWithDefaultProduct();

    const {
      purchaseManager,
      dynamicERC20,
      pricingRegistry,
      productRegistry,
      otherAccount,
      mintToken,
      paymentEscrow,
      owner,
      subscriptionEscrow,
      usageRecorder,
    } = results;

    await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

    // Mint & approve base token
    await mintToken
      .connect(otherAccount)
      .mint(otherAccount, ethers.parseUnits('2000', 18));
    await mintToken
      .connect(otherAccount)
      .approve(await paymentEscrow.getAddress(), ethers.parseUnits('2000', 18));

    // Create MONTHLY dynamic flat rate subscription
    await pricingRegistry.createFlatRateSubscriptionPricing({
      organizationId: 1,
      flatPrice: ethers.parseUnits('10', 6),
      token: await dynamicERC20.getAddress(),
      isRestricted: false,
      chargeFrequency: 2,
    });

    // Create YEARLY dynamic flat rate subscription
    await pricingRegistry.createFlatRateSubscriptionPricing({
      organizationId: 1,
      flatPrice: ethers.parseUnits('50', 6),
      token: await dynamicERC20.getAddress(),
      isRestricted: false,
      chargeFrequency: 4,
    });

    // Create MONTHLY usage based subscription
    await usageRecorder.createMeter(1, 0);
    await pricingRegistry.createUsageBasedSubscriptionPricing({
      organizationId: 1,
      chargeFrequency: 2,
      tiers: [
        {
          lowerBound: 0,
          upperBound: 10,
          pricePerUnit: 0,
          priceFlatRate: 0,
        },
        {
          lowerBound: 11,
          upperBound: 0,
          pricePerUnit: ethers.parseUnits('0.1', 6),
          priceFlatRate: ethers.parseUnits('1', 6),
        },
      ],
      token: await dynamicERC20.getAddress(),
      usageMeterId: 1,
      isVolume: false,
      isRestricted: false,
    });

    // Create usage product
    await productRegistry.createProduct({
      orgId: 1,
      name: 'Product 2',
      description: 'Product 2 description for usage based subscription',
      imageUrl: 'https://example2.com/image.png',
      externalUrl: 'https://example2.com',
      isTransferable: false,
    });

    // Link pricing to product
    await productRegistry.linkPricing(1, [1, 2]);
    await productRegistry.linkPricing(2, [3]);

    // Purchase MONTHLY subscription
    const tx = await purchaseManager.connect(otherAccount).purchaseProducts({
      to: otherAccount,
      organizationId: 1,
      productIds: [1, 2],
      pricingIds: [1, 3],
      quantities: [0, 0],
      discountIds: [],
      couponCode: '',
      airdrop: false,
      pause: false,
    });

    const { timestamp: purchaseTimestamp } = await parseTimestamp(tx);

    return {
      ...results,
      purchaseTimestamp,
    };
  }

  describe('Change subscription pricing', () => {
    it('should upgrade to a yearly dynamic subscription with prorated price in base token', async () => {
      const {
        purchaseManager,
        purchaseTimestamp,
        otherAccount,
        subscriptionEscrow,
        mintToken,
      } = await loadWithFlatRateAndUsageDynamicSubscription();

      await time.increase(getCycleDuration(2) / 2);

      // Check balance of base token
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1989.96991', 18),
      );

      // Upgrade to yearly subscription
      await expect(
        purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 2,
          airdrop: false,
        }),
      )
        .to.emit(subscriptionEscrow, 'SubscriptionPricingChanged')
        .withArgs(1, 1, 1, 2)
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          purchaseTimestamp,
          purchaseTimestamp + getCycleDuration(4),
        )
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('48.089470115827', 18),
        );

      // Check balance of base token
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1941.880439884173', 18),
      );
    });
  });

  describe('Renew subscription', () => {
    it('should renew a single monthly flat rate subscription', async () => {
      const { purchaseManager, otherAccount, subscriptionEscrow, mintToken } =
        await loadWithFlatRateAndUsageDynamicSubscription();

      await time.increase(getCycleDuration(2) + 10);

      const renewTx = await purchaseManager
        .connect(otherAccount)
        .renewSubscription(1, 1, false);

      const { timestamp: renewTimestamp } = await parseTimestamp(renewTx);

      await expect(renewTx)
        .to.emit(purchaseManager, 'SubscriptionRenewed')
        .withArgs(
          1,
          1,
          1,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10.03009', 18),
        )
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          renewTimestamp,
          renewTimestamp + getCycleDuration(2),
        )
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10.03009', 18),
        );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1979.93982', 18),
      );
    });

    it('should renew a single usage based subscription with no usage charge', async () => {
      const {
        purchaseManager,
        otherAccount,
        subscriptionEscrow,
        mintToken,
        usageRecorder,
      } = await loadWithFlatRateAndUsageDynamicSubscription();

      await usageRecorder.increaseMeter(1, 1, 10);

      await time.increase(getCycleDuration(2) + 10);

      const renewTx = await purchaseManager
        .connect(otherAccount)
        .renewSubscription(1, 2, false);

      const { timestamp: renewTimestamp } = await parseTimestamp(renewTx);

      await expect(renewTx)
        .to.emit(purchaseManager, 'SubscriptionRenewed')
        .withArgs(1, 1, 2, otherAccount, await mintToken.getAddress(), 0)
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          2,
          0,
          renewTimestamp,
          renewTimestamp + getCycleDuration(2),
        )
        .and.to.emit(usageRecorder, 'MeterUsageSet')
        .withArgs(1, 1, 1, 0)
        .and.to.emit(usageRecorder, 'MeterPaymentProcessed')
        .withArgs(1, 1, 1, 10)
        .and.not.to.emit(purchaseManager, 'PerformPurchase');

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1989.96991', 18),
      );
    });

    it('should batch renew multiple subscriptions', async () => {
      const {
        purchaseManager,
        otherAccount,
        subscriptionEscrow,
        mintToken,
        usageRecorder,
      } = await loadWithFlatRateAndUsageDynamicSubscription();

      await usageRecorder.increaseMeter(1, 1, 20);

      await time.increase(getCycleDuration(2) + 10);

      const renewTx = await purchaseManager
        .connect(otherAccount)
        .renewSubscriptionBatch(1, [1, 2], false);

      const { timestamp: renewTimestamp } = await parseTimestamp(renewTx);

      // Check first flat rate subscription renewal
      await expect(renewTx)
        .to.emit(purchaseManager, 'SubscriptionRenewed')
        .withArgs(
          1,
          1,
          1,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10.03009', 18),
        )
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          renewTimestamp,
          renewTimestamp + getCycleDuration(2),
        )
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10.03009', 18),
        );

      // Check second usage based subscription renewal
      await expect(renewTx)
        .to.emit(purchaseManager, 'SubscriptionRenewed')
        .withArgs(
          1,
          1,
          2,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('2.006018', 18),
        )
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          2,
          0,
          renewTimestamp,
          renewTimestamp + getCycleDuration(2),
        )
        .and.to.emit(usageRecorder, 'MeterUsageSet')
        .withArgs(1, 1, 1, 0)
        .and.to.emit(usageRecorder, 'MeterPaymentProcessed')
        .withArgs(1, 1, 1, 20)
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('2.006018', 18),
        );

      // Check balance of base token
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1977.933802', 18),
      );
    });
  });

  describe('Change subscription quantity', () => {
    async function loadWithTieredDynamicSubscription() {
      const results = await loadWithDefaultProduct();

      const {
        purchaseManager,
        dynamicERC20,
        pricingRegistry,
        productRegistry,
        otherAccount,
        mintToken,
        paymentEscrow,
      } = results;

      // Mint & approve base token
      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('2000', 18));
      await mintToken
        .connect(otherAccount)
        .approve(
          await paymentEscrow.getAddress(),
          ethers.parseUnits('2000', 18),
        );

      // Create MONTHLY tiered dynamic flat rate subscription
      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('0.1', 6),
            priceFlatRate: ethers.parseUnits('10', 6),
          },
        ],
        token: await dynamicERC20.getAddress(),
        isRestricted: false,
        chargeFrequency: 2,
        isVolume: false,
      });

      // Link pricing to product
      await productRegistry.linkPricing(1, [1]);

      // Purchase MONTHLY subscription
      const tx = await purchaseManager.connect(otherAccount).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [5],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      const { timestamp: purchaseTimestamp } = await parseTimestamp(tx);

      return {
        ...results,
        purchaseTimestamp,
      };
    }

    it('should increase the quantity of a tiered subscription and charge the correct amount', async () => {
      const { purchaseManager, otherAccount, mintToken } =
        await loadWithTieredDynamicSubscription();

      await time.increase(getCycleDuration(2) / 2);

      // Check initial balance
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1989.4684055', 18),
      );

      // Increase quantity to 10
      const changeQuantityTx = await purchaseManager
        .connect(otherAccount)
        .changeTieredSubscriptionUnitQuantity(1, 1, 10, false);

      // Check events
      await expect(changeQuantityTx)
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('0.250751246991', 18),
        );

      // Check balance after change
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1989.217654253009', 18),
      );
    });

    it('should decrease the quantity of a tiered subscription and with no charge', async () => {
      const { purchaseManager, otherAccount, mintToken } =
        await loadWithTieredDynamicSubscription();

      await time.increase(getCycleDuration(2) / 2);

      // Decrease quantity to 3
      const changeQuantityTx = await purchaseManager
        .connect(otherAccount)
        .changeTieredSubscriptionUnitQuantity(1, 1, 3, false);

      // Check events
      await expect(changeQuantityTx).and.not.to.emit(
        purchaseManager,
        'PerformPurchase',
      );

      // Check balance after change
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1989.4684055', 18),
      );
    });
  });
});
