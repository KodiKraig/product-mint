import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { deployPurchaseManager } from './helpers';
import { getCycleDuration } from '../../utils/cycle-duration';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { parseTimestamp, loadWithDefaultProduct } from './helpers';

describe('Purchase Manager', () => {
  describe('Transfer Product Passes', () => {
    it('can transfer product pass with multiple products and paused subscription', async () => {
      const {
        purchaseManager,
        organizationNFT,
        productRegistry,
        pricingRegistry,
        subscriptionEscrow,
        productPassNFT,
        paymentEscrow,
        mintToken,
        owner,
        otherAccount,
        otherAccount2,
      } = await loadFixture(deployPurchaseManager);

      await organizationNFT.mint(owner);

      await paymentEscrow.setWhitelistedToken(
        await mintToken.getAddress(),
        true,
      );

      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await productRegistry.createProduct({
        orgId: 1,
        name: 'One time product',
        description: 'P1 Description',
        imageUrl: 'https://example.com/product1',
        externalUrl: 'https://example.com/product1-image',
        isTransferable: false,
      });
      await productRegistry.setProductTransferable(1, true);

      await productRegistry.createProduct({
        orgId: 1,
        name: 'Flat rate subscription product',
        description: 'P2 Description',
        imageUrl: 'https://example.com/product2',
        externalUrl: 'https://example.com/product2-image',
        isTransferable: false,
      });
      await productRegistry.setProductTransferable(2, true);

      await productRegistry.createProduct({
        orgId: 1,
        name: 'Tiered subscription product',
        description: 'P3 Description',
        imageUrl: 'https://example.com/product3',
        externalUrl: 'https://example.com/product3-image',
        isTransferable: false,
      });
      await productRegistry.setProductTransferable(3, true);

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 2,
        flatPrice: ethers.parseUnits('20', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      await productRegistry.linkPricing(2, [2]);

      await pricingRegistry.createTieredSubscriptionPricing({
        organizationId: 1,
        tiers: [
          {
            lowerBound: 0,
            upperBound: 0,
            priceFlatRate: ethers.parseUnits('1', 6),
            pricePerUnit: 0,
          },
        ],
        token: await mintToken.getAddress(),
        chargeFrequency: 3,
        isVolume: false,
        isRestricted: false,
      });

      await productRegistry.linkPricing(3, [3]);

      const tx = await purchaseManager.connect(otherAccount).purchaseProducts({
        to: otherAccount,
        organizationId: 1,
        productIds: [1, 2, 3],
        pricingIds: [1, 2, 3],
        quantities: [0, 0, 5],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      const { timestamp } = await parseTimestamp(tx);

      await expect(tx)
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1, 2, 3],
          [1, 2, 3],
          [0, 0, 5],
          await mintToken.getAddress(),
          ethers.parseUnits('31', 6),
        )
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(1, 1, 2, 0, timestamp, timestamp + getCycleDuration(2))
        .and.to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(1, 1, 3, 0, timestamp, timestamp + getCycleDuration(3));

      await subscriptionEscrow.setSubscriptionsPausable(1, true);

      const firstPauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscription(1, 2, true);

      const { timestamp: pauseTimestamp } = await parseTimestamp(firstPauseTx);

      await expect(firstPauseTx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(1, 1, 2, 3, 0, pauseTimestamp);

      const secondPauseTx = await purchaseManager
        .connect(otherAccount)
        .pauseSubscription(1, 3, true);

      const { timestamp: secondPauseTimestamp } = await parseTimestamp(
        secondPauseTx,
      );

      await expect(secondPauseTx)
        .to.emit(subscriptionEscrow, 'SubscriptionCycleUpdated')
        .withArgs(1, 1, 3, 3, 0, secondPauseTimestamp);

      await productPassNFT
        .connect(otherAccount)
        .transferFrom(otherAccount, otherAccount2, 1);

      expect(await productPassNFT.ownerOf(1)).to.equal(otherAccount2);
    });

    it('should not be able to transfer with a non transferable product', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        productPassNFT,
        owner,
        otherAccount,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('100'),
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
          couponCode: '',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('100') },
      );

      await expect(
        productPassNFT
          .connect(otherAccount)
          .transferFrom(otherAccount, owner, 1),
      ).to.be.revertedWithCustomError(
        productPassNFT,
        'ProductsNotTransferable',
      );
    });

    it('can not transfer with an active subscription', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        productPassNFT,
        mintToken,
        paymentEscrow,
        owner,
        otherAccount,
      } = await loadWithDefaultProduct();

      await mintToken
        .connect(otherAccount)
        .mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await productRegistry.setProductTransferable(1, true);

      await pricingRegistry.createFlatRateSubscriptionPricing({
        organizationId: 1,
        chargeFrequency: 1,
        flatPrice: ethers.parseUnits('10', 6),
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
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      await expect(
        productPassNFT
          .connect(otherAccount)
          .transferFrom(otherAccount, owner, 1),
      ).to.be.revertedWithCustomError(
        productPassNFT,
        'SubscriptionsNotTransferable',
      );
    });

    it('can transfer a product pass with a single one time product', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        productPassNFT,
        owner,
        otherAccount,
      } = await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseEther('100'),
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
            couponCode: '',
            airdrop: false,
            pause: false,
          },
          { value: ethers.parseEther('100') },
        ),
      )
        .to.emit(purchaseManager, 'ProductsPurchased')
        .withArgs(
          1,
          1,
          otherAccount,
          [1],
          [1],
          [0],
          ethers.ZeroAddress,
          ethers.parseEther('100'),
        );

      expect(await productPassNFT.ownerOf(1)).to.equal(otherAccount);

      // Not transferable by default
      await expect(
        productPassNFT
          .connect(otherAccount)
          .transferFrom(otherAccount, owner, 1),
      ).to.be.revertedWithCustomError(
        productPassNFT,
        'ProductsNotTransferable',
      );

      // ENABLE transferable
      await productRegistry.setProductTransferable(1, true);

      // Transfer
      await expect(
        productPassNFT
          .connect(otherAccount)
          .transferFrom(otherAccount, owner, 1),
      )
        .to.emit(productPassNFT, 'Transfer')
        .withArgs(otherAccount, owner, 1);

      expect(await productPassNFT.ownerOf(1)).to.equal(owner);
    });
  });
});
