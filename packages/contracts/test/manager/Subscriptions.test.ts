import hre from 'hardhat';
import { ethers } from 'hardhat';
import {
  assertSubscription,
  assertSubscriptionBatch,
  deployPurchaseManager,
  loadWithDefaultProduct,
  loadWithPurchasedFlatRateSubscription,
  parseTimestamp,
} from './helpers';
import { expect } from 'chai';
import {
  loadFixture,
  time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { getCycleDuration } from '../../utils/cycle-duration';
import { assertMetadata, EMPTY_METADATA } from '../metadata/helpers';

describe('Purchase Manager', () => {
  describe('Batch Subscription Renewal', () => {
    async function loadBatchSubscriptionRenewal() {
      const contracts = await loadWithPurchasedFlatRateSubscription();

      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        usageRecorder,
        mintToken,
        otherAccount,
        subscriptionEscrow,
      } = contracts;

      // Create additional products
      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 2',
        description: 'Product 2 description',
        imageUrl: 'https://example.com/image.png',
        externalUrl: 'https://example.com',
        isTransferable: true,
      });
      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 10,
            pricePerUnit: ethers.parseUnits('0.2', 6),
            priceFlatRate: ethers.parseUnits('2', 6),
          },
          {
            lowerBound: 11,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('0.1', 6),
            priceFlatRate: ethers.parseUnits('1', 6),
          },
        ],
        token: await mintToken.getAddress(),
        isVolume: true,
        isRestricted: false,
      });

      await productRegistry.linkPricing(2, [2]);

      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 3',
        description: 'Product 3 description',
        imageUrl: 'https://example.com/image.png',
        externalUrl: 'https://example.com',
        isTransferable: true,
      });

      await usageRecorder.createMeter(1, 0);

      await pricingRegistry.createUsageBasedSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 3,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 10,
            pricePerUnit: ethers.parseUnits('0.5', 6),
            priceFlatRate: ethers.parseUnits('5', 6),
          },
          {
            lowerBound: 11,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('0.3', 6),
            priceFlatRate: ethers.parseUnits('3', 6),
          },
        ],
        token: await mintToken.getAddress(),
        isVolume: false,
        isRestricted: false,
        usageMeterId: 1,
      });

      await productRegistry.linkPricing(3, [3]);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      // PURCHASE ADDITIONAL PRODUCTS
      const additionalProductsTx = await purchaseManager
        .connect(otherAccount)
        .purchaseAdditionalProducts({
          productPassId: 1,
          productIds: [2, 3],
          pricingIds: [2, 3],
          quantities: [15, 0],
          couponCode: '',
          airdrop: false,
          pause: false,
        });

      const { timestamp: additionalProductsTimeStamp } = await parseTimestamp(
        additionalProductsTx,
      );

      expect(await subscriptionEscrow.getPassSubs(1)).to.deep.equal([1, 2, 3]);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('87.5', 6),
      );

      return { ...contracts, additionalProductsTimeStamp };
    }

    it('can renew multiple subscriptions that are past due', async () => {
      const {
        purchaseManager,
        usageRecorder,
        subscriptionEscrow,
        paymentEscrow,
        productPassNFT,
        mintToken,
        owner,
        otherAccount,
      } = await loadBatchSubscriptionRenewal();

      // Check initial renewal cost
      let [orgId, tokens, prices] =
        await subscriptionEscrow.getRenewalCostBatch(1, [1, 2, 3]);
      expect(orgId).to.equal(1);
      expect(tokens).to.deep.equal([
        await mintToken.getAddress(),
        await mintToken.getAddress(),
        await mintToken.getAddress(),
      ]);
      expect(prices).to.deep.equal([
        ethers.parseUnits('10', 6),
        ethers.parseUnits('2.5', 6),
        ethers.parseUnits('0', 6),
      ]);

      // Record some usage
      await usageRecorder.connect(owner).increaseMeter(1, 1, 15);

      // Check usage based updated renewal cost
      [orgId, tokens, prices] = await subscriptionEscrow.getRenewalCostBatch(
        1,
        [1, 2, 3],
      );
      expect(orgId).to.equal(1);
      expect(tokens).to.deep.equal([
        await mintToken.getAddress(),
        await mintToken.getAddress(),
        await mintToken.getAddress(),
      ]);
      expect(prices).to.deep.equal([
        ethers.parseUnits('10', 6),
        ethers.parseUnits('2.5', 6),
        ethers.parseUnits('14.5', 6),
      ]);

      // ADVANCE TO ALL PAST DUE PRODUCTS
      await time.increase(getCycleDuration(3) + 1);

      // Check metadata
      assertMetadata(await productPassNFT.tokenURI(1), {
        ...EMPTY_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
          { trait_type: 'Product 2', value: 'Product 2' },
          { trait_type: 'Product 3', value: 'Product 3' },
          { trait_type: 'Subscription 1', value: 'Past Due' },
          { trait_type: 'Subscription 2', value: 'Past Due' },
          { trait_type: 'Subscription 3', value: 'Past Due' },
        ],
      });

      // BATCH RENEW SUBSCRIPTIONS
      const tx = await purchaseManager
        .connect(otherAccount)
        .renewSubscriptionBatch(1, [1, 2, 3], false);

      const { timestamp: renewalTimeStamp } = await parseTimestamp(tx);

      // ASSERTIONS
      await expect(tx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          renewalTimeStamp,
          renewalTimeStamp + getCycleDuration(1),
        )
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          2,
          0,
          renewalTimeStamp,
          renewalTimeStamp + getCycleDuration(2),
        )
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          3,
          0,
          renewalTimeStamp,
          renewalTimeStamp + getCycleDuration(3),
        );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('60.5', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('39.5', 6),
      );
      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('39.5', 6));

      // Check post renewal cost
      [orgId, tokens, prices] = await subscriptionEscrow.getRenewalCostBatch(
        1,
        [1, 2, 3],
      );
      expect(orgId).to.equal(1);
      expect(tokens).to.deep.equal([
        await mintToken.getAddress(),
        await mintToken.getAddress(),
        await mintToken.getAddress(),
      ]);
      expect(prices).to.deep.equal([
        ethers.parseUnits('10', 6),
        ethers.parseUnits('2.5', 6),
        ethers.parseUnits('0', 6),
      ]);
    });

    it('cannot renew subscriptions if not past due', async () => {
      const { purchaseManager, purchaseTimeStamp } =
        await loadBatchSubscriptionRenewal();

      await expect(
        purchaseManager.renewSubscriptionBatch(1, [1, 2, 3], false),
      ).to.be.revertedWith('Subscription is not past due');

      await time.increaseTo(purchaseTimeStamp + getCycleDuration(1) + 1);

      await expect(
        purchaseManager.renewSubscriptionBatch(1, [1, 2, 3], false),
      ).to.be.revertedWith('Subscription is not past due');

      await time.increaseTo(purchaseTimeStamp + getCycleDuration(2) + 1);

      await expect(
        purchaseManager.renewSubscriptionBatch(1, [1, 2, 3], false),
      ).to.be.revertedWith('Subscription is not past due');

      await time.increaseTo(purchaseTimeStamp + getCycleDuration(3));

      await expect(
        purchaseManager.renewSubscriptionBatch(1, [1, 2, 3], false),
      ).to.be.revertedWith('Subscription is not past due');
    });

    it('cannot renew subscriptions if no products provided', async () => {
      const { purchaseManager } = await loadBatchSubscriptionRenewal();

      await expect(
        purchaseManager.renewSubscriptionBatch(1, [], false),
      ).to.be.revertedWithCustomError(purchaseManager, 'NoProductsProvided');
    });

    it('cannot airdrop renewals if not owner', async () => {
      const { purchaseManager, otherAccount } =
        await loadBatchSubscriptionRenewal();

      await time.increase(getCycleDuration(1) + 1);

      await expect(
        purchaseManager
          .connect(otherAccount)
          .renewSubscriptionBatch(1, [1], true),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('will revert if the same product is provided multiple times', async () => {
      const { purchaseManager, otherAccount } =
        await loadBatchSubscriptionRenewal();

      await time.increase(getCycleDuration(1) + 1);

      await expect(
        purchaseManager
          .connect(otherAccount)
          .renewSubscriptionBatch(1, [1, 1], false),
      ).to.be.revertedWith('Subscription is not past due');
    });
  });

  describe('Get Renewal Cost', () => {
    it('can get the renewal cost for a single flat rate subscription', async () => {
      const { subscriptionEscrow, mintToken } =
        await loadWithPurchasedFlatRateSubscription();

      const [orgId, tokens, prices] = await subscriptionEscrow.getRenewalCost(
        1,
        1,
      );

      expect(orgId).to.equal(1);
      expect(tokens).to.deep.equal(await mintToken.getAddress());
      expect(prices).to.deep.equal(ethers.parseUnits('10', 6));
    });

    it('revert if sub does not exist', async () => {
      const { subscriptionEscrow } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        subscriptionEscrow.getRenewalCostBatch(1, [1, 2]),
      ).to.be.revertedWith('Subscription does not exist');
    });

    it('revert if empty product ids provided', async () => {
      const { subscriptionEscrow } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        subscriptionEscrow.getRenewalCostBatch(1, []),
      ).to.be.revertedWith('No products provided');
    });
  });

  describe('Subscription Cancellation', () => {
    it('can cancel subscription as pass owner if sub is not paused', async () => {
      const {
        purchaseManager,
        otherAccount,
        subscriptionEscrow,
        purchaseTimeStamp,
      } = await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount).cancelSubscription(1, 1, true),
      )
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          1,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
        );
    });

    it('can cancel subscription as an org admin if sub is not paused', async () => {
      const { purchaseManager, owner, subscriptionEscrow, purchaseTimeStamp } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(owner).cancelSubscription(1, 1, true),
      )
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          1,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
        );
    });

    it('can un cancel sub and renew in the same tx if sub is passed due', async () => {
      const {
        purchaseManager,
        otherAccount,
        subscriptionEscrow,
        mintToken,
        purchaseTimeStamp,
        productPassNFT,
      } = await loadWithPurchasedFlatRateSubscription();

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      await purchaseManager
        .connect(otherAccount)
        .cancelSubscription(1, 1, true);

      assertMetadata(await productPassNFT.tokenURI(1), {
        ...EMPTY_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
          { trait_type: 'Subscription 1', value: 'Cancelled' },
        ],
      });

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: true,
          isPaused: false,
          status: 1,
        },
      );

      await time.increase(getCycleDuration(1) + 1);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: true,
          isPaused: false,
          status: 2,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      const cancelTx = await purchaseManager
        .connect(otherAccount)
        .cancelSubscription(1, 1, false);

      const { timestamp: cancelTimeStamp } = await parseTimestamp(cancelTx);

      await expect(cancelTx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          cancelTimeStamp,
          cancelTimeStamp + getCycleDuration(1),
        );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: cancelTimeStamp,
          endDate: cancelTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('80', 6),
      );

      it('can un cancel sub without renewing if sub is not passed due', async () => {
        const {
          purchaseManager,
          otherAccount,
          subscriptionEscrow,
          mintToken,
          purchaseTimeStamp,
        } = await loadWithPurchasedFlatRateSubscription();

        await purchaseManager
          .connect(otherAccount)
          .cancelSubscription(1, 1, true);

        await assertSubscription(
          subscriptionEscrow,
          {
            productPassId: 1,
            productId: 1,
          },
          {
            orgId: 1,
            pricingId: 1,
            startDate: purchaseTimeStamp,
            endDate: purchaseTimeStamp + getCycleDuration(1),
            timeRemaining: 0,
            isCancelled: true,
            isPaused: false,
            status: 0,
          },
        );

        await time.increase(getCycleDuration(1));

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('90', 6),
        );

        const cancelTx = await purchaseManager
          .connect(otherAccount)
          .cancelSubscription(1, 1, false);

        await expect(cancelTx)
          .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
          .withArgs(
            1,
            1,
            1,
            0,
            purchaseTimeStamp,
            purchaseTimeStamp + getCycleDuration(1),
          );

        await assertSubscription(
          subscriptionEscrow,
          {
            productPassId: 1,
            productId: 1,
          },
          {
            orgId: 1,
            pricingId: 1,
            startDate: purchaseTimeStamp,
            endDate: purchaseTimeStamp + getCycleDuration(1),
            timeRemaining: 0,
            isCancelled: true,
            isPaused: false,
            status: 2,
          },
        );

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('90', 6),
        );
      });
    });

    it('cannot cancel subscription if sub does not exist', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount).cancelSubscription(1, 2, false),
      ).to.be.revertedWith('Subscription does not exist');
    });

    it('cannot cancel a paused sub', async () => {
      const { purchaseManager, subscriptionEscrow, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      await purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true);

      await expect(
        purchaseManager.connect(otherAccount).cancelSubscription(1, 1, true),
      ).to.be.revertedWith('Subscription is paused');
    });

    it('cannot cancel subscription if sub is past due', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await time.increase(getCycleDuration(1) + 1);

      await expect(
        purchaseManager.connect(otherAccount).cancelSubscription(1, 1, true),
      ).to.be.revertedWith('Subscription is past due');
    });

    it('cannot cancel subscription if cancel status is already set', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount).cancelSubscription(1, 1, false),
      ).to.be.revertedWith('Subscription cancel status is already set');

      await purchaseManager
        .connect(otherAccount)
        .cancelSubscription(1, 1, true);

      await expect(
        purchaseManager.connect(otherAccount).cancelSubscription(1, 1, true),
      ).to.be.revertedWith('Subscription cancel status is already set');
    });

    it('only the pass owner or org admin can cancel the subscription', async () => {
      const { purchaseManager, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount2).cancelSubscription(1, 1, true),
      ).to.be.revertedWithCustomError(purchaseManager, 'NotAuthorized');
    });
  });

  describe('Batch Subscription Cancellation', () => {
    async function loadBatchSubscriptionCancellation() {
      const contracts = await loadWithPurchasedFlatRateSubscription();

      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        usageRecorder,
        mintToken,
        otherAccount,
      } = contracts;

      // Create additional products
      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 2',
        description: 'Product 2 description',
        imageUrl: 'https://example.com/image.png',
        externalUrl: 'https://example.com',
        isTransferable: true,
      });
      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 10,
            pricePerUnit: ethers.parseUnits('0.2', 6),
            priceFlatRate: ethers.parseUnits('2', 6), // 4
          },
          {
            lowerBound: 11,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('0.1', 6),
            priceFlatRate: ethers.parseUnits('1', 6), // 2
          },
        ],
        token: await mintToken.getAddress(),
        isVolume: false,
        isRestricted: false,
      });

      await productRegistry.linkPricing(2, [2]);

      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 3',
        description: 'Product 3 description',
        imageUrl: 'https://example.com/image.png',
        externalUrl: 'https://example.com',
        isTransferable: true,
      });

      await usageRecorder.createMeter(1, 0);

      await pricingRegistry.createUsageBasedSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 3,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 10,
            pricePerUnit: ethers.parseUnits('0.5', 6),
            priceFlatRate: ethers.parseUnits('5', 6),
          },
          {
            lowerBound: 11,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('0.3', 6),
            priceFlatRate: ethers.parseUnits('3', 6), // 7.5
          },
        ],
        token: await mintToken.getAddress(),
        isVolume: true,
        isRestricted: false,
        usageMeterId: 1,
      });

      await productRegistry.linkPricing(3, [3]);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      // PURCHASE ADDITIONAL PRODUCTS
      const additionalProductsTx = await purchaseManager
        .connect(otherAccount)
        .purchaseAdditionalProducts({
          productPassId: 1,
          productIds: [2, 3],
          pricingIds: [2, 3],
          quantities: [15, 0],
          couponCode: '',
          airdrop: false,
          pause: false,
        });

      const { timestamp: additionalProductsTimeStamp } = await parseTimestamp(
        additionalProductsTx,
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('84.5', 6),
      );

      return { ...contracts, additionalProductsTimeStamp };
    }

    it('only the pass owner or org admin can cancel multiple subscriptions', async () => {
      const { purchaseManager, otherAccount2 } =
        await loadBatchSubscriptionCancellation();

      await expect(
        purchaseManager
          .connect(otherAccount2)
          .cancelSubscriptionBatch(1, [1, 2], [true, true]),
      ).to.be.revertedWithCustomError(purchaseManager, 'NotAuthorized');
    });

    it('must pass at least one product id', async () => {
      const { purchaseManager, otherAccount } =
        await loadBatchSubscriptionCancellation();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .cancelSubscriptionBatch(1, [], [true]),
      ).to.be.revertedWithCustomError(purchaseManager, 'NoProductsProvided');
    });

    it('must pass the same number of product ids and statuses', async () => {
      const { purchaseManager, otherAccount } =
        await loadBatchSubscriptionCancellation();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .cancelSubscriptionBatch(1, [1, 2], [true]),
      ).to.be.revertedWithCustomError(
        purchaseManager,
        'ProductIdsAndStatusesLengthMismatch',
      );
    });

    it('cannot cancel multiple subscriptions if any are past due', async () => {
      const { purchaseManager, otherAccount } =
        await loadBatchSubscriptionCancellation();

      await time.increase(getCycleDuration(1) + 1);

      await expect(
        purchaseManager
          .connect(otherAccount)
          .cancelSubscriptionBatch(1, [1, 2, 3], [true, true, true]),
      ).to.be.revertedWith('Subscription is past due');
    });

    it('cannot cancel multiple subscriptions if any do not exist', async () => {
      const { purchaseManager, otherAccount } =
        await loadBatchSubscriptionCancellation();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .cancelSubscriptionBatch(1, [1, 2, 3, 4], [true, true, true, true]),
      ).to.be.revertedWith('Subscription does not exist');
    });

    it('cannot cancel multiple subscriptions if any are paused', async () => {
      const { purchaseManager, subscriptionEscrow, otherAccount } =
        await loadBatchSubscriptionCancellation();

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      await purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true);

      await expect(
        purchaseManager
          .connect(otherAccount)
          .cancelSubscriptionBatch(1, [1, 2, 3], [true, true, true]),
      ).to.be.revertedWith('Subscription is paused');
    });

    it('can cancel multiple subscriptions and auto renew when un cancelled', async () => {
      const {
        purchaseManager,
        mintToken,
        subscriptionEscrow,
        usageRecorder,
        purchaseTimeStamp,
        additionalProductsTimeStamp,
        otherAccount,
      } = await loadBatchSubscriptionCancellation();

      // CANCEL ALL SUBSCRIPTIONS
      const cancelTx = await purchaseManager
        .connect(otherAccount)
        .cancelSubscriptionBatch(1, [1, 2, 3], [true, true, true]);

      await expect(cancelTx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          1,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
        )
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          2,
          1,
          additionalProductsTimeStamp,
          additionalProductsTimeStamp + getCycleDuration(2),
        )
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          3,
          1,
          additionalProductsTimeStamp,
          additionalProductsTimeStamp + getCycleDuration(3),
        );

      // INCREASE TIME TO END OF ALL SUBSCRIPTIONS
      await time.increase(getCycleDuration(3) + 1);

      await assertSubscriptionBatch(
        subscriptionEscrow,
        {
          productPassId: 1,
          productIds: [1, 2, 3],
        },
        [
          {
            orgId: 1,
            pricingId: 1,
            startDate: purchaseTimeStamp,
            endDate: purchaseTimeStamp + getCycleDuration(1),
            timeRemaining: 0,
            isCancelled: true,
            isPaused: false,
            status: 2,
          },
          {
            orgId: 1,
            pricingId: 2,
            startDate: additionalProductsTimeStamp,
            endDate: additionalProductsTimeStamp + getCycleDuration(2),
            timeRemaining: 0,
            isCancelled: true,
            isPaused: false,
            status: 2,
          },
          {
            orgId: 1,
            pricingId: 3,
            startDate: additionalProductsTimeStamp,
            endDate: additionalProductsTimeStamp + getCycleDuration(3),
            timeRemaining: 0,
            isCancelled: true,
            isPaused: false,
            status: 2,
          },
        ],
      );

      // Adjust usage
      await usageRecorder.increaseMeter(1, 1, 15);

      // UN-CANCEL ALL SUBSCRIPTIONS
      const unCancelTx = await purchaseManager
        .connect(otherAccount)
        .cancelSubscriptionBatch(1, [1, 2, 3], [false, false, false]);

      const { timestamp: unCancelTimeStamp } = await parseTimestamp(unCancelTx);

      await expect(unCancelTx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          unCancelTimeStamp,
          unCancelTimeStamp + getCycleDuration(1),
        )
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          2,
          0,
          unCancelTimeStamp,
          unCancelTimeStamp + getCycleDuration(2),
        )
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          3,
          0,
          unCancelTimeStamp,
          unCancelTimeStamp + getCycleDuration(3),
        )
        .to.emit(usageRecorder, 'MeterUsageSet')
        .withArgs(1, 1, 1, 0)
        .to.emit(usageRecorder, 'MeterPaymentProcessed')
        .withArgs(1, 1, 1, 15);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('61.5', 6),
      );

      await assertSubscriptionBatch(
        subscriptionEscrow,
        {
          productPassId: 1,
          productIds: [1, 2, 3],
        },
        [
          {
            orgId: 1,
            pricingId: 1,
            startDate: unCancelTimeStamp,
            endDate: unCancelTimeStamp + getCycleDuration(1),
            timeRemaining: 0,
            isCancelled: false,
            isPaused: false,
            status: 0,
          },
          {
            orgId: 1,
            pricingId: 2,
            startDate: unCancelTimeStamp,
            endDate: unCancelTimeStamp + getCycleDuration(2),
            timeRemaining: 0,
            isCancelled: false,
            isPaused: false,
            status: 0,
          },
          {
            orgId: 1,
            pricingId: 3,
            startDate: unCancelTimeStamp,
            endDate: unCancelTimeStamp + getCycleDuration(3),
            timeRemaining: 0,
            isCancelled: false,
            isPaused: false,
            status: 0,
          },
        ],
      );
    });
  });

  describe('Subscription Pausing', () => {
    it('can pause an active subscription', async () => {
      const {
        purchaseManager,
        otherAccount,
        subscriptionEscrow,
        mintToken,
        purchaseTimeStamp,
      } = await loadWithPurchasedFlatRateSubscription();

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      await time.increase(10000);

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      const pauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscription(1, 1, true);

      const { timestamp: pauseTimeStamp } = await parseTimestamp(pauseTx);
      const difference = pauseTimeStamp - purchaseTimeStamp;

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: 0,
          endDate: pauseTimeStamp,
          timeRemaining: getCycleDuration(1) - difference,
          isCancelled: false,
          isPaused: true,
          status: 3,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );
    });

    it('can pause subscription if subscription is passed due', async () => {
      const {
        purchaseManager,
        subscriptionEscrow,
        purchaseTimeStamp,
        otherAccount,
      } = await loadWithPurchasedFlatRateSubscription();

      await time.increase(getCycleDuration(1) + 1);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 2,
        },
      );

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      await purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true);

      await time.increase(100);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: 0,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: true,
          status: 3,
        },
      );
    });

    it('can unpause subscription with time remaining with no renewal', async () => {
      const {
        purchaseManager,
        subscriptionEscrow,
        mintToken,
        purchaseTimeStamp,
        otherAccount,
      } = await loadWithPurchasedFlatRateSubscription();

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      const pauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscription(1, 1, true);

      const { timestamp: pauseTimeStamp } = await parseTimestamp(pauseTx);
      const difference = pauseTimeStamp - purchaseTimeStamp;

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      await time.increase(10000);

      const unpauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscription(1, 1, false);

      const { timestamp: unpauseTimeStamp } = await parseTimestamp(unpauseTx);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: unpauseTimeStamp,
          endDate: unpauseTimeStamp + getCycleDuration(1) - difference,
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );
    });

    it('can unpause subscription with required renewal', async () => {
      const {
        purchaseManager,
        subscriptionEscrow,
        mintToken,
        otherAccount,
        paymentEscrow,
        purchaseTimeStamp,
        productPassNFT,
      } = await loadWithPurchasedFlatRateSubscription();

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      await time.increase(getCycleDuration(1) + 1);

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      await purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      assertMetadata(await productPassNFT.tokenURI(1), {
        ...EMPTY_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
          { trait_type: 'Subscription 1', value: 'Paused' },
        ],
      });

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: 0,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: true,
          status: 3,
        },
      );

      const unpauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscription(1, 1, false);

      const { timestamp: unpauseTimeStamp } = await parseTimestamp(unpauseTx);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: unpauseTimeStamp,
          endDate: unpauseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('80', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('20', 6),
      );
    });

    it('cannot pause subscription if subscription does not exist', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount).pauseSubscription(1, 2, true),
      ).to.be.revertedWith('Subscription does not exist');
    });

    it('cannot pause subscription if sub is cancelled', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager
        .connect(otherAccount)
        .cancelSubscription(1, 1, true);

      await expect(
        purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true),
      ).to.be.revertedWith('Subscription is cancelled');
    });

    it('cannot pause subscription if sub is paused', async () => {
      const { purchaseManager, subscriptionEscrow, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      await purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true);

      await expect(
        purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true),
      ).to.be.revertedWithCustomError(subscriptionEscrow, 'InvalidPauseState');
    });

    it('cannot pause subscription if organization is not pausable', async () => {
      const { purchaseManager, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount).pauseSubscription(1, 1, true),
      ).to.be.revertedWith('Subscriptions are not pausable');
    });

    it('cannot unpause subscription if sub is not paused', async () => {
      const { purchaseManager, subscriptionEscrow, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount).pauseSubscription(1, 1, false),
      ).to.be.revertedWithCustomError(subscriptionEscrow, 'InvalidPauseState');
    });

    it('only the pass owner or org admin can pause the subscription', async () => {
      const { purchaseManager, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount2).pauseSubscription(1, 1, true),
      ).to.be.revertedWithCustomError(purchaseManager, 'NotAuthorized');
    });
  });

  describe('Batch Subscription Pausing', () => {
    async function loadMultipleBatchPauseSubscriptions() {
      const contracts = await loadWithPurchasedFlatRateSubscription();

      const {
        purchaseManager,
        otherAccount,
        productRegistry,
        pricingRegistry,
        mintToken,
        usageRecorder,
      } = contracts;

      // Create tiered subscription
      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 2',
        description: 'Product 2 description',
        imageUrl: 'https://example.com/image.png',
        externalUrl: 'https://example.com',
        isTransferable: true,
      });

      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 10,
            pricePerUnit: ethers.parseUnits('0.2', 6),
            priceFlatRate: ethers.parseUnits('2', 6),
          },
          {
            lowerBound: 11,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('0.1', 6),
            priceFlatRate: ethers.parseUnits('1', 6),
          },
        ],
        token: await mintToken.getAddress(),
        isVolume: false,
        isRestricted: false,
      });

      await productRegistry.linkPricing(2, [2]);

      // Create usage based subscription
      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 3',
        description: 'Product 3 description',
        imageUrl: 'https://example.com/image.png',
        externalUrl: 'https://example.com',
        isTransferable: true,
      });

      await usageRecorder.createMeter(1, 0);

      await pricingRegistry.createUsageBasedSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 3,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 10,
            pricePerUnit: ethers.parseUnits('0.5', 6),
            priceFlatRate: ethers.parseUnits('5', 6),
          },
          {
            lowerBound: 11,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('0.1', 6),
            priceFlatRate: ethers.parseUnits('1', 6),
          },
        ],
        token: await mintToken.getAddress(),
        isVolume: true,
        isRestricted: false,
        usageMeterId: 1,
      });

      await productRegistry.linkPricing(3, [3]);

      // Purchase additional products
      const purchaseAdditionalTx = await purchaseManager
        .connect(otherAccount)
        .purchaseAdditionalProducts({
          productPassId: 1,
          productIds: [2, 3],
          pricingIds: [2, 3],
          quantities: [10, 0],
          couponCode: '',
          airdrop: false,
          pause: false,
        });

      const { timestamp: purchaseAdditionalTimeStamp } = await parseTimestamp(
        purchaseAdditionalTx,
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('86', 6),
      );

      return {
        ...contracts,
        purchaseAdditionalTimeStamp,
      };
    }

    it('can batch pause multiple subscriptions and unpause them even when org is not pausable', async () => {
      const {
        purchaseManager,
        otherAccount,
        purchaseTimeStamp,
        subscriptionEscrow,
        purchaseAdditionalTimeStamp,
        mintToken,
      } = await loadMultipleBatchPauseSubscriptions();

      // Advance time so we are two subscriptions past due with one subscription that is not past due
      await time.increase(getCycleDuration(2) + 1);

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      // PAUSE SUBSCRIPTIONS
      const tx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscriptionBatch(1, [1, 2, 3], [true, true, true]);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('86', 6),
      );

      // Check event emissions
      const { timestamp: pauseTimeStamp } = await parseTimestamp(tx);

      await expect(tx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(1, 1, 1, 3, 0, purchaseTimeStamp + getCycleDuration(1));

      await expect(tx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          2,
          3,
          0,
          purchaseAdditionalTimeStamp + getCycleDuration(2),
        );

      await expect(tx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(1, 1, 3, 3, 0, pauseTimeStamp);

      // Check subscription status

      await assertSubscriptionBatch(
        subscriptionEscrow,
        {
          productPassId: 1,
          productIds: [1, 2, 3],
        },
        [
          {
            orgId: 1,
            pricingId: 1,
            startDate: 0,
            endDate: purchaseTimeStamp + getCycleDuration(1),
            timeRemaining: 0,
            isCancelled: false,
            isPaused: true,
            status: 3,
          },
          {
            orgId: 1,
            pricingId: 2,
            startDate: 0,
            endDate: purchaseAdditionalTimeStamp + getCycleDuration(2),
            timeRemaining: 0,
            isCancelled: false,
            isPaused: true,
            status: 3,
          },
          {
            orgId: 1,
            pricingId: 3,
            startDate: 0,
            endDate: pauseTimeStamp,
            timeRemaining:
              purchaseAdditionalTimeStamp +
              getCycleDuration(3) -
              pauseTimeStamp,
            isCancelled: false,
            isPaused: true,
            status: 3,
          },
        ],
      );

      // Advance time and unpause all subscriptions
      await time.increase(getCycleDuration(5));

      await subscriptionEscrow.setSubscriptionsPausable(1, false);

      // UNPAUSE SUBSCRIPTIONS
      const unpauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscriptionBatch(1, [1, 2, 3], [false, false, false]);

      const { timestamp: unpauseTimeStamp } = await parseTimestamp(unpauseTx);

      // Check subscription status

      await assertSubscriptionBatch(
        subscriptionEscrow,
        {
          productPassId: 1,
          productIds: [1, 2, 3],
        },
        [
          {
            orgId: 1,
            pricingId: 1,
            startDate: unpauseTimeStamp,
            endDate: unpauseTimeStamp + getCycleDuration(1),
            timeRemaining: 0,
            isCancelled: false,
            isPaused: false,
            status: 0,
          },
          {
            orgId: 1,
            pricingId: 2,
            startDate: unpauseTimeStamp,
            endDate: unpauseTimeStamp + getCycleDuration(2),
            timeRemaining: 0,
            isCancelled: false,
            isPaused: false,
            status: 0,
          },
          {
            orgId: 1,
            pricingId: 3,
            startDate: unpauseTimeStamp,
            endDate:
              unpauseTimeStamp +
              (purchaseAdditionalTimeStamp +
                getCycleDuration(3) -
                pauseTimeStamp),
            timeRemaining: 0,
            isCancelled: false,
            isPaused: false,
            status: 0,
          },
        ],
      );
    });

    it('only the pass owner or org admin can pause the subscriptions', async () => {
      const { purchaseManager, otherAccount2 } =
        await loadMultipleBatchPauseSubscriptions();

      await expect(
        purchaseManager
          .connect(otherAccount2)
          .pauseSubscriptionBatch(1, [1, 2, 3], [true, true, true]),
      ).to.be.revertedWithCustomError(purchaseManager, 'NotAuthorized');
    });

    it('must pass at least one product id', async () => {
      const { purchaseManager, otherAccount } =
        await loadMultipleBatchPauseSubscriptions();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .pauseSubscriptionBatch(1, [], [true]),
      ).to.be.revertedWithCustomError(purchaseManager, 'NoProductsProvided');
    });

    it('must have the same number of product ids and pause states', async () => {
      const { purchaseManager, otherAccount } =
        await loadMultipleBatchPauseSubscriptions();

      await expect(
        purchaseManager
          .connect(otherAccount)
          .pauseSubscriptionBatch(1, [1, 2], [true]),
      ).to.be.revertedWithCustomError(
        purchaseManager,
        'ProductIdsAndStatusesLengthMismatch',
      );
    });
  });

  describe('Change Subscription Pricing', () => {
    it('only pass owner or org admin can change pricing', async () => {
      const { purchaseManager, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount2).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 2,
          airdrop: false,
        }),
      ).to.be.revertedWithCustomError(purchaseManager, 'NotAuthorized');
    });

    it('cannot change pricing if the new pricing id is the same as the old pricing id', async () => {
      const { purchaseManager, owner } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(owner).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 1,
          airdrop: false,
        }),
      ).to.be.revertedWith('Pricing ids are the same');
    });

    it('cannot change pricing if the subscription does not exist', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        owner,
        otherAccount,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
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
        { value: ethers.parseEther('1') },
      );

      await expect(
        purchaseManager.connect(owner).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 1,
          airdrop: false,
        }),
      ).to.be.revertedWith('Subscription does not exist');
    });

    it('cannot change pricing if the subscription is cancelled', async () => {
      const { purchaseManager, owner } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseManager.connect(owner).cancelSubscription(1, 1, true);

      await expect(
        purchaseManager.connect(owner).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 1,
          airdrop: false,
        }),
      ).to.be.revertedWith('Subscription is cancelled');
    });

    it('cannot change pricing if the subscription is paused', async () => {
      const { purchaseManager, subscriptionEscrow, owner } =
        await loadWithPurchasedFlatRateSubscription();

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      await purchaseManager.connect(owner).pauseSubscription(1, 1, true);

      await expect(
        purchaseManager.connect(owner).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 1,
          airdrop: false,
        }),
      ).to.be.revertedWith('Subscription is paused');
    });

    it('cannot change pricing if the subscription is past due', async () => {
      const { purchaseManager, owner } =
        await loadWithPurchasedFlatRateSubscription();

      await time.increase(getCycleDuration(1) + 1);

      await expect(
        purchaseManager.connect(owner).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 1,
          airdrop: false,
        }),
      ).to.be.revertedWith('Subscription is past due');
    });

    it('pass owner cannot change pricing if flag is false', async () => {
      const { purchaseManager, subscriptionEscrow, owner, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, false);

      await expect(
        purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 1,
          airdrop: false,
        }),
      ).to.be.revertedWith(
        'Organization does not allow pass owners to change pricing',
      );
    });

    it('cannot change pricing if not linked to product', async () => {
      const {
        purchaseManager,
        subscriptionEscrow,
        owner,
        otherAccount,
        productRegistry,
      } = await loadWithPurchasedFlatRateSubscription();

      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

      await expect(
        purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 2,
          airdrop: false,
        }),
      )
        .to.be.revertedWithCustomError(
          productRegistry,
          'PricingNotLinkedToProduct',
        )
        .withArgs(1, 2);
    });

    it('cannot change subscription to a one time pricing model', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        pricingCalculator,
        subscriptionEscrow,
        otherAccount,
        owner,
      } = await loadWithPurchasedFlatRateSubscription();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [2]);

      await time.increase(getCycleDuration(1) / 2);

      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

      await expect(
        purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 2,
          airdrop: false,
        }),
      ).to.be.revertedWithCustomError(pricingCalculator, 'InvalidChargeStyle');
    });

    it('can change to another flat rate pricing model with a larger cycle duration', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        subscriptionEscrow,
        purchaseTimeStamp,
        mintToken,
        owner,
        otherAccount,
      } = await loadWithPurchasedFlatRateSubscription();

      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('50', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 2,
      });

      await productRegistry.linkPricing(1, [2]);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      await time.increase(getCycleDuration(1) / 2);

      await purchaseManager.connect(otherAccount).changeSubscriptionPricing({
        orgId: 1,
        productPassId: 1,
        productId: 1,
        newPricingId: 2,
        airdrop: false,
      });

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('45.833411', 6),
      );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 2,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(2),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );
    });

    it('can airdrop a pricing change', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        subscriptionEscrow,
        purchaseTimeStamp,
        mintToken,
        owner,
        otherAccount,
      } = await loadWithPurchasedFlatRateSubscription();

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('50', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 2,
      });

      await productRegistry.linkPricing(1, [2]);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );
      expect(await mintToken.balanceOf(owner)).to.equal(
        ethers.parseUnits('0', 6),
      );

      await time.increase(getCycleDuration(1) / 2);

      await expect(
        purchaseManager.connect(owner).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 2,
          airdrop: true,
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
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(2),
        );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 2,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(2),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );
    });

    it('can change between multiple pricing models with smaller or the same cycle duration with no charge', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        subscriptionEscrow,
        purchaseTimeStamp,
        mintToken,
        owner,
        otherAccount,
      } = await loadWithPurchasedFlatRateSubscription();

      // Create pricing models
      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 0,
      });

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('30', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 1,
      });

      await productRegistry.linkPricing(1, [2, 3]);

      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

      await time.increase(getCycleDuration(1) / 2);

      // CHANGE PRICING TO A SMALLER CYCLE DURATION
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
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
        );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 2,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      // CHANGE PRICING TO THE ORIGINAL PRICING MODEL
      await expect(
        purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 1,
          airdrop: false,
        }),
      )
        .to.emit(subscriptionEscrow, 'SubscriptionPricingChanged')
        .withArgs(1, 1, 1, 1)
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
        );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      // CHANGE PRICING TO NEW PRICING MODEL WITH THE SAME CYCLE DURATION
      await expect(
        purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 3,
          airdrop: false,
        }),
      )
        .to.emit(subscriptionEscrow, 'SubscriptionPricingChanged')
        .withArgs(1, 1, 1, 3)
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(1),
        );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 3,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );
    });

    it('can change pricing to a new pricing model with a larger cycle duration and different token', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        subscriptionEscrow,
        purchaseTimeStamp,
        paymentEscrow,
        mintToken,
        owner,
        otherAccount,
      } = await loadWithPurchasedFlatRateSubscription();

      // Setup new token
      const MintToken = await hre.ethers.getContractFactory('MintToken');
      const mintToken2 = await MintToken.deploy();

      await paymentEscrow
        .connect(owner)
        .setWhitelistedToken(await mintToken2.getAddress(), true);

      await mintToken2
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken2
        .connect(otherAccount)
        .approve(paymentEscrow.getAddress(), ethers.parseUnits('100', 6));

      // Create pricing model
      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('20', 6),
        token: await mintToken2.getAddress(),
        isRestricted: false,
        chargeFrequency: 2,
      });

      await productRegistry.linkPricing(1, [2]);

      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      expect(await mintToken2.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('100', 6),
      );

      await time.increase(getCycleDuration(1) / 2);

      // CHANGE PRICING
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
          purchaseTimeStamp,
          purchaseTimeStamp + getCycleDuration(2),
        );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      expect(await mintToken2.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('82.333396', 6),
      );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 2,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(2),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );
    });

    it('cannot change from a flat rate to a tiered rate', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        subscriptionEscrow,
        purchaseTimeStamp,
        mintToken,
        owner,
        otherAccount,
      } = await loadWithPurchasedFlatRateSubscription();

      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 10,
            priceFlatRate: ethers.parseUnits('10', 6),
            pricePerUnit: ethers.parseUnits('1', 6),
          },
          {
            lowerBound: 11,
            upperBound: 0,
            priceFlatRate: ethers.parseUnits('5', 6),
            pricePerUnit: ethers.parseUnits('0.5', 6),
          },
        ],
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 2,
        isVolume: true,
      });

      await productRegistry.linkPricing(1, [2]);

      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      // CHANGE PRICING

      await time.increase(getCycleDuration(1) / 2);

      await expect(
        purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 2,
          airdrop: false,
        }),
      ).to.be.revertedWithCustomError(pricingRegistry, 'InvalidQuantity');
    });

    it('can change usage based pricing to a new usage based pricing with a larger cycle duration', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        subscriptionEscrow,
        organizationNFT,
        usageRecorder,
        paymentEscrow,
        mintToken,
        owner,
        otherAccount,
      } = await loadFixture(deployPurchaseManager);

      // Mint tokens
      await mintToken
        .connect(owner)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await organizationNFT.connect(owner).setMintOpen(true);

      await organizationNFT.connect(owner).mint(owner);

      await paymentEscrow
        .connect(owner)
        .setWhitelistedToken(await mintToken.getAddress(), true);

      // Create pricing models
      await usageRecorder.createMeter(1, 0);

      await pricingRegistry.createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('2', 6),
            priceFlatRate: ethers.parseUnits('10', 6),
          },
        ],
        isVolume: true,
        isRestricted: false,
        usageMeterId: 1,
      });

      await pricingRegistry.createUsageBasedSubscriptionPricing({
        organizationId: 1,
        token: await mintToken.getAddress(),
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('1', 6),
            priceFlatRate: ethers.parseUnits('20', 6),
          },
        ],
        isVolume: true,
        isRestricted: false,
        usageMeterId: 1,
      });

      // Create products
      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 1',
        description: 'Product 1 description',
        imageUrl: 'https://example.com/product1.png',
        externalUrl: 'https://example.com/product1',
        isTransferable: false,
      });

      await productRegistry.linkPricing(1, [1, 2]);

      // Purchase product
      const purchaseTx = await purchaseManager
        .connect(otherAccount)
        .purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        });

      const { timestamp: purchaseTimeStamp } = await parseTimestamp(purchaseTx);

      await time.increase(getCycleDuration(1) / 2);

      // Record usage
      await usageRecorder.connect(owner).increaseMeter(1, 1, 10);

      // Change pricing
      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);
      await purchaseManager.connect(otherAccount).changeSubscriptionPricing({
        orgId: 1,
        productPassId: 1,
        productId: 1,
        newPricingId: 2,
        airdrop: false,
      });

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 2,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(2),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('100', 6),
      );
      expect(await usageRecorder.passUsages(1, 1)).to.equal(10);
    });

    it('can change pricing on a paused subscription that gets unpaused', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        mintToken,
        otherAccount,
        subscriptionEscrow,
        purchaseTimeStamp,
        owner,
      } = await loadWithPurchasedFlatRateSubscription();

      // Create products
      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('30', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 1,
      });

      await productRegistry.linkPricing(1, [2]);

      await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

      await subscriptionEscrow.connect(owner).setSubscriptionsPausable(1, true);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: purchaseTimeStamp,
          endDate: purchaseTimeStamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      // PAUSE
      const pauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscription(1, 1, true);

      const { timestamp: pauseTimeStamp } = await parseTimestamp(pauseTx);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: 0,
          endDate: pauseTimeStamp,
          timeRemaining:
            purchaseTimeStamp + getCycleDuration(1) - pauseTimeStamp,
          isCancelled: false,
          isPaused: true,
          status: 3,
        },
      );

      // ADVANCE TIME
      await time.increase(getCycleDuration(1) / 2);

      const timeRemaining =
        purchaseTimeStamp + getCycleDuration(1) - pauseTimeStamp;

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: 0,
          endDate: pauseTimeStamp,
          timeRemaining,
          isCancelled: false,
          isPaused: true,
          status: 3,
        },
      );

      // UNPAUSE
      const unpauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscription(1, 1, false);

      const { timestamp: unpauseTimeStamp } = await parseTimestamp(unpauseTx);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: unpauseTimeStamp,
          endDate: unpauseTimeStamp + timeRemaining,
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );

      // CHANGE PRICING
      await purchaseManager.connect(otherAccount).changeSubscriptionPricing({
        orgId: 1,
        productPassId: 1,
        productId: 1,
        newPricingId: 2,
        airdrop: false,
      });

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 2,
          startDate: unpauseTimeStamp,
          endDate: unpauseTimeStamp + getCycleDuration(1) - 5, // 5 seconds for the pausing
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );
    });

    describe('Tiered pricing changes', () => {
      async function loadTieredPricingChange() {
        const results = await loadWithDefaultProduct();

        const {
          subscriptionEscrow,
          pricingRegistry,
          productRegistry,
          mintToken,
          paymentEscrow,
          owner,
          otherAccount,
        } = results;

        // Mint tokens
        await mintToken
          .connect(owner)
          .mint(otherAccount, ethers.parseUnits('100', 6));
        await mintToken
          .connect(otherAccount)
          .approve(paymentEscrow, ethers.parseUnits('100', 6));

        // Create pricing models
        await pricingRegistry.createTieredSubscriptionPricing({
          organizationId: 1,
          tiers: [
            {
              lowerBound: 1,
              upperBound: 0,
              priceFlatRate: ethers.parseUnits('20', 6),
              pricePerUnit: ethers.parseUnits('1', 6),
            },
          ],
          token: await mintToken.getAddress(),
          chargeFrequency: 1,
          isVolume: true,
          isRestricted: false,
        });
        await pricingRegistry.createTieredSubscriptionPricing({
          organizationId: 1,
          tiers: [
            {
              lowerBound: 1,
              upperBound: 0,
              priceFlatRate: ethers.parseUnits('30', 6),
              pricePerUnit: ethers.parseUnits('1', 6),
            },
          ],
          token: await mintToken.getAddress(),
          chargeFrequency: 2,
          isVolume: true,
          isRestricted: false,
        });

        await productRegistry.linkPricing(1, [1, 2]);

        await subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true);

        return results;
      }

      it('can change tiered pricing to a new tiered pricing with a larger cycle duration', async () => {
        const { purchaseManager, mintToken, otherAccount } =
          await loadTieredPricingChange();

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('100', 6),
        );

        // Purchase smaller tier
        await purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [10],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        });

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('70', 6),
        );

        await time.increase(getCycleDuration(1) / 2);

        // Change to larger cycle duration
        await purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 2,
          airdrop: false,
        });

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('34.666683', 6),
        );
      });

      it('purchase a smaller cycle duration, reduce the quantity, change to a larger cycle duration, and raise the quantity with proper charges', async () => {
        const { purchaseManager, mintToken, otherAccount } =
          await loadTieredPricingChange();

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('100', 6),
        );

        // Purchase larger tier
        await purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [10],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        });

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('70', 6),
        );

        await time.increase(getCycleDuration(1) / 2);

        // Reduce quantity
        await purchaseManager
          .connect(otherAccount)
          .changeTieredSubscriptionUnitQuantity(1, 1, 5, false);

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('70', 6),
        );

        // Change to larger cycle duration
        await purchaseManager.connect(otherAccount).changeSubscriptionPricing({
          orgId: 1,
          productPassId: 1,
          productId: 1,
          newPricingId: 2,
          airdrop: false,
        });

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('39.083361', 6),
        );

        // Raise quantity
        await purchaseManager
          .connect(otherAccount)
          .changeTieredSubscriptionUnitQuantity(1, 1, 10, false);

        expect(await mintToken.balanceOf(otherAccount)).to.equal(
          ethers.parseUnits('34.666701', 6),
        );
      });
    });
  });

  describe('Update unit quantities', () => {
    async function loadUnitQuantityUpdate() {
      const results = await loadWithDefaultProduct();

      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        paymentEscrow,
        mintToken,
        otherAccount,
        subscriptionEscrow,
      } = results;

      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            priceFlatRate: ethers.parseUnits('1', 6),
            pricePerUnit: ethers.parseUnits('0.1', 6),
          },
        ],
        token: await mintToken.getAddress(),
        chargeFrequency: 1,
        isVolume: false,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [10],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      )
        .to.emit(subscriptionEscrow, 'UnitQuantitySet')
        .withArgs(1, 1, 10, 10);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('98', 6),
      );

      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('2', 6),
      );

      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('2', 6));

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 10, 10,
      ]);

      return results;
    }

    it('should be able to update quantities after purchase with no charge when decreasing quantity', async () => {
      const { purchaseManager, mintToken, otherAccount, subscriptionEscrow } =
        await loadUnitQuantityUpdate();

      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 5, false),
      )
        .to.emit(subscriptionEscrow, 'UnitQuantitySet')
        .withArgs(1, 1, 5, 10);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('98', 6),
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 5, 10,
      ]);
    });

    it('should be to increase quantity then lower quantity and then raise quantity under the original max quantity with no charge', async () => {
      const { purchaseManager, mintToken, otherAccount, subscriptionEscrow } =
        await loadUnitQuantityUpdate();

      await time.increase(getCycleDuration(1) / 2);

      // RAISE QUANTITY TO MAX
      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 20, false),
      )
        .to.emit(subscriptionEscrow, 'UnitQuantitySet')
        .withArgs(1, 1, 20, 20);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('97.500002', 6),
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 20, 20,
      ]);

      // LOWER QUANTITY
      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 15, false),
      )
        .to.emit(subscriptionEscrow, 'UnitQuantitySet')
        .withArgs(1, 1, 15, 20);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('97.500002', 6),
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 15, 20,
      ]);

      // RAISE QUANTITY UNDER ORIGINAL MAX
      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 18, false),
      )
        .to.emit(subscriptionEscrow, 'UnitQuantitySet')
        .withArgs(1, 1, 18, 20);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('97.500002', 6),
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 18, 20,
      ]);

      // RAISE QUANTITY TO ORIGINAL MAX
      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 20, false),
      )
        .to.emit(subscriptionEscrow, 'UnitQuantitySet')
        .withArgs(1, 1, 20, 20);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('97.500002', 6),
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 20, 20,
      ]);

      // RAISE QUANTITY ABOVE ORIGINAL MAX
      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 30, false),
      )
        .to.emit(subscriptionEscrow, 'UnitQuantitySet')
        .withArgs(1, 1, 30, 30);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('97.000011', 6),
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 30, 30,
      ]);
    });

    it('cannot set unit quantity to 0', async () => {
      const { purchaseManager } = await loadUnitQuantityUpdate();

      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 0, false),
      ).to.be.revertedWith('Unit quantity is 0');
    });

    it('cannot set the unit quantity to the same quantity', async () => {
      const { purchaseManager, pricingCalculator } =
        await loadUnitQuantityUpdate();

      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 10, false),
      ).to.be.revertedWithCustomError(
        pricingCalculator,
        'UnitQuantityIsTheSame',
      );
    });

    it('can airdrop a unit quantity increase', async () => {
      const { purchaseManager, mintToken, otherAccount, subscriptionEscrow } =
        await loadUnitQuantityUpdate();

      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 20, true),
      )
        .to.emit(subscriptionEscrow, 'UnitQuantitySet')
        .withArgs(1, 1, 20, 20);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('98', 6),
      );
    });

    it('cannot update unity quantity for a flat rate subscription', async () => {
      const { purchaseManager } = await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.changeTieredSubscriptionUnitQuantity(1, 1, 20, false),
      ).to.be.revertedWith('Unit quantity does not exist');
    });
  });
});
