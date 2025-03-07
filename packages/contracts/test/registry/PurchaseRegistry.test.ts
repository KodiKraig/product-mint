import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('PurchaseRegistry', () => {
  async function deployPurchaseRegistry() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const ContractRegistry =
      await hre.ethers.getContractFactory('ContractRegistry');
    const contractRegistry = await ContractRegistry.deploy();

    const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
      'OrganizationMetadataProvider',
    );
    const organizationMetadataProvider =
      await OrganizationMetadataProvider.deploy(contractRegistry);

    const OrganizationNFT =
      await hre.ethers.getContractFactory('OrganizationNFT');
    const organizationNFT = await OrganizationNFT.deploy(
      organizationMetadataProvider,
    );

    await organizationNFT.connect(owner).setMintOpen(true);

    const ProductRegistry =
      await hre.ethers.getContractFactory('ProductRegistry');
    const productRegistry = await ProductRegistry.deploy(contractRegistry);

    const PricingRegistry =
      await hre.ethers.getContractFactory('PricingRegistry');
    const pricingRegistry = await PricingRegistry.deploy(contractRegistry);

    const PurchaseRegistry =
      await hre.ethers.getContractFactory('PurchaseRegistry');
    const purchaseRegistry = await PurchaseRegistry.deploy(contractRegistry);

    const OrganizationAdmin =
      await hre.ethers.getContractFactory('OrganizationAdmin');
    const organizationAdmin = await OrganizationAdmin.deploy(contractRegistry);

    await contractRegistry.setOrganizationNFT(organizationNFT);
    await contractRegistry.setPricingRegistry(pricingRegistry);
    await contractRegistry.setPurchaseRegistry(purchaseRegistry);
    await contractRegistry.setProductRegistry(productRegistry);
    await contractRegistry.setOrgAdmin(organizationAdmin);

    return {
      purchaseRegistry,
      pricingRegistry,
      productRegistry,
      organizationNFT,
      organizationAdmin,
      contractRegistry,
      owner,
      otherAccount,
    };
  }

  async function loadWithDefaultProduct() {
    const results = await loadFixture(deployPurchaseRegistry);

    const { productRegistry, organizationNFT, owner } = results;

    await organizationNFT.connect(owner).mint(owner.address);

    await expect(
      productRegistry.connect(owner).createProduct({
        orgId: 1,
        name: 'Product Name',
        description: 'Product Description',
        imageUrl: 'https://test.com/image',
        externalUrl: 'https://test.com/external',
        isTransferable: false,
      }),
    )
      .to.emit(productRegistry, 'ProductCreated')
      .withArgs(1, 1);

    return results;
  }

  it('only purchase manager can record product purchases', async () => {
    const { purchaseRegistry, owner } = await loadFixture(
      deployPurchaseRegistry,
    );

    await expect(
      purchaseRegistry
        .connect(owner)
        .recordProductPurchase(1, 1, owner.address, [1], [1]),
    ).to.be.revertedWith('Caller not authorized');
  });

  describe('Set Product Max Supply', () => {
    it('should set the max supply of a product', async () => {
      const { purchaseRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        purchaseRegistry.connect(owner).setProductMaxSupply(1, 1, 100),
      )
        .to.emit(purchaseRegistry, 'ProductMaxSupplyUpdated')
        .withArgs(1, 1, 100);

      expect(await purchaseRegistry.productMaxSupply(1)).to.equal(100);

      await expect(purchaseRegistry.connect(owner).setProductMaxSupply(1, 1, 1))
        .to.emit(purchaseRegistry, 'ProductMaxSupplyUpdated')
        .withArgs(1, 1, 1);

      expect(await purchaseRegistry.productMaxSupply(1)).to.equal(1);
    });

    it('should be able to remove the max supply limit for a product', async () => {
      const { purchaseRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        purchaseRegistry.connect(owner).setProductMaxSupply(1, 1, 100),
      )
        .to.emit(purchaseRegistry, 'ProductMaxSupplyUpdated')
        .withArgs(1, 1, 100);

      await expect(purchaseRegistry.connect(owner).setProductMaxSupply(1, 1, 0))
        .to.emit(purchaseRegistry, 'ProductMaxSupplyUpdated')
        .withArgs(1, 1, 0);
    });

    it('org owner can set the max supply of a product', async () => {
      const {
        productRegistry,
        purchaseRegistry,
        organizationNFT,
        otherAccount,
        owner,
      } = await loadWithDefaultProduct();

      await organizationNFT.connect(otherAccount).mint(otherAccount);

      await productRegistry.connect(otherAccount).createProduct({
        orgId: 2,
        name: 'Product Name 2',
        description: 'Product Description',
        imageUrl: 'https://test.com/image',
        externalUrl: 'https://test.com/external',
        isTransferable: false,
      });

      await expect(
        purchaseRegistry.connect(otherAccount).setProductMaxSupply(1, 1, 100),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        purchaseRegistry.connect(owner).setProductMaxSupply(1, 2, 100),
      ).to.be.revertedWith('Product not found');
    });
  });

  describe('Set Max Mints', () => {
    it('org owner should set the max mints for an organization', async () => {
      const { purchaseRegistry, owner } = await loadWithDefaultProduct();

      await expect(purchaseRegistry.connect(owner).setMaxMints(1, 100))
        .to.emit(purchaseRegistry, 'MaxMintsUpdated')
        .withArgs(1, 100);

      expect(await purchaseRegistry.maxMints(1)).to.equal(100);

      await expect(purchaseRegistry.connect(owner).setMaxMints(1, 0))
        .to.emit(purchaseRegistry, 'MaxMintsUpdated')
        .withArgs(1, 0);

      expect(await purchaseRegistry.maxMints(1)).to.equal(0);
    });

    it('org admin should set the max mints for an organization', async () => {
      const { purchaseRegistry, owner, otherAccount, organizationAdmin } =
        await loadWithDefaultProduct();

      await organizationAdmin.connect(owner).addAdmin(1, otherAccount);

      await expect(purchaseRegistry.connect(otherAccount).setMaxMints(1, 100))
        .to.emit(purchaseRegistry, 'MaxMintsUpdated')
        .withArgs(1, 100);

      expect(await purchaseRegistry.maxMints(1)).to.equal(100);

      await expect(purchaseRegistry.connect(otherAccount).setMaxMints(1, 0))
        .to.emit(purchaseRegistry, 'MaxMintsUpdated')
        .withArgs(1, 0);

      expect(await purchaseRegistry.maxMints(1)).to.equal(0);
    });

    it('only the org owner can set the max mints for an organization', async () => {
      const { purchaseRegistry, otherAccount } = await loadWithDefaultProduct();

      await expect(
        purchaseRegistry.connect(otherAccount).setMaxMints(1, 100),
      ).to.be.revertedWith('Not an admin of the organization');
    });
  });

  describe('Whitelist', () => {
    it('org owner should be able to set the whitelist for an organization', async () => {
      const { purchaseRegistry, owner } = await loadWithDefaultProduct();

      await expect(purchaseRegistry.connect(owner).setWhitelist(1, true))
        .to.emit(purchaseRegistry, 'WhitelistStatusChanged')
        .withArgs(1, true);

      expect(await purchaseRegistry.isWhitelist(1)).to.be.true;

      await expect(purchaseRegistry.connect(owner).setWhitelist(1, false))
        .to.emit(purchaseRegistry, 'WhitelistStatusChanged')
        .withArgs(1, false);

      expect(await purchaseRegistry.isWhitelist(1)).to.be.false;
    });

    it('org admin should be able to set the whitelist for an organization', async () => {
      const { purchaseRegistry, owner, otherAccount, organizationAdmin } =
        await loadWithDefaultProduct();

      await organizationAdmin.connect(owner).addAdmin(1, otherAccount);

      await expect(purchaseRegistry.connect(otherAccount).setWhitelist(1, true))
        .to.emit(purchaseRegistry, 'WhitelistStatusChanged')
        .withArgs(1, true);

      expect(await purchaseRegistry.isWhitelist(1)).to.be.true;
    });

    it('only an admin can set the whitelist for an organization', async () => {
      const { purchaseRegistry, otherAccount } = await loadWithDefaultProduct();

      await expect(
        purchaseRegistry.connect(otherAccount).setWhitelist(1, true),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('org owner should be able to whitelist addresses for an organization', async () => {
      const { purchaseRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        purchaseRegistry
          .connect(owner)
          .whitelistPassOwners(
            1,
            [owner.address, otherAccount.address],
            [true, true],
          ),
      )
        .to.emit(purchaseRegistry, 'WhitelistPassOwnerUpdated')
        .withArgs(1, owner.address, true)
        .and.to.emit(purchaseRegistry, 'WhitelistPassOwnerUpdated')
        .withArgs(1, otherAccount.address, true);

      expect(await purchaseRegistry.whitelisted(1, owner.address)).to.be.true;
      expect(await purchaseRegistry.whitelisted(1, otherAccount.address)).to.be
        .true;
    });

    it('only an admin can whitelist addresses for an organization', async () => {
      const { purchaseRegistry, otherAccount } = await loadWithDefaultProduct();

      await expect(
        purchaseRegistry
          .connect(otherAccount)
          .whitelistPassOwners(1, [otherAccount], [true]),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('must provide at least one address to whitelist', async () => {
      const { purchaseRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        purchaseRegistry.connect(owner).whitelistPassOwners(1, [], [true]),
      ).to.be.revertedWith('At least one address must be provided');
    });

    it('addresses and isWhitelisted must be the same length', async () => {
      const { purchaseRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        purchaseRegistry
          .connect(owner)
          .whitelistPassOwners(1, [owner.address], [true, false]),
      ).to.be.revertedWith(
        'Addresses and isWhitelisted must be the same length',
      );
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { purchaseRegistry } = await loadFixture(deployPurchaseRegistry);

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await purchaseRegistry.supportsInterface(interfaceId)).to.be.true;
    });
  });
});
