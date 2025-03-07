import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';
import { deployPurchaseManager, loadWithDefaultProduct } from './helpers';

describe('PurchaseManager', () => {
  describe('Deployment', () => {
    it('should set the contract registry', async () => {
      const { purchaseManager, contractRegistry } = await loadFixture(
        deployPurchaseManager,
      );

      expect(await purchaseManager.registry()).to.equal(contractRegistry);
    });

    it('should set the correct owner', async () => {
      const { purchaseManager, owner } = await loadFixture(
        deployPurchaseManager,
      );

      expect(await purchaseManager.owner()).to.equal(owner);
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { purchaseManager } = await loadFixture(deployPurchaseManager);

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await purchaseManager.supportsInterface(interfaceId)).to.be.true;
    });
  });

  describe('Fee exemptions', () => {
    it('should be able to purchase product with fee exemption', async () => {
      const {
        purchaseManager,
        productRegistry,
        pricingRegistry,
        paymentEscrow,
        otherAccount,
      } = await loadWithDefaultProduct();

      await paymentEscrow.setFeeEnabled(true);
      await paymentEscrow.setFee(ethers.ZeroAddress, 1000);
      await paymentEscrow.setFeeExempt(1, true);

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

      expect(await paymentEscrow.orgBalances(1, ethers.ZeroAddress)).to.equal(
        ethers.parseEther('100'),
      );

      expect(await paymentEscrow.getFeeBalance(ethers.ZeroAddress)).to.equal(
        ethers.parseEther('0'),
      );
    });
  });
});
