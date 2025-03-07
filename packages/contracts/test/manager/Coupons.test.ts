import { time } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadWithDefaultProduct } from './helpers';

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

    it('can purchase a product with a coupon that has a zero expiration', async () => {
      const {
        purchaseManager,
        pricingRegistry,
        couponRegistry,
        otherAccount,
        productRegistry,
        mintToken,
        paymentEscrow,
      } = await loadWithDefaultProduct();

      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await couponRegistry.createCoupon({
        orgId: 1,
        code: 'COUPON1',
        discount: 1000,
        expiration: 0,
        maxTotalRedemptions: 1,
        isInitialPurchaseOnly: true,
        isActive: true,
        isRestricted: false,
        isOneTimeUse: true,
      });

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('100', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      expect(
        await couponRegistry.isCodeRedeemable(1, otherAccount, 'COUPON1', true),
      ).to.equal(true);

      await purchaseManager.connect(otherAccount).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        couponCode: 'COUPON1',
        airdrop: false,
        pause: false,
      });

      expect(
        await couponRegistry.isCodeRedeemable(1, otherAccount, 'COUPON1', true),
      ).to.equal(false);

      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('10', 6),
      );
    });
  });
});
