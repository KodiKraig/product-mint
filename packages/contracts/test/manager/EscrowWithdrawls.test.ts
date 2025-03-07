import { ethers } from 'hardhat';
import { loadWithDefaultProduct } from './helpers';
import { expect } from 'chai';

describe('Purchase Manager', () => {
  describe('Payment Escrow withdrawals', () => {
    it('org owner should withdraw the native token balance of the payment escrow', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        owner,
        paymentEscrow,
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
          couponCode: '',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('10') },
      );

      const previousBalance = await ethers.provider.getBalance(owner);

      // WITHDRAW
      const tx = await paymentEscrow
        .connect(owner)
        .withdrawOrgBalance(1, ethers.ZeroAddress, ethers.parseEther('10'));
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;
      const updatedBalance = await ethers.provider.getBalance(owner);

      // ASSERTIONS
      expect(updatedBalance).to.equal(
        previousBalance + ethers.parseEther('10') - gasCost,
      );
      expect(await paymentEscrow.orgBalances(1, ethers.ZeroAddress)).to.equal(
        ethers.parseEther('0'),
      );
      expect(await ethers.provider.getBalance(paymentEscrow)).to.equal(
        ethers.parseEther('0'),
      );
    });

    it('org owner should withdraw the ERC20 token balance of the payment escrow', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        owner,
        paymentEscrow,
        mintToken,
        otherAccount,
      } = await loadWithDefaultProduct();

      await mintToken.mint(otherAccount, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
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

      // WITHDRAW
      await expect(
        paymentEscrow
          .connect(owner)
          .withdrawOrgBalance(
            1,
            await mintToken.getAddress(),
            ethers.parseUnits('10', 6),
          ),
      )
        .to.emit(paymentEscrow, 'OrgBalanceWithdrawn')
        .withArgs(1, await mintToken.getAddress(), ethers.parseUnits('10', 6));

      // ASSERTIONS
      expect(await mintToken.balanceOf(owner)).to.equal(
        ethers.parseUnits('10', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('0', 6),
      );
      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(0);
      expect(
        await paymentEscrow.totalBalances(await mintToken.getAddress()),
      ).to.equal(0);
    });

    it('org balances should be kept separate', async () => {
      const {
        purchaseManager,
        organizationNFT,
        productRegistry,
        pricingRegistry,
        owner,
        paymentEscrow,
        mintToken,
        otherAccount,
        otherAccount2,
      } = await loadWithDefaultProduct();

      // Mint orgs
      await organizationNFT.connect(otherAccount).mint(otherAccount);

      // Mint ERC20
      await mintToken.mint(otherAccount2, ethers.parseUnits('100', 6));

      await mintToken
        .connect(otherAccount2)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      // Create products
      await productRegistry.connect(otherAccount).createProduct({
        orgId: 2,
        name: 'Product 2',
        description: 'P2 Description',
        imageUrl: 'https://example.com/product2',
        externalUrl: 'https://example.com/product2-image',
        isTransferable: false,
      });

      // Create pricing
      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('10', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });
      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: ethers.parseUnits('20', 6),
        token: await mintToken.getAddress(),
        isRestricted: false,
      });

      // Link pricing to products
      await productRegistry.connect(owner).linkPricing(1, [1]);
      await productRegistry.connect(otherAccount).linkPricing(2, [2]);

      // Purchase products
      await purchaseManager.connect(otherAccount2).purchaseProducts({
        to: otherAccount2,
        organizationId: 1,
        productIds: [1],
        pricingIds: [1],
        quantities: [0],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      await purchaseManager.connect(otherAccount2).purchaseProducts({
        to: otherAccount2,
        organizationId: 2,
        productIds: [2],
        pricingIds: [2],
        quantities: [0],
        couponCode: '',
        airdrop: false,
        pause: false,
      });

      // ASSERTIONS
      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('10', 6));
      expect(
        await paymentEscrow.orgBalances(2, await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('20', 6));
      expect(
        await paymentEscrow.totalBalances(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('30', 6));
      expect(await mintToken.balanceOf(otherAccount2)).to.equal(
        ethers.parseUnits('70', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('30', 6),
      );

      // Withdraw
      await paymentEscrow
        .connect(owner)
        .withdrawOrgBalance(
          1,
          await mintToken.getAddress(),
          ethers.parseUnits('10', 6),
        );

      await paymentEscrow
        .connect(otherAccount)
        .withdrawOrgBalance(
          2,
          await mintToken.getAddress(),
          ethers.parseUnits('20', 6),
        );

      // ASSERTIONS
      expect(await mintToken.balanceOf(owner)).to.equal(
        ethers.parseUnits('10', 6),
      );
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('20', 6),
      );
      expect(await mintToken.balanceOf(otherAccount2)).to.equal(
        ethers.parseUnits('70', 6),
      );
      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(0);
      expect(
        await paymentEscrow.orgBalances(2, await mintToken.getAddress()),
      ).to.equal(0);
      expect(
        await paymentEscrow.totalBalances(await mintToken.getAddress()),
      ).to.equal(0);
    });

    it('should be able to withdraw native fees', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        owner,
        paymentEscrow,
        otherAccount,
      } = await loadWithDefaultProduct();

      await paymentEscrow.setFeeEnabled(true);
      await paymentEscrow.setFee(ethers.ZeroAddress, 1000);

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
          couponCode: '',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('10') },
      );

      // ASSERTIONS
      expect(await paymentEscrow.getFeeBalance(ethers.ZeroAddress)).to.equal(
        ethers.parseEther('1'),
      );
      expect(await paymentEscrow.orgBalances(1, ethers.ZeroAddress)).to.equal(
        ethers.parseEther('9'),
      );
      expect(await ethers.provider.getBalance(paymentEscrow)).to.equal(
        ethers.parseEther('10'),
      );

      const previousBalance = await ethers.provider.getBalance(owner);

      // WITHDRAW
      const tx = await paymentEscrow
        .connect(owner)
        .withdrawFee(ethers.ZeroAddress);

      const receipt = await tx.wait();

      // ASSERTIONS
      expect(await paymentEscrow.getFeeBalance(ethers.ZeroAddress)).to.equal(
        ethers.parseEther('0'),
      );
      expect(await paymentEscrow.orgBalances(1, ethers.ZeroAddress)).to.equal(
        ethers.parseEther('9'),
      );
      expect(await ethers.provider.getBalance(paymentEscrow)).to.equal(
        ethers.parseEther('9'),
      );

      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      expect(await ethers.provider.getBalance(owner)).to.equal(
        previousBalance + ethers.parseEther('1') - gasCost,
      );
    });

    it('should be able to withdraw ERC20 fees', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        owner,
        paymentEscrow,
        mintToken,
        otherAccount,
      } = await loadWithDefaultProduct();

      await paymentEscrow.setFeeEnabled(true);
      await paymentEscrow.setFee(await mintToken.getAddress(), 1000);

      await mintToken.mint(otherAccount, ethers.parseUnits('1000', 6));

      await mintToken.approve(paymentEscrow, ethers.parseUnits('100', 6));

      await mintToken
        .connect(otherAccount)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        flatPrice: ethers.parseUnits('100', 6),
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

      // BALANCE ASSERTIONS
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('900', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('100', 6),
      );
      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('90', 6));
      expect(
        await paymentEscrow.totalBalances(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('90', 6));
      expect(
        await paymentEscrow.getFeeBalance(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('10', 6));

      // WITHDRAW
      await expect(
        paymentEscrow.connect(owner).withdrawFee(await mintToken.getAddress()),
      )
        .to.emit(paymentEscrow, 'FeeWithdraw')
        .withArgs(await mintToken.getAddress(), ethers.parseUnits('10', 6));

      // BALANCE ASSERTIONS
      expect(await mintToken.balanceOf(otherAccount)).to.equal(
        ethers.parseUnits('900', 6),
      );
      expect(await mintToken.balanceOf(paymentEscrow)).to.equal(
        ethers.parseUnits('90', 6),
      );
      expect(
        await paymentEscrow.orgBalances(1, await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('90', 6));
      expect(
        await paymentEscrow.totalBalances(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('90', 6));
      expect(
        await paymentEscrow.getFeeBalance(await mintToken.getAddress()),
      ).to.equal(ethers.parseUnits('0', 6));
    });
  });
});
