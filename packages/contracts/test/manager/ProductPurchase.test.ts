import { ethers } from 'hardhat';
import {
  assertSubscription,
  loadWithDefaultProduct,
  loadWithPurchasedFlatRateSubscription,
} from './helpers';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployPurchaseManager } from './helpers';
import { getCycleDuration } from '../../utils/cycle-duration';
import { parseTimestamp } from './helpers';
import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import {
  DEFAULT_PASS_METADATA,
  EXPECTED_DEFAULT_PASS_METADATA,
} from '../metadata/helpers';
import { assertMetadata } from '../metadata/helpers';
import { assertCheckoutTotalCost } from '../calculator/helpers';
import { hashPermissionId } from '../permission/helpers';

describe('Purchase Manager', () => {
  describe('Successful Product Purchase', () => {
    it('can airdrop a pass and mint a restricted discount onto it', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        discountRegistry,
        mintToken,
        owner,
        otherAccount,
        productPassNFT,
        purchaseRegistry,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await discountRegistry.createDiscount({
        orgId: 1,
        name: 'PASS_DISCOUNT',
        discount: 1000, // 10% off
        maxMints: 0,
        isActive: true,
        isRestricted: true,
      });

      await expect(
        purchaseManager.connect(owner).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [1],
          couponCode: '',
          airdrop: true,
          pause: false,
        }),
      )
        .to.emit(discountRegistry, 'DiscountMinted')
        .withArgs(1, 1, 1, owner)
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1],
          [1],
          [0],
          await mintToken.getAddress(),
          ethers.parseEther('1'),
        );

      expect(await productPassNFT.ownerOf(1)).to.equal(otherAccount);
      expect(await purchaseRegistry.getPassProductIds(1)).to.deep.equal([1]);
      expect(await purchaseRegistry.hasPassPurchasedProducts(1, [1])).to.equal(
        true,
      );
      expect(await purchaseRegistry.productSupply(1)).to.equal(1);
      expect(await purchaseRegistry.passOrganization(1)).to.equal(1);
      expect(await purchaseRegistry.passMintCount(1, owner)).to.equal(1);
      expect(await purchaseRegistry.passMintCount(1, otherAccount)).to.equal(0);

      expect(await discountRegistry.hasPassDiscount(1, 1)).to.equal(true);
      expect(await discountRegistry.getTotalPassDiscount(1)).to.equal(1000);
      expect(await discountRegistry.getPassDiscountIds(1)).to.deep.equal([1]);
    });

    it('can purchase product one time product with native currency', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        productPassNFT,
        couponRegistry,
        pricingCalculator,
        purchaseRegistry,
        paymentEscrow,
        subscriptionEscrow,
        otherAccount,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('10'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await assertCheckoutTotalCost(
        pricingCalculator,
        {
          organizationId: 1,
          productPassOwner: otherAccount,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponId: 0,
        },
        {
          pricingIds: [1],
          token: ethers.ZeroAddress,
          costs: [ethers.parseEther('10')],
          couponCost: 0,
          couponDiscount: 0,
          couponSavings: 0,
          permanentCost: 0,
          permanentDiscount: 0,
          permanentSavings: 0,
          subTotalCost: ethers.parseEther('10'),
          checkoutTotalCost: ethers.parseEther('10'),
        },
      );

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

      // ASSERTIONS

      // Subscription escrow
      expect(await subscriptionEscrow.getPassSubs(1)).to.deep.equal([]);

      // Manager
      expect(await purchaseManager.passSupply()).to.equal(1);

      // Coupon registry
      expect(await couponRegistry.passOwnerCodes(1, otherAccount)).to.equal('');

      // Passes
      expect(await productPassNFT.ownerOf(1)).to.equal(otherAccount);

      // Purchase registry
      expect(await purchaseRegistry.getPassProductIds(1)).to.deep.equal([1]);
      expect(await purchaseRegistry.hasPassPurchasedProducts(1, [1])).to.equal(
        true,
      );
      expect(await purchaseRegistry.productSupply(1)).to.equal(1);
      expect(await purchaseRegistry.passOrganization(1)).to.equal(1);
      expect(await purchaseRegistry.passMintCount(1, otherAccount)).to.equal(1);

      // Payment escrow
      expect(await paymentEscrow.orgBalances(1, ethers.ZeroAddress)).to.equal(
        ethers.parseEther('10'),
      );

      // Native token balances
      expect(await ethers.provider.getBalance(paymentEscrow)).to.equal(
        ethers.parseEther('10'),
      );
    });

    it('multiple accounts should purchase one time products with one using a coupon', async () => {
      const {
        purchaseManager,
        organizationNFT,
        productRegistry,
        pricingRegistry,
        purchaseRegistry,
        passMetadataProvider,
        pricingCalculator,
        couponRegistry,
        productPassNFT,
        mintToken,
        paymentEscrow,
        subscriptionEscrow,
        owner,
        otherAccount,
        otherAccount2,
        usageRecorder,
      } = await loadFixture(deployPurchaseManager);

      await passMetadataProvider.setDefaultMetadata(DEFAULT_PASS_METADATA);

      // Create the org for the owner account
      await organizationNFT.mint(owner);

      // Whitelist the mint token
      await paymentEscrow.setWhitelistedToken(
        await mintToken.getAddress(),
        true,
      );

      // Mint tokens to the other accounts
      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('1000', 6));
      await mintToken
        .connect(otherAccount2)
        .mint(otherAccount2, ethers.parseUnits('500', 6));

      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount2)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      const currentTime = await time.latest();

      // Create the coupon
      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON1',
        discount: 1000,
        expiration: currentTime + 1000,
        maxTotalRedemptions: 10,
        isInitialPurchaseOnly: true,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: true,
      });

      // Create products
      await productRegistry.createProduct({
        orgId: 1,
        name: 'Name 1',
        description: 'P1 Description',
        imageUrl: 'https://example.com/product1',
        externalUrl: 'https://example.com/product1-image',
        isTransferable: false,
      });
      await productRegistry.createProduct({
        orgId: 1,
        name: 'Name 2',
        description: 'P2 Description',
        imageUrl: 'https://example.com/product2',
        externalUrl: 'https://example.com/product2-image',
        isTransferable: false,
      });

      // Create the pricing
      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });
      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('20', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      // Link the pricing to the product
      await productRegistry.linkPricing(1, [1]);
      await productRegistry.linkPricing(2, [1, 2]);

      // Initial checks
      expect(
        await couponRegistry.hasRedeemedCoupon(1, otherAccount, 1),
      ).to.equal(false);
      expect(
        await couponRegistry.hasRedeemedCoupon(1, otherAccount2, 1),
      ).to.equal(false);

      // Assert the checkout total costs
      await assertCheckoutTotalCost(
        pricingCalculator,
        {
          organizationId: 1,
          productPassOwner: otherAccount,
          productIds: [1, 2],
          pricingIds: [1, 2],
          quantities: [0, 0],
          discountIds: [],
          couponId: 1,
        },
        {
          pricingIds: [1, 2],
          token: await mintToken.getAddress(),
          costs: [ethers.parseUnits('10', 6), ethers.parseUnits('20', 6)],
          couponCost: ethers.parseUnits('27', 6),
          couponDiscount: 1000,
          couponSavings: ethers.parseUnits('3', 6),
          permanentCost: 0,
          permanentDiscount: 0,
          permanentSavings: 0,
          subTotalCost: ethers.parseUnits('30', 6),
          checkoutTotalCost: ethers.parseUnits('27', 6),
        },
      );

      await assertCheckoutTotalCost(
        pricingCalculator,
        {
          organizationId: 1,
          productPassOwner: otherAccount2,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponId: 0,
        },
        {
          pricingIds: [1],
          token: await mintToken.getAddress(),
          costs: [ethers.parseUnits('10', 6)],
          couponCost: 0,
          couponDiscount: 0,
          couponSavings: 0,
          permanentCost: 0,
          permanentDiscount: 0,
          permanentSavings: 0,
          subTotalCost: ethers.parseUnits('10', 6),
          checkoutTotalCost: ethers.parseUnits('10', 6),
        },
      );

      // PURCHASE PRODUCT
      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1, 2],
          pricingIds: [1, 2],
          quantities: [0, 0],
          discountIds: [],
          airdrop: false,
          pause: false,
          couponCode: 'COUPON1',
        }),
      )
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1, 2],
          [1, 2],
          [0, 0],
          await mintToken.getAddress(),
          ethers.parseUnits('30', 6),
        )
        .and.to.emit(productPassNFT, 'Transfer')
        .withArgs(ethers.ZeroAddress, otherAccount, 1)
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('27', 6),
        )
        .and.to.emit(paymentEscrow, 'TransferAmount')
        .withArgs(
          1,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('27', 6),
          ethers.parseUnits('27', 6),
        );

      await expect(
        purchaseManager.connect(otherAccount2).purchaseProducts({
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          airdrop: false,
          pause: false,
          couponCode: '',
        }),
      )
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          2,
          otherAccount2,
          [1],
          [1],
          [0],
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
        )
        .and.to.emit(productPassNFT, 'Transfer')
        .withArgs(ethers.ZeroAddress, otherAccount2, 2)
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount2,
          otherAccount2,
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
        )
        .and.to.emit(paymentEscrow, 'TransferAmount')
        .withArgs(
          1,
          otherAccount2,
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
          ethers.parseUnits('10', 6),
        );

      // ASSERTIONS

      // Manager
      expect(await purchaseManager.passSupply()).to.equal(2);

      // Passes
      expect(await productPassNFT.ownerOf(1)).to.equal(otherAccount);
      expect(await productPassNFT.ownerOf(2)).to.equal(otherAccount2);

      // Purchase registry
      expect(await purchaseRegistry.getPassProductIds(1)).to.deep.equal([1, 2]);
      expect(
        await purchaseRegistry.hasPassPurchasedProducts(1, [1, 2]),
      ).to.equal(true);
      expect(await purchaseRegistry.getPassProductIds(2)).to.deep.equal([1]);
      expect(await purchaseRegistry.hasPassPurchasedProducts(2, [1])).to.equal(
        true,
      );
      expect(await purchaseRegistry.productSupply(1)).to.equal(2);
      expect(await purchaseRegistry.productSupply(2)).to.equal(1);
      expect(await purchaseRegistry.passOrganization(1)).to.equal(1);
      expect(await purchaseRegistry.passOrganization(2)).to.equal(1);
      expect(await purchaseRegistry.passMintCount(1, otherAccount)).to.equal(1);
      expect(await purchaseRegistry.passMintCount(1, otherAccount2)).to.equal(
        1,
      );

      // Payment escrow
      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('37', 6));

      // Mint token balances
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('973', 6),
      );
      expect(await mintToken.balanceOf(otherAccount2)).to.equal(
        ethers.parseUnits('490', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('37', 6),
      );

      // Subscription escrow
      expect(await subscriptionEscrow.getPassSubs(1)).to.deep.equal([]);
      await expect(subscriptionEscrow.getSubscription(1, 1)).to.be.revertedWith(
        'Subscription does not exist',
      );
      await expect(subscriptionEscrow.getSubscription(1, 2)).to.be.revertedWith(
        'Subscription does not exist',
      );
      await expect(subscriptionEscrow.getSubscription(2, 1)).to.be.revertedWith(
        'Subscription does not exist',
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        0, 0, 0,
      ]);
      expect(await subscriptionEscrow.getUnitQuantityFull(1, 2)).to.deep.equal([
        0, 0, 0,
      ]);
      expect(await subscriptionEscrow.getUnitQuantityFull(2, 1)).to.deep.equal([
        0, 0, 0,
      ]);

      // Usage recorder
      expect(await usageRecorder.passUsages(1, 1)).to.equal(0);
      expect(await usageRecorder.passUsages(1, 2)).to.equal(0);
      expect(await usageRecorder.passUsages(2, 1)).to.equal(0);

      // Coupon registry
      expect(await couponRegistry.passOwnerCodes(1, otherAccount)).to.equal(
        'COUPON1',
      );
      expect(await couponRegistry.passOwnerCodes(1, otherAccount2)).to.equal(
        '',
      );

      expect(
        await couponRegistry.hasRedeemedCoupon(1, otherAccount, 1),
      ).to.equal(true);
      expect(
        await couponRegistry.hasRedeemedCoupon(1, otherAccount2, 1),
      ).to.equal(false);

      expect(
        await couponRegistry.getRedeemedCoupons(1, otherAccount),
      ).to.deep.equal([1]);
      expect(
        await couponRegistry.getRedeemedCoupons(1, otherAccount2),
      ).to.deep.equal([]);

      await expect(
        couponRegistry.isCodeRedeemable(1, otherAccount, 'COUPON1', true),
      )
        .to.be.revertedWithCustomError(couponRegistry, 'CouponAlreadyRedeemed')
        .withArgs(1, otherAccount);
      await couponRegistry.isCodeRedeemable(1, otherAccount2, 'COUPON1', true);

      expect(await couponRegistry.getCoupon(1)).to.deep.equal([
        1,
        'COUPON1',
        1000,
        currentTime + 1000,
        1,
        10,
        true,
        true,
        false,
        true,
      ]);

      // Metadata
      const pass1Metadata = await productPassNFT.tokenURI(1);
      const pass2Metadata = await productPassNFT.tokenURI(2);

      assertMetadata(pass1Metadata, {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '1' },
          { trait_type: 'Product 1', value: 'Name 1' },
          { trait_type: 'Product 2', value: 'Name 2' },
        ],
      });

      assertMetadata(pass2Metadata, {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '1' },
          { trait_type: 'Product 1', value: 'Name 1' },
        ],
      });
    });

    it('can purchase subscription with an initial purchase coupon and renew it with coupon still set', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        couponRegistry,
        subscriptionEscrow,
        mintToken,
        paymentEscrow,
        otherAccount,
      } = await loadWithDefaultProduct();

      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('1000', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('1000', 6));

      // Create the coupon
      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON1',
        discount: 1000,
        expiration: (await time.latest()) + 1000,
        maxTotalRedemptions: 1,
        isInitialPurchaseOnly: true,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: false,
      });

      // Create the pricing
      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        chargeFrequency: 1,
        isRestricted: false,
        token: await mintToken.getAddress(),
      });

      // Link the pricing to the product
      await productRegistry.linkPricing(1, [1]);

      // INITIAL PURCHASE
      await purchaseManager.connect(otherAccount).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: 'COUPON1',
        airdrop: false,
        pause: false,
      });

      // ASSERTIONS

      // Mint token balances
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('991', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('9', 6),
      );

      expect(await couponRegistry.passOwnerCodes(1, otherAccount)).to.equal(
        'COUPON1',
      );

      // Advance the time
      await time.increase(getCycleDuration(1) + 1);

      // Check the renewal cost
      let [orgId, tokens, prices] = await subscriptionEscrow.getRenewalCost(
        1,
        1,
      );
      expect(orgId).to.equal(1);
      expect(tokens).to.deep.equal(await mintToken.getAddress());
      expect(prices).to.equal(ethers.parseUnits('10', 6));

      // RENEWAL
      const tx = await purchaseManager
        .connect(otherAccount)
        .renewSubscription(1, 1, false);

      const { timestamp: renewalTimestamp } = await parseTimestamp(tx);

      // ASSERTIONS

      // Check the renewal cost
      [orgId, tokens, prices] = await subscriptionEscrow.getRenewalCost(1, 1);
      expect(orgId).to.equal(1);
      expect(tokens).to.deep.equal(await mintToken.getAddress());
      expect(prices).to.equal(ethers.parseUnits('10', 6));

      expect(await couponRegistry.passOwnerCodes(1, otherAccount)).to.equal('');

      // Mint token balances
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('981', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('19', 6),
      );

      // Subscription escrow
      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: renewalTimestamp,
          endDate: renewalTimestamp + getCycleDuration(1),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await subscriptionEscrow.getPassSubs(1)).to.deep.equal([1]);
    });

    it('can purchase flat rate subscription product and renew it even with pricing set to inactive', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        purchaseRegistry,
        subscriptionEscrow,
        pricingCalculator,
        mintToken,
        usageRecorder,
        paymentEscrow,
        otherAccount,
        otherAccount2,
      } = await loadWithDefaultProduct();

      // Mint tokens and approve escrow to spend
      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('1000', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('1000', 6));

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        chargeFrequency: 1,
        isRestricted: false,
        token: await mintToken.getAddress(),
      });

      const cycleDuration = getCycleDuration(1);

      await productRegistry.linkPricing(1, [1]);

      // Assert the checkout total costs
      await assertCheckoutTotalCost(
        pricingCalculator,
        {
          organizationId: 1,
          productPassOwner: otherAccount,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponId: 0,
        },
        {
          pricingIds: [1],
          token: await mintToken.getAddress(),
          costs: [ethers.parseUnits('10', 6)],
          couponCost: 0,
          couponDiscount: 0,
          couponSavings: 0,
          permanentCost: 0,
          permanentDiscount: 0,
          permanentSavings: 0,
          subTotalCost: ethers.parseUnits('10', 6),
          checkoutTotalCost: ethers.parseUnits('10', 6),
        },
      );

      // INITIAL PURCHASE
      let tx = await purchaseManager.connect(otherAccount).purchaseProducts({
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

      const { timestamp } = await parseTimestamp(tx);

      await expect(tx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(1, 1, 1, 0, timestamp, timestamp + cycleDuration)
        .and.to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1],
          [1],
          [0],
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
        )
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
        )
        .and.to.emit(paymentEscrow, 'TransferAmount')
        .withArgs(
          1,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
          ethers.parseUnits('10', 6),
        );
      // INITIAL ASSERTIONS
      expect(await purchaseRegistry.getPassProductIds(1)).to.deep.equal([1]);
      expect(await purchaseRegistry.hasPassPurchasedProducts(1, [1])).to.equal(
        true,
      );
      expect(await purchaseRegistry.productSupply(1)).to.equal(1);
      expect(await purchaseRegistry.passOrganization(1)).to.equal(1);
      expect(await purchaseRegistry.passMintCount(1, otherAccount)).to.equal(1);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: timestamp,
          endDate: timestamp + cycleDuration,
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        0, 0, 0,
      ]);
      expect(await usageRecorder.passUsages(1, 1)).to.equal(0);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('990', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('10', 6),
      );

      // Set the pricing to inactive
      await pricingRegistry.setPricingActive(1, false);

      // RENEWAL
      await time.increase(cycleDuration);

      tx = await purchaseManager
        .connect(otherAccount2)
        .renewSubscription(1, 1, false);

      const { timestamp: renewalTimestamp } = await parseTimestamp(tx);

      await expect(tx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          renewalTimestamp,
          renewalTimestamp + cycleDuration,
        )
        .and.to.emit(purchaseManager, 'SubscriptionRenewed')
        .withArgs(
          1,
          1,
          1,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
        );

      // RENEWAL ASSERTIONS
      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: renewalTimestamp,
          endDate: renewalTimestamp + cycleDuration,
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('980', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('20', 6),
      );
    });

    it('can purchase tiered subscription product and renew it with inactive pricing', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        purchaseRegistry,
        subscriptionEscrow,
        pricingCalculator,
        mintToken,
        usageRecorder,
        paymentEscrow,
        otherAccount,
        otherAccount2,
      } = await loadWithDefaultProduct();

      // Mint tokens and approve escrow to spend
      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('1000', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('1000', 6));

      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        tiers: [
          {
            lowerBound: 1,
            upperBound: 50,
            pricePerUnit: ethers.parseUnits('1', 6),
            priceFlatRate: ethers.parseUnits('2', 6),
          },
          {
            lowerBound: 51,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('2', 6),
            priceFlatRate: ethers.parseUnits('4', 6),
          },
        ],
        chargeFrequency: 2,
        isVolume: true,
        isRestricted: false,
        token: await mintToken.getAddress(),
      });

      await productRegistry.linkPricing(1, [1]);

      // Assert the checkout total costs
      await assertCheckoutTotalCost(
        pricingCalculator,
        {
          organizationId: 1,
          productPassOwner: otherAccount,
          productIds: [1],
          pricingIds: [1],
          quantities: [100],
          discountIds: [],
          couponId: 0,
        },
        {
          pricingIds: [1],
          token: await mintToken.getAddress(),
          costs: [ethers.parseUnits('204', 6)],
          couponCost: 0,
          couponDiscount: 0,
          couponSavings: 0,
          permanentCost: 0,
          permanentDiscount: 0,
          permanentSavings: 0,
          subTotalCost: ethers.parseUnits('204', 6),
          checkoutTotalCost: ethers.parseUnits('204', 6),
        },
      );

      // INITIAL PURCHASE
      let tx = await purchaseManager.connect(otherAccount).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [100],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      const { timestamp } = await parseTimestamp(tx);

      // INITIAL ASSERTIONS
      expect(await purchaseRegistry.getPassProductIds(1)).to.deep.equal([1]);
      expect(await purchaseRegistry.hasPassPurchasedProducts(1, [1])).to.equal(
        true,
      );
      expect(await purchaseRegistry.productSupply(1)).to.equal(1);
      expect(await purchaseRegistry.passOrganization(1)).to.equal(1);
      expect(await purchaseRegistry.passMintCount(1, otherAccount)).to.equal(1);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: timestamp,
          endDate: timestamp + getCycleDuration(2),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 100, 100,
      ]);
      expect(await usageRecorder.passUsages(1, 1)).to.equal(0);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('796', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('204', 6),
      );

      // LOWER QUANTITY

      await purchaseManager.changeTieredSubscriptionUnitQuantity(
        1,
        1,
        90,
        false,
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('796', 6),
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 90, 100,
      ]);

      // Set the pricing to inactive
      await pricingRegistry.setPricingActive(1, false);

      // RENEWAL
      await time.increase(getCycleDuration(2));

      tx = await purchaseManager
        .connect(otherAccount2)
        .renewSubscription(1, 1, false);

      const { timestamp: renewalTimestamp } = await parseTimestamp(tx);

      await expect(tx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          renewalTimestamp,
          renewalTimestamp + getCycleDuration(2),
        )
        .and.to.emit(purchaseManager, 'SubscriptionRenewed')
        .withArgs(
          1,
          1,
          1,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('184', 6),
        );

      // RENEWAL ASSERTIONS
      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: renewalTimestamp,
          endDate: renewalTimestamp + getCycleDuration(2),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        1, 90, 90,
      ]);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('612', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('388', 6),
      );
    });

    async function purchaseUsageBasedSubscription(usage: number) {
      const contracts = await loadWithDefaultProduct();

      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        purchaseRegistry,
        subscriptionEscrow,
        mintToken,
        paymentEscrow,
        usageRecorder,
        owner,
        otherAccount,
        otherAccount2,
      } = contracts;

      // Mint tokens and approve escrow to spend
      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('1000', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('1000', 6));

      await usageRecorder.connect(owner).createMeter(1, 0);

      await pricingRegistry.createUsageBasedSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 2,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 100,
            pricePerUnit: ethers.parseUnits('2', 6),
            priceFlatRate: ethers.parseUnits('4', 6),
          },
          {
            lowerBound: 101,
            upperBound: 0,
            pricePerUnit: ethers.parseUnits('1', 6),
            priceFlatRate: ethers.parseUnits('2', 6),
          },
        ],
        isVolume: false,
        isRestricted: false,
        token: await mintToken.getAddress(),
        usageMeterId: 1,
      });

      await productRegistry.linkPricing(1, [1]);

      // INITIAL PURCHASE
      let tx = await purchaseManager.connect(otherAccount).purchaseProducts({
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

      const { timestamp } = await parseTimestamp(tx);

      // INITIAL ASSERTIONS
      expect(await purchaseRegistry.getPassProductIds(1)).to.deep.equal([1]);
      expect(await purchaseRegistry.hasPassPurchasedProducts(1, [1])).to.equal(
        true,
      );
      expect(await purchaseRegistry.productSupply(1)).to.equal(1);
      expect(await purchaseRegistry.passOrganization(1)).to.equal(1);
      expect(await purchaseRegistry.passMintCount(1, otherAccount)).to.equal(1);

      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: timestamp,
          endDate: timestamp + getCycleDuration(2),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      expect(await subscriptionEscrow.getUnitQuantityFull(1, 1)).to.deep.equal([
        0, 0, 0,
      ]);
      expect(await usageRecorder.passUsages(1, 1)).to.equal(0);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1000', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('0', 6),
      );

      // Set the pricing to inactive
      await pricingRegistry.setPricingActive(1, false);

      // RECORD USAGE
      await usageRecorder.increaseMeter(1, 1, usage);

      // RENEWAL
      await time.increase(getCycleDuration(2));

      const renewalTxPromise = await purchaseManager
        .connect(otherAccount2)
        .renewSubscription(1, 1, false);

      const { timestamp: renewalTimestamp } = await parseTimestamp(
        renewalTxPromise,
      );

      await expect(renewalTxPromise)
        .to.emit(usageRecorder, 'MeterUsageSet')
        .withArgs(1, 1, 1, 0)
        .and.to.emit(usageRecorder, 'MeterPaymentProcessed')
        .withArgs(1, 1, 1, usage)
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(
          1,
          1,
          1,
          0,
          renewalTimestamp,
          renewalTimestamp + getCycleDuration(2),
        );

      // RENEWAL ASSERTIONS
      await assertSubscription(
        subscriptionEscrow,
        {
          productPassId: 1,
          productId: 1,
        },
        {
          orgId: 1,
          pricingId: 1,
          startDate: renewalTimestamp,
          endDate: renewalTimestamp + getCycleDuration(2),
          timeRemaining: 0,
          isCancelled: false,
          isPaused: false,
          status: 0,
        },
      );

      return {
        ...contracts,
        renewalTimestamp,
      };
    }

    it('can purchase usage based subscription product and renew it with usage', async () => {
      const { paymentEscrow, mintToken, otherAccount } =
        await purchaseUsageBasedSubscription(120);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('774', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('226', 6),
      );
    });

    it('can purchase usage based subscription product and renew it without usage', async () => {
      const { paymentEscrow, mintToken, otherAccount } =
        await purchaseUsageBasedSubscription(0);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1000', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('0', 6),
      );
    });

    it('can purchase a product if the organization is whitelist only and the address is whitelisted', async () => {
      const {
        purchaseManager,
        purchaseRegistry,
        pricingRegistry,
        otherAccount,
        productRegistry,
      } = await loadWithDefaultProduct();

      await purchaseRegistry.setWhitelist(1, true);

      await purchaseRegistry.whitelistPassOwners(1, [otherAccount], [true]);

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts(
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
        ),
      ).to.not.be.reverted;
    });

    it('can purchase a product pass with a subscription in paused state if the org allows it', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        subscriptionEscrow,
        mintToken,
        paymentEscrow,
        otherAccount,
      } = await loadWithDefaultProduct();

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 1,
      });

      await productRegistry.linkPricing(1, [1]);

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
          pause: true,
        }),
      )
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(1, 1, 1, 3, 0, 0)
        .and.to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1],
          [1],
          [0],
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
        )
        .and.to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
        )
        .and.to.emit(paymentEscrow, 'TransferAmount')
        .withArgs(
          1,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
          ethers.parseUnits('10', 6),
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
          startDate: 0,
          endDate: 0,
          timeRemaining: getCycleDuration(1),
          isCancelled: false,
          isPaused: true,
          status: 3,
        },
      );

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('90', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('10', 6),
      );
    });

    it('can gift purchase a product pass using your own coupons and minting discounts and force sub into pause state', async () => {
      const {
        purchaseManager,
        discountRegistry,
        couponRegistry,
        pricingRegistry,
        productRegistry,
        productPassNFT,
        purchaseRegistry,
        subscriptionEscrow,
        paymentEscrow,
        mintToken,
        otherAccount,
        otherAccount2,
      } = await loadWithDefaultProduct();

      await subscriptionEscrow.setSubscriptionsPausable(1, true);
      await purchaseRegistry.setGiftingEnabled(1, true);

      // Mint tokens

      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      // Create pricing

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('100', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 1,
      });

      await productRegistry.linkPricing(1, [1]);

      // Create coupon

      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON1',
        discount: 1000,
        expiration: (await time.latest()) + 1000,
        maxTotalRedemptions: 10,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: true,
        isOneTimeUse: true,
      });

      await couponRegistry.setRestrictedAccess(1, [otherAccount], [true]);

      // Create discount

      await discountRegistry.createDiscount({
        orgId: 1,
        name: 'DISCOUNT1',
        discount: 1500,
        maxMints: 10,
        isActive: true,
        isRestricted: true,
      });

      await discountRegistry.setRestrictedAccess(1, [otherAccount], [true]);

      // Purchase product pass

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [1],
          couponCode: 'COUPON1',
          airdrop: false,
          pause: false,
        }),
      )
        .to.emit(discountRegistry, 'DiscountMinted')
        .withArgs(1, 1, 1, otherAccount)
        .to.emit(purchaseManager, 'PerformPurchase')
        .withArgs(
          1,
          otherAccount2,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('76.5', 6),
        );

      // Assertions

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('23.5', 6),
      );
      expect(await productPassNFT.ownerOf(1)).to.equal(otherAccount2);
      expect(await purchaseManager.passSupply()).to.equal(1);
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
          endDate: 0,
          timeRemaining: getCycleDuration(1),
          isCancelled: false,
          isPaused: true,
          status: 3,
        },
      );
    });

    it('can airdrop multiple passes even when org has a whitelist with active subs', async () => {
      const {
        purchaseManager,
        purchaseRegistry,
        productPassNFT,
        owner,
        otherAccount,
        otherAccount2,
        subscriptionEscrow,
      } = await loadWithPurchasedFlatRateSubscription();

      expect(await subscriptionEscrow.subscriptionsPauseable(1)).to.equal(
        false,
      );

      await purchaseRegistry.setWhitelist(1, true);

      await purchaseManager.connect(owner).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: true,
        pause: false,
      });

      await purchaseManager.connect(owner).purchaseProducts({
        to: otherAccount2,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: true,
        pause: false,
      });

      expect(await productPassNFT.ownerOf(2)).to.equal(otherAccount);
      expect(await productPassNFT.ownerOf(3)).to.equal(otherAccount2);
    });

    it('can airdrop passes to multiple addresses when when max mints is reached by admin', async () => {
      const {
        purchaseManager,
        purchaseRegistry,
        productPassNFT,
        owner,
        otherAccount,
        otherAccount2,
      } = await loadWithPurchasedFlatRateSubscription();

      await purchaseRegistry.setMaxMints(1, 1);

      await purchaseManager.connect(owner).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: true,
        pause: false,
      });

      await purchaseManager.connect(owner).purchaseProducts({
        to: otherAccount2,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: true,
        pause: false,
      });

      expect(await productPassNFT.ownerOf(2)).to.equal(otherAccount);
      expect(await productPassNFT.ownerOf(3)).to.equal(otherAccount2);
    });
  });

  describe('Failed Product Purchase', () => {
    it('cannot gift a product pass to someone that is not authorized to use the pricing model', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        otherAccount,
        otherAccount2,
        mintToken,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('100', 6),
        token: await mintToken.getAddress(),
        isRestricted: true,
        chargeFrequency: 1,
      });

      await productRegistry.linkPricing(1, [1]);

      await pricingRegistry.setRestrictedAccess(1, [otherAccount], [true]);

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWithCustomError(
        pricingRegistry,
        'PricingRestrictedAccess',
      );
    });

    it('reverts when gifting a pass to someone that has already reached the max mints', async () => {
      const { purchaseManager, purchaseRegistry, otherAccount, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseRegistry.setMaxMints(1, 1);
      await purchaseRegistry.setGiftingEnabled(1, true);

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWithCustomError(purchaseRegistry, 'MaxMintsReached');
    });

    it('reverts when attempting to a gift a pass to someone when gifting is disabled', async () => {
      const { purchaseManager, purchaseRegistry, otherAccount, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      )
        .to.be.revertedWithCustomError(purchaseRegistry, 'GiftingIsDisabled')
        .withArgs(1);
    });

    it('reverts when the minter is not whitelisted even if the future pass owner is whitelisted during a gift purchase', async () => {
      const { purchaseManager, purchaseRegistry, otherAccount, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await purchaseRegistry.setGiftingEnabled(1, true);
      await purchaseRegistry.setWhitelist(1, true);
      await purchaseRegistry.whitelistPassOwners(
        1,
        [otherAccount, otherAccount2],
        [false, true],
      );

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWithCustomError(
        purchaseRegistry,
        'AddressNotWhitelisted',
      );
    });

    it('cannot purchase a paused subscription product if the org does not allow it', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        mintToken,
        paymentEscrow,
        otherAccount,
        subscriptionEscrow,
      } = await loadWithDefaultProduct();

      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
        chargeFrequency: 1,
      });

      await productRegistry.linkPricing(1, [1]);

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
          pause: true,
        }),
      ).to.be.revertedWithCustomError(
        subscriptionEscrow,
        'OrganizationIsNotPausable',
      );
    });

    it('cannot purchase products with a coupon that is not set for the org', async () => {
      const {
        purchaseManager,
        couponRegistry,
        productRegistry,
        pricingRegistry,
        otherAccount,
      } = await loadWithDefaultProduct();

      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON1',
        discount: 1000,
        expiration: (await time.latest()) + 1000,
        maxTotalRedemptions: 10,
        isInitialPurchaseOnly: false,
        isActive: false,
        isRestricted: false,
        isOneTimeUse: true,
      });

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts(
          {
            to: otherAccount,
            organizationId: 1,
            productIds: [1],
            pricingIds: [1],
            quantities: [0],
            discountIds: [],
            airdrop: false,
            pause: false,
            couponCode: 'COUPON1',
          },
          { value: ethers.parseEther('1') },
        ),
      ).to.be.revertedWithCustomError(purchaseManager, 'InvalidCouponCode');
    });

    it('cannot purchase the same product twice during initial purchase', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        purchaseRegistry,
        otherAccount,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1, 1],
          pricingIds: [1, 1],
          quantities: [0, 0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWithCustomError(purchaseRegistry, 'ProductAlreadyAdded');
    });

    it('cannot add an additional product to a pass that has already been purchased', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        purchaseRegistry,
        mintToken,
        paymentEscrow,
        owner,
        otherAccount,
      } = await loadWithDefaultProduct();

      await mintToken.mint(owner, ethers.parseUnits('100', 6));
      await mintToken.approve(paymentEscrow, ethers.parseUnits('100', 6));

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('1', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      const purchaseParams = {
        to: owner,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      };

      await purchaseManager.purchaseProducts(purchaseParams);

      await expect(
        purchaseManager.connect(otherAccount).purchaseAdditionalProducts({
          productPassId: 1,
          ...purchaseParams,
        }),
      ).to.be.revertedWithCustomError(purchaseManager, 'NotAuthorized');

      await expect(
        purchaseManager.connect(owner).purchaseAdditionalProducts({
          productPassId: 1,
          ...purchaseParams,
        }),
      ).to.be.revertedWithCustomError(purchaseRegistry, 'ProductAlreadyAdded');
    });

    it('cannot purchase product if incorrect native token sent in tx', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        otherAccount,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

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
      ).to.be.revertedWith('Insufficient funds');

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts(
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
          { value: ethers.parseEther('1.1') },
        ),
      ).to.be.revertedWith('Insufficient funds');

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts(
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
          { value: ethers.parseEther('0.9') },
        ),
      ).to.be.revertedWith('Insufficient funds');
    });

    it('cannot purchase products if none provided', async () => {
      const { purchaseManager, organizationNFT, owner } = await loadFixture(
        deployPurchaseManager,
      );

      await organizationNFT.mint(owner);

      await expect(
        purchaseManager.purchaseProducts({
          to: owner,
          organizationId: 1,
          productIds: [],
          pricingIds: [],
          quantities: [],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWith('No products provided');
    });

    it('cannot purchase products if product and pricing ids are not the same length', async () => {
      const { purchaseManager, organizationNFT, owner } = await loadFixture(
        deployPurchaseManager,
      );

      await organizationNFT.mint(owner);

      await expect(
        purchaseManager.purchaseProducts({
          to: owner,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1, 2],
          quantities: [0, 0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWith('Product and pricing IDs must be the same length');
    });

    it('cannot purchase products if quantities are not the same length as product and pricing ids', async () => {
      const { purchaseManager, productRegistry, pricingRegistry, owner } =
        await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(
        purchaseManager.purchaseProducts({
          to: owner,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0, 0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWith('Pricing ID and quantity length mismatch');
    });

    it('cannot purchase products if the product is not active', async () => {
      const { purchaseManager, productRegistry, pricingRegistry, owner } =
        await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await productRegistry.setProductActive(1, false);

      await expect(
        purchaseManager.purchaseProducts({
          to: owner,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      )
        .to.be.revertedWithCustomError(productRegistry, 'ProductIsNotActive')
        .withArgs(1);
    });

    it('cannot airdrop passes unless org admin', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        otherAccount,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: true,
          pause: false,
        }),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot mint multiple passes for the same org if max mints reached', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        purchaseRegistry,
        otherAccount,
      } = await loadWithDefaultProduct();

      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 2',
        description: 'P2 Description',
        imageUrl: 'https://example.com/product2',
        externalUrl: 'https://example.com/product2-image',
        isTransferable: false,
      });

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);
      await productRegistry.linkPricing(2, [1]);

      await purchaseRegistry.setMaxMints(1, 1);

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
        purchaseManager.connect(otherAccount).purchaseProducts(
          {
            to: otherAccount,
            organizationId: 1,
            productIds: [2],
            pricingIds: [1],
            quantities: [0],
            discountIds: [],
            couponCode: '',
            airdrop: false,
            pause: false,
          },
          { value: ethers.parseEther('1') },
        ),
      ).to.be.revertedWithCustomError(purchaseRegistry, 'MaxMintsReached');
    });

    it('cannot mint passes if the max product supply is reached', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        purchaseRegistry,
        otherAccount,
        otherAccount2,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await purchaseRegistry.setProductMaxSupply(1, 1, 1);

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
        purchaseManager.connect(otherAccount2).purchaseProducts(
          {
            to: otherAccount2,
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
        ),
      ).to.be.revertedWithCustomError(purchaseRegistry, 'MaxSupplyReached');

      await expect(
        purchaseRegistry.setProductMaxSupply(1, 1, 1),
      ).to.be.revertedWith('Max supply must be greater than current supply');
    });

    it('cannot do an initial purchase with a coupon code that has reached its max redemptions', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        productRegistry,
        paymentEscrow,
        couponRegistry,
        mintToken,
        otherAccount,
        otherAccount2,
      } = await loadWithDefaultProduct();

      // Mint tokens
      await mintToken.mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken.mint(otherAccount2, ethers.parseUnits('100', 6));

      // Approve tokens
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount2)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      // Create pricing
      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      // Link pricing to product
      await productRegistry.linkPricing(1, [1]);

      // Create coupon
      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON_CODE',
        discount: 100,
        expiration: (await time.latest()) + 10000,
        maxTotalRedemptions: 1,
        isInitialPurchaseOnly: false,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: false,
      });

      // Purchase products
      await purchaseManager.connect(otherAccount).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: 'COUPON_CODE',
        airdrop: false,
        pause: false,
      });

      await expect(
        purchaseManager.connect(otherAccount2).purchaseProducts({
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: 'COUPON_CODE',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWithCustomError(couponRegistry, 'InvalidCouponCode');
    });

    it('cannot purchase products if the organization is whitelist only and the address is not whitelisted', async () => {
      const {
        purchaseManager,
        purchaseRegistry,
        otherAccount,
        pricingRegistry,
        productRegistry,
      } = await loadWithDefaultProduct();

      await purchaseRegistry.setWhitelist(1, true);

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts(
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
        ),
      ).to.be.revertedWithCustomError(
        purchaseRegistry,
        'AddressNotWhitelisted',
      );
    });

    it('revert if allowance is insufficient', async () => {
      const {
        purchaseManager,
        otherAccount,
        mintToken,
        paymentEscrow,
        pricingRegistry,
        productRegistry,
      } = await loadWithDefaultProduct();

      await mintToken.mint(otherAccount, ethers.parseUnits('100', 6));

      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('10', 6));

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('20', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

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
      ).to.be.revertedWith('Insufficient allowance');
    });

    it('revert if balance is insufficient', async () => {
      const {
        purchaseManager,
        otherAccount,
        mintToken,
        paymentEscrow,
        pricingRegistry,
        productRegistry,
      } = await loadWithDefaultProduct();

      await mintToken.mint(otherAccount, ethers.parseUnits('100', 6));

      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('200', 6));

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('200', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

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
      ).to.be.revertedWith('Insufficient balance');
    });

    it('cannot purchase products if mint is closed', async () => {
      const {
        purchaseManager,
        otherAccount,
        mintToken,
        paymentEscrow,
        pricingRegistry,
        productRegistry,
        purchaseRegistry,
      } = await loadWithDefaultProduct();

      await mintToken.mint(otherAccount, ethers.parseUnits('100', 6));

      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('200', 6));

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('200', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await purchaseRegistry.setMintClosed(1, true);

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
      ).to.be.revertedWithCustomError(purchaseRegistry, 'MintClosed');
    });

    it('cannot purchase additional products if mint is closed', async () => {
      const {
        purchaseManager,
        otherAccount,
        mintToken,
        paymentEscrow,
        pricingRegistry,
        productRegistry,
        purchaseRegistry,
      } = await loadWithDefaultProduct();

      await mintToken.mint(otherAccount, ethers.parseUnits('500', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('200', 6));

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('200', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await purchaseManager.connect(otherAccount).purchaseProducts({
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

      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 2',
        description: 'P2 Description',
        imageUrl: 'https://example.com/product2',
        externalUrl: 'https://example.com/product2-image',
        isTransferable: false,
      });

      await productRegistry.linkPricing(2, [1]);

      await purchaseRegistry.setMintClosed(1, true);

      await expect(
        purchaseManager.connect(otherAccount).purchaseAdditionalProducts({
          productPassId: 1,
          productIds: [2],
          pricingIds: [1],
          quantities: [0],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.be.revertedWithCustomError(purchaseRegistry, 'MintClosed');
    });

    it('cannot purchase additional products if permission is not set for the pass owner', async () => {
      const { purchaseManager, permissionRegistry, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      await permissionRegistry
        .connect(otherAccount)
        .removeOwnerPermissions(1, [
          hashPermissionId('pass.purchase.additional'),
        ]);

      await expect(
        purchaseManager.connect(otherAccount).purchaseAdditionalProducts({
          productPassId: 1,
          productIds: [2],
          pricingIds: [1],
          quantities: [0],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      )
        .to.be.revertedWithCustomError(purchaseManager, 'PermissionNotFound')
        .withArgs(otherAccount, hashPermissionId('pass.purchase.additional'));
    });

    it('cannot purchase additional products if permission is inactive', async () => {
      const {
        purchaseManager,
        permissionFactory,
        permissionRegistry,
        otherAccount,
      } = await loadWithPurchasedFlatRateSubscription();

      expect(
        await permissionRegistry.hasOwnerPermission(
          1,
          otherAccount,
          hashPermissionId('pass.purchase.additional'),
        ),
      ).to.be.true;

      await permissionFactory.setPermissionActive(
        hashPermissionId('pass.purchase.additional'),
        false,
      );

      await expect(
        purchaseManager.connect(otherAccount).purchaseAdditionalProducts({
          productPassId: 1,
          productIds: [2],
          pricingIds: [1],
          quantities: [0],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      )
        .to.be.revertedWithCustomError(permissionRegistry, 'InactivePermission')
        .withArgs(hashPermissionId('pass.purchase.additional'));
    });

    it('cannot change quantity if not admin or pass owner', async () => {
      const { purchaseManager, otherAccount2 } =
        await loadWithPurchasedFlatRateSubscription();

      await expect(
        purchaseManager
          .connect(otherAccount2)
          .changeTieredSubscriptionUnitQuantity(1, 1, 10, false),
      ).to.be.revertedWithCustomError(purchaseManager, 'NotAuthorized');
    });
  });

  it('org permissions are set for owner when an org has excluded default permissions', async () => {
    const {
      purchaseManager,
      otherAccount2,
      permissionRegistry,
      mintToken,
      paymentEscrow,
    } = await loadWithPurchasedFlatRateSubscription();

    await permissionRegistry.setExcludeDefaultPermissions(1, true);

    await permissionRegistry.updateOrgPermissions(
      1,
      [
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ],
      [true, true],
    );

    await mintToken
      .connect(otherAccount2)
      .mint(otherAccount2, ethers.parseUnits('100', 6));
    await mintToken
      .connect(otherAccount2)
      .approve(await paymentEscrow.getAddress(), ethers.parseUnits('100', 6));

    await expect(
      purchaseManager.connect(otherAccount2).purchaseProducts({
        to: otherAccount2,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [],
        couponCode: '',
        airdrop: false,
        pause: false,
      }),
    )
      .to.emit(permissionRegistry, 'OwnerPermissionsUpdated')
      .withArgs(1, otherAccount2, true, [
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

    const permissions = await permissionRegistry.getOwnerPermissions(
      1,
      otherAccount2,
    );
    expect(permissions).to.deep.equal([
      hashPermissionId('pass.wallet.spend'),
      hashPermissionId('pass.purchase.additional'),
    ]);

    expect(await permissionRegistry.ownerPermissionsSet(1, otherAccount2)).to.be
      .true;
  });

  it('new default permission is granted to owner on mint when not excluded', async () => {
    const {
      purchaseManager,
      mintToken,
      paymentEscrow,
      permissionRegistry,
      permissionFactory,
      otherAccount2,
    } = await loadWithPurchasedFlatRateSubscription();

    await mintToken
      .connect(otherAccount2)
      .mint(otherAccount2, ethers.parseUnits('100', 6));
    await mintToken
      .connect(otherAccount2)
      .approve(await paymentEscrow.getAddress(), ethers.parseUnits('100', 6));

    await permissionFactory.createPermission('test.permission', 'test', true);

    expect(
      await permissionRegistry.getOwnerPermissions(1, otherAccount2),
    ).to.deep.equal([]);

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

    const permissions = await permissionRegistry.getOwnerPermissions(
      1,
      otherAccount2,
    );
    expect(permissions).to.deep.equal([
      hashPermissionId('pass.wallet.spend'),
      hashPermissionId('pass.purchase.additional'),
      hashPermissionId('pass.subscription.renewal'),
      hashPermissionId('pass.subscription.pricing'),
      hashPermissionId('pass.subscription.quantity'),
      hashPermissionId('test.permission'),
    ]);
  });

  describe('Dynamic price token', () => {
    async function loadWithDynamicPriceToken() {
      const results = await loadWithDefaultProduct();

      const {
        paymentEscrow,
        mintToken,
        dynamicERC20,
        otherAccount,
        pricingRegistry,
        productRegistry,
      } = results;

      // Mint 1000 MINT tokens
      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('1000', 18));

      // Approve payment escrow to spend the base MINT token
      await mintToken
        .connect(otherAccount)
        .approve(
          await paymentEscrow.getAddress(),
          ethers.parseUnits('1000', 18),
        );

      // Create product 2
      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 2',
        description: 'P2 Description',
        imageUrl: 'https://example.com/product2',
        externalUrl: 'https://example.com/product2-image',
        isTransferable: false,
      });

      // Create flat rate pricing with 100 dynamic price tokens
      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('100', 6),
        token: await dynamicERC20.getAddress(),
        isRestricted: false,
        chargeFrequency: 1,
      });

      // Create flat rate pricing with 0 dynamic price tokens
      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: 0,
        token: await dynamicERC20.getAddress(),
        isRestricted: false,
        chargeFrequency: 1,
      });

      // Create flat rate pricing with 0 dynamic price tokens
      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('200', 6),
        token: await dynamicERC20.getAddress(),
        isRestricted: false,
        chargeFrequency: 2,
      });

      // Link pricing to product
      await productRegistry.linkPricing(1, [1, 2, 3]);
      await productRegistry.linkPricing(2, [1, 2, 3]);

      // Set 8% fee in payment escrow
      await paymentEscrow.setFeeEnabled(true);
      await paymentEscrow.setFee(await mintToken.getAddress(), 800);

      return results;
    }

    it('should purchase products with dynamic price greater than 0', async () => {
      const {
        purchaseManager,
        paymentEscrow,
        mintToken,
        otherAccount,
        productPassNFT,
      } = await loadWithDynamicPriceToken();

      // Purchase product
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
      )
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1],
          [1],
          [0],
          await mintToken.getAddress(),
          ethers.parseUnits('100', 18),
        )
        .and.to.emit(paymentEscrow, 'TransferAmount')
        .withArgs(
          1,
          otherAccount,
          await mintToken.getAddress(),
          ethers.parseUnits('100', 18),
          ethers.parseUnits('92', 18),
        );

      // Check that the purchase was successful
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('900', 18),
      );
      expect(await productPassNFT.ownerOf(1)).to.equal(otherAccount);

      // Check that the payment escrow balances are correct
      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('92', 18));
      expect(
        await paymentEscrow.getFeeBalance(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('8', 18));
    });

    it('should purchase products with dynamic price equal to 0', async () => {
      const {
        purchaseManager,
        otherAccount,
        mintToken,
        paymentEscrow,
        productPassNFT,
      } = await loadWithDynamicPriceToken();

      await expect(
        purchaseManager.connect(otherAccount).purchaseProducts({
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [2],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      )
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1],
          [2],
          [0],
          await mintToken.getAddress(),
          0,
        )
        .and.not.to.emit(paymentEscrow, 'TransferAmount');

      // Check purchase successful
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('1000', 18),
      );
      expect(await productPassNFT.ownerOf(1)).to.equal(otherAccount);
    });

    it('should purchase additional products with dynamic price greater than 0', async () => {
      const { purchaseManager, otherAccount, mintToken, paymentEscrow } =
        await loadWithDynamicPriceToken();

      // Purchase initial product
      expect(
        await purchaseManager.connect(otherAccount).purchaseProducts({
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
      )
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1],
          [1],
          [0],
          await mintToken.getAddress(),
          ethers.parseUnits('100', 18),
        )
        .and.to.emit(paymentEscrow, 'TransferAmount')
        .withArgs(1);

      // Check that the purchase was successful
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('900', 18),
      );

      // Purchase additional product
      expect(
        await purchaseManager.connect(otherAccount).purchaseAdditionalProducts({
          productPassId: 1,
          productIds: [2],
          pricingIds: [3],
          quantities: [0],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      )
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1],
          [3],
          [0],
          await mintToken.getAddress(),
          ethers.parseUnits('200', 18),
        );

      // Check that the purchase was successful
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('700', 18),
      );
    });
  });
});
