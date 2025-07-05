import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';
import {
  deployPurchaseManager,
  loadWithDefaultProduct,
  loadWithPurchasedFlatRateSubscription,
} from './helpers';

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

  describe('Set Permission Registry', () => {
    it('should set a new permission registry', async () => {
      const { purchaseManager, permissionFactory, contractRegistry } =
        await loadFixture(deployPurchaseManager);

      const PermissionRegistry = await ethers.getContractFactory(
        'PermissionRegistry',
      );
      const newPermissionRegistry = await PermissionRegistry.deploy(
        contractRegistry,
        permissionFactory,
      );

      await purchaseManager.setPermissionRegistry(
        await newPermissionRegistry.getAddress(),
      );

      expect(await purchaseManager.permissionRegistry()).to.equal(
        await newPermissionRegistry.getAddress(),
      );
    });

    it('revert if not the owner', async () => {
      const { purchaseManager, permissionRegistry, otherAccount } =
        await loadFixture(deployPurchaseManager);

      await expect(
        purchaseManager
          .connect(otherAccount)
          .setPermissionRegistry(await permissionRegistry.getAddress()),
      ).to.be.revertedWithCustomError(
        purchaseManager,
        'OwnableUnauthorizedAccount',
      );
    });

    it('revert if does not conform to the permission registry interface', async () => {
      const { purchaseManager, organizationNFT } = await loadFixture(
        deployPurchaseManager,
      );

      await expect(
        purchaseManager.setPermissionRegistry(
          await organizationNFT.getAddress(),
        ),
      ).to.be.revertedWith('Invalid permission registry');
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
          { value: ethers.parseEther('100') },
        ),
      )
        .to.emit(paymentEscrow, 'TransferAmount')
        .withArgs(
          1,
          otherAccount,
          ethers.ZeroAddress,
          ethers.parseEther('100'),
          ethers.parseEther('100'),
        );

      expect(await paymentEscrow.orgBalances(1, ethers.ZeroAddress)).to.equal(
        ethers.parseEther('100'),
      );

      expect(await paymentEscrow.getFeeBalance(ethers.ZeroAddress)).to.equal(
        ethers.parseEther('0'),
      );
    });
  });

  describe('Upgrade and migration', () => {
    it('should set the initial pass supply to the pass supply of the old purchase manager if one is provided', async () => {
      const {
        purchaseManager,
        contractRegistry,
        permissionRegistry,
        dynamicPriceRegistry,
      } = await loadWithPurchasedFlatRateSubscription();

      expect(await purchaseManager.passSupply()).to.equal(1);

      const PurchaseManager = await ethers.getContractFactory(
        'PurchaseManager',
      );
      const newPurchaseManager = await PurchaseManager.deploy(
        contractRegistry,
        permissionRegistry,
        purchaseManager,
        dynamicPriceRegistry,
      );

      expect(await newPurchaseManager.passSupply()).to.equal(1);
    });
  });

  describe('Set Dynamic Price Registry', () => {
    it('should set a new dynamic price registry', async () => {
      const { purchaseManager } = await loadFixture(deployPurchaseManager);

      const DynamicPriceRegistry = await ethers.getContractFactory(
        'DynamicPriceRegistry',
      );
      const newDynamicPriceRegistry = await DynamicPriceRegistry.deploy();

      await expect(
        purchaseManager.setDynamicPriceRegistry(
          await newDynamicPriceRegistry.getAddress(),
        ),
      )
        .to.emit(purchaseManager, 'DynamicPriceRegistryUpdated')
        .withArgs(await newDynamicPriceRegistry.getAddress());

      expect(await purchaseManager.dynamicPriceRegistry()).to.equal(
        await newDynamicPriceRegistry.getAddress(),
      );
    });

    it('revert if not the owner', async () => {
      const { purchaseManager, dynamicPriceRegistry, otherAccount } =
        await loadFixture(deployPurchaseManager);

      await expect(
        purchaseManager
          .connect(otherAccount)
          .setDynamicPriceRegistry(await dynamicPriceRegistry.getAddress()),
      )
        .to.be.revertedWithCustomError(
          purchaseManager,
          'OwnableUnauthorizedAccount',
        )
        .withArgs(otherAccount);
    });

    it('revert if does not conform to the dynamic price registry interface', async () => {
      const { purchaseManager, organizationNFT } = await loadFixture(
        deployPurchaseManager,
      );

      await expect(
        purchaseManager.setDynamicPriceRegistry(
          await organizationNFT.getAddress(),
        ),
      ).to.be.revertedWith('IDynamicPriceRegistry not supported');
    });
  });
});
