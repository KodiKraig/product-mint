import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadWithDefaultProduct } from './helpers';
import { assertCheckoutTotalCost } from '../calculator/helpers';

describe('Purchase Manager', () => {
  describe('Coupon Purchases', () => {
    it('cannot decrease max total redemptions lower than the current total redemptions', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        couponRegistry,
        otherAccount,
        otherAccount2,
        productRegistry,
      } = await loadWithDefaultProduct();

      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON1',
        discount: 1000,
        expiration: (await time.latest()) + 1000,
        maxTotalRedemptions: 2,
        isInitialPurchaseOnly: true,
        isActive: true,
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

      await purchaseManager.connect(otherAccount).purchaseProducts(
        {
          to: otherAccount,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: 'COUPON1',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('0.9') },
      );

      await purchaseManager.connect(otherAccount2).purchaseProducts(
        {
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: 'COUPON1',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('0.9') },
      );

      await expect(
        couponRegistry.setCouponMaxRedemptions(1, 1),
      ).to.be.revertedWith('Invalid max total redemptions');
    });

    it('can purchase a product with a coupon that has a zero expiration with a permanent pass discount', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        couponRegistry,
        discountRegistry,
        otherAccount,
        productRegistry,
        mintToken,
        paymentEscrow,
        pricingCalculator,
      } = await loadWithDefaultProduct();

      // Mint tokens
      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      // Create coupon (applied first)
      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON1',
        discount: 1000, // 10% off
        expiration: 0,
        maxTotalRedemptions: 1,
        isInitialPurchaseOnly: true,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: true,
      });

      // Create pass discount (applied second)
      await discountRegistry.createDiscount({
        orgId: 1,
        name: 'PASS_DISCOUNT',
        discount: 500, // 5% off
        maxMints: 0,
        isActive: true,
        isRestricted: false,
      });
      await discountRegistry.createDiscount({
        orgId: 1,
        name: 'PASS_DISCOUNT_2',
        discount: 750, // 7.5% off
        maxMints: 0,
        isActive: true,
        isRestricted: false,
      });

      // Create pricing
      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('100', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      // Link pricing to product
      await productRegistry.linkPricing(1, [1]);

      // Check if coupon is redeemable
      await couponRegistry.isCodeRedeemable(1, otherAccount, 'COUPON1', true);

      // Assert the checkout total costs
      await assertCheckoutTotalCost(
        pricingCalculator,
        {
          organizationId: 1,
          productPassOwner: otherAccount,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [1, 2],
          couponId: 1,
        },
        {
          pricingIds: [1],
          token: await mintToken.getAddress(),
          costs: [ethers.parseUnits('100', 6)],
          couponCost: ethers.parseUnits('90', 6),
          couponDiscount: 1000,
          couponSavings: ethers.parseUnits('10', 6),
          permanentCost: ethers.parseUnits('78.75', 6),
          permanentDiscount: 1250,
          permanentSavings: ethers.parseUnits('11.25', 6),
          subTotalCost: ethers.parseUnits('100', 6),
          checkoutTotalCost: ethers.parseUnits('78.75', 6),
        },
      );

      // PURCHASE
      await purchaseManager.connect(otherAccount).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        discountIds: [1, 2],
        couponCode: 'COUPON1',
        airdrop: false,
        pause: false,
      });

      // Check that coupon is no longer redeemable
      await expect(
        couponRegistry.isCodeRedeemable(1, otherAccount, 'COUPON1', true),
      )
        .to.be.revertedWithCustomError(
          couponRegistry,
          'CouponMaxRedemptionsReached',
        )
        .withArgs(1, 1);

      // Check that pass discount is attached to pass
      expect(await discountRegistry.getTotalPassDiscount(1)).to.equal(1250);
      expect(await discountRegistry.getPassDiscountIds(1)).to.deep.equal([
        1, 2,
      ]);
      expect(await discountRegistry.hasPassDiscount(1, 1)).to.equal(true);
      expect(await discountRegistry.hasPassDiscount(1, 2)).to.equal(true);
      expect(await discountRegistry.getTotalDiscount([1])).to.equal(500);
      expect(await discountRegistry.getTotalDiscount([2])).to.equal(750);
      expect(await discountRegistry.hasPassDiscount(1, 1)).to.equal(true);
      expect(await discountRegistry.hasPassDiscount(1, 2)).to.equal(true);

      // Check that token balance is correct
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('21.25', 6),
      );
    });
  });
});
