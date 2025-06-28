import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('SubscriptionEscrow', () => {
  async function deploySubscriptionEscrow() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ContractRegistry = await hre.ethers.getContractFactory(
      'ContractRegistry',
    );
    const contractRegistry = await ContractRegistry.deploy();

    const OrganizationAttributeProvider = await hre.ethers.getContractFactory(
      'OrganizationAttributeProvider',
    );
    const organizationAttributeProvider =
      await OrganizationAttributeProvider.deploy(contractRegistry);

    const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
      'OrganizationMetadataProvider',
    );
    const organizationMetadataProvider =
      await OrganizationMetadataProvider.deploy(
        contractRegistry,
        organizationAttributeProvider,
      );

    const OrganizationNFT = await hre.ethers.getContractFactory(
      'OrganizationNFT',
    );
    const organizationNFT = await OrganizationNFT.deploy(
      organizationMetadataProvider,
    );

    await organizationNFT.connect(owner).setMintOpen(true);

    const OrganizationAdmin = await hre.ethers.getContractFactory(
      'OrganizationAdmin',
    );
    const organizationAdmin = await OrganizationAdmin.deploy(contractRegistry);

    const PermissionFactory = await hre.ethers.getContractFactory(
      'PermissionFactory',
    );
    const permissionFactory = await PermissionFactory.deploy();

    const PermissionRegistry = await hre.ethers.getContractFactory(
      'PermissionRegistry',
    );
    const permissionRegistry = await PermissionRegistry.deploy(
      contractRegistry,
      permissionFactory,
    );

    const DynamicPriceRegistry = await hre.ethers.getContractFactory(
      'DynamicPriceRegistry',
    );
    const dynamicPriceRegistry = await DynamicPriceRegistry.deploy();

    const PurchaseManager = await hre.ethers.getContractFactory(
      'PurchaseManager',
    );
    const purchaseManager = await PurchaseManager.deploy(
      contractRegistry,
      permissionRegistry,
      ethers.ZeroAddress,
      dynamicPriceRegistry,
    );

    const SubscriptionEscrow = await hre.ethers.getContractFactory(
      'SubscriptionEscrow',
    );
    const subscriptionEscrow = await SubscriptionEscrow.deploy(
      contractRegistry,
    );

    await contractRegistry.setPurchaseManager(purchaseManager);
    await contractRegistry.setSubscriptionEscrow(subscriptionEscrow);
    await contractRegistry.setOrgAdmin(organizationAdmin);
    await contractRegistry.setOrganizationNFT(organizationNFT);

    return {
      contractRegistry,
      subscriptionEscrow,
      organizationAdmin,
      organizationNFT,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('should set the contract registry', async () => {
      const { subscriptionEscrow, contractRegistry } = await loadFixture(
        deploySubscriptionEscrow,
      );

      expect(await subscriptionEscrow.registry()).to.equal(contractRegistry);
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { subscriptionEscrow } = await loadFixture(
        deploySubscriptionEscrow,
      );

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await subscriptionEscrow.supportsInterface(interfaceId)).to.be
        .true;
    });
  });

  describe('Get Subscription', () => {
    it('should revert if the sub does not exist', async () => {
      const { subscriptionEscrow, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await expect(
        subscriptionEscrow.connect(owner).getSubscription(1, 1),
      ).to.be.revertedWith('Subscription does not exist');

      await expect(
        subscriptionEscrow.connect(owner).getSubscriptionBatch(1, [1, 2, 3]),
      ).to.be.revertedWith('Subscription does not exist');
    });
  });

  describe('Create Subscriptions', () => {
    it('should revert if not purchase manager', async () => {
      const { subscriptionEscrow, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await expect(
        subscriptionEscrow
          .connect(owner)
          .createSubscriptions(1, 1, [1], [1], [1], [1], false),
      ).to.be.revertedWith('Caller not authorized');
    });
  });

  describe('Renew Subscription', () => {
    it('should revert if not purchase manager', async () => {
      const { subscriptionEscrow, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await expect(
        subscriptionEscrow.connect(owner).renewSubscription(1, 1),
      ).to.be.revertedWith('Caller not authorized');
    });
  });

  describe('Change Pricing', () => {
    it('should revert if not purchase manager', async () => {
      const { subscriptionEscrow, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await expect(
        subscriptionEscrow
          .connect(owner)
          .changeSubscriptionPricing(1, 1, 1, true),
      ).to.be.revertedWith('Caller not authorized');

      await expect(
        subscriptionEscrow
          .connect(owner)
          .changeSubscriptionPricing(1, 1, 1, false),
      ).to.be.revertedWith('Caller not authorized');
    });

    it('org admin can change owner pricing flag', async () => {
      const { subscriptionEscrow, organizationNFT, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await organizationNFT.connect(owner).mint(owner);

      await expect(
        subscriptionEscrow.connect(owner).setOwnerChangePricing(1, true),
      )
        .to.emit(subscriptionEscrow, 'OwnerChangePricingSet')
        .withArgs(1, true);

      expect(await subscriptionEscrow.ownerChangePricing(1)).to.equal(true);

      await expect(
        subscriptionEscrow.connect(owner).setOwnerChangePricing(1, false),
      )
        .to.emit(subscriptionEscrow, 'OwnerChangePricingSet')
        .withArgs(1, false);

      expect(await subscriptionEscrow.ownerChangePricing(1)).to.equal(false);
    });

    it('only org admin can change owner pricing flag', async () => {
      const { subscriptionEscrow, organizationNFT, owner, otherAccount } =
        await loadFixture(deploySubscriptionEscrow);

      await organizationNFT.connect(owner).mint(owner);

      await expect(
        subscriptionEscrow.connect(otherAccount).setOwnerChangePricing(1, true),
      ).to.be.revertedWith('Not an admin of the organization');
    });
  });

  describe('Pause Subscription', () => {
    it('should revert if not purchase manager', async () => {
      const { subscriptionEscrow, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await expect(
        subscriptionEscrow.connect(owner).pauseSubscription(1, 1, false),
      ).to.be.revertedWith('Caller not authorized');
    });
  });

  describe('Cancel Subscription', () => {
    it('should revert if not purchase manager', async () => {
      const { subscriptionEscrow, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await expect(
        subscriptionEscrow.connect(owner).cancelSubscription(1, 1, false),
      ).to.be.revertedWith('Caller not authorized');
    });
  });

  describe('Set Pausable', () => {
    it('should revert if not org admin', async () => {
      const { subscriptionEscrow, organizationNFT, owner, otherAccount } =
        await loadFixture(deploySubscriptionEscrow);

      await organizationNFT.connect(owner).mint(owner);

      await expect(
        subscriptionEscrow
          .connect(otherAccount)
          .setSubscriptionsPausable(1, true),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('should set the pausable state', async () => {
      const { subscriptionEscrow, organizationNFT, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await organizationNFT.connect(owner).mint(owner);

      expect(await subscriptionEscrow.subscriptionsPauseable(1)).to.be.false;

      await expect(
        subscriptionEscrow.connect(owner).setSubscriptionsPausable(1, true),
      )
        .to.emit(subscriptionEscrow, 'SubscriptionPausableSet')
        .withArgs(1, true);

      expect(await subscriptionEscrow.subscriptionsPauseable(1)).to.be.true;

      await expect(
        subscriptionEscrow.connect(owner).setSubscriptionsPausable(1, false),
      )
        .to.emit(subscriptionEscrow, 'SubscriptionPausableSet')
        .withArgs(1, false);

      expect(await subscriptionEscrow.subscriptionsPauseable(1)).to.be.false;
    });
  });

  describe('Change Subscription Unit Quantity', () => {
    it('should revert if not purchase manager', async () => {
      const { subscriptionEscrow, owner } = await loadFixture(
        deploySubscriptionEscrow,
      );

      await expect(
        subscriptionEscrow
          .connect(owner)
          .changeSubscriptionUnitQuantity(1, 1, 1),
      ).to.be.revertedWith('Caller not authorized');
    });
  });
});
