import { loadWithDefaultProduct } from './helpers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { loadWithPurchasedFlatRateSubscription } from './helpers';

describe('Purchase Manager', () => {
  describe('Pause Purchase Manager', () => {
    it('can not pause if not the owner', async () => {
      const { purchaseManager, otherAccount } = await loadWithDefaultProduct();

      await expect(
        purchaseManager.connect(otherAccount).pausePurchases(),
      ).to.be.revertedWithCustomError(
        purchaseManager,
        'OwnableUnauthorizedAccount',
      );

      await expect(
        purchaseManager.connect(otherAccount).unpausePurchases(),
      ).to.be.revertedWithCustomError(
        purchaseManager,
        'OwnableUnauthorizedAccount',
      );
    });

    it('can pause and unpause', async () => {
      const { purchaseManager } = await loadWithDefaultProduct();

      expect(await purchaseManager.paused()).to.equal(false);

      await purchaseManager.pausePurchases();

      expect(await purchaseManager.paused()).to.equal(true);

      await purchaseManager.unpausePurchases();

      expect(await purchaseManager.paused()).to.equal(false);
    });

    it('cannot purchase products if paused', async () => {
      const { purchaseManager, otherAccount } = await loadWithDefaultProduct();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot purchase additional products if paused', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        otherAccount,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('10'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await purchaseManager.connect(otherAccount).purchaseProducts(
        {
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('10') },
      );

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager.connect(otherAccount).purchaseAdditionalProducts({
          productPassId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot change subscription pricing if paused', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 1,
          airdrop: false,
        }),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot renew subscription if paused', async () => {
      const { purchaseManager, otherAccount } = await loadWithDefaultProduct();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager.connect(otherAccount).renewSubscription(1, 1, false),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot batch renew subscriptions if paused', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .renewSubscriptionBatch(1, [1], false),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot pause subscription if paused', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot batch pause subscriptions if paused', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .pauseSubscriptionBatch(1, [1], [true]),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot cancel subscription if paused', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager.connect(otherAccount).cancelSubscription(1, 1, false),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot batch cancel subscriptions if paused', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .cancelSubscriptionBatch(1, [1], [false]),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });

    it('cannot change quantity if paused', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager.pausePurchases();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .changeTieredSubscriptionUnitQuantity(1, 1, 10, false),
      ).to.be.revertedWithCustomError(purchaseManager, 'EnforcedPause');
    });
  });
});
