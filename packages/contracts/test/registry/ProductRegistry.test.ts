import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('ProductRegistry', () => {
  async function deployProductRegistry() {
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

    await organizationNFT.setMintOpen(true);

    const PricingRegistry = await hre.ethers.getContractFactory(
      'PricingRegistry',
    );
    const pricingRegistry = await PricingRegistry.deploy(contractRegistry);

    const ProductRegistry = await hre.ethers.getContractFactory(
      'ProductRegistry',
    );
    const productRegistry = await ProductRegistry.deploy(contractRegistry);

    const OrganizationAdmin = await hre.ethers.getContractFactory(
      'OrganizationAdmin',
    );
    const organizationAdmin = await OrganizationAdmin.deploy(contractRegistry);

    await contractRegistry.setOrgAdmin(organizationAdmin);
    await contractRegistry.setOrganizationNFT(organizationNFT);
    await contractRegistry.setProductRegistry(productRegistry);
    await contractRegistry.setPricingRegistry(pricingRegistry);
    return {
      organizationNFT,
      productRegistry,
      pricingRegistry,
      contractRegistry,
      owner,
      otherAccount,
      organizationAdmin,
    };
  }

  async function loadWithDefaultProduct() {
    const results = await loadFixture(deployProductRegistry);

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

  describe('Deployment', () => {
    it('should set the correct dependencies', async () => {
      const { productRegistry, contractRegistry } = await loadFixture(
        deployProductRegistry,
      );

      expect(await productRegistry.registry()).to.equal(contractRegistry);
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { productRegistry } = await loadFixture(deployProductRegistry);

      const interfaceId = calculateInterfaceId(['supportsInterface(bytes4)']);

      expect(await productRegistry.supportsInterface(interfaceId)).to.be.true;
    });
  });

  describe('Can purchase product?', () => {
    it('product can be purchased', async () => {
      const { productRegistry, pricingRegistry } =
        await loadWithDefaultProduct();

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        token: ethers.ZeroAddress,
        flatPrice: 10,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await productRegistry.canPurchaseProduct(1, 1, 1);
    });

    it('multiple products can be purchased', async () => {
      const { productRegistry, pricingRegistry } =
        await loadWithDefaultProduct();

      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 2',
        description: 'Product 2 Description',
        imageUrl: 'https://test.com/image2',
        externalUrl: 'https://test.com/external2',
        isTransferable: false,
      });

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        token: ethers.ZeroAddress,
        flatPrice: 10,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);
      await productRegistry.linkPricing(2, [1]);

      await productRegistry.canPurchaseProducts(1, [1, 2], [1, 1]);
    });

    it('reverts if no products are provided', async () => {
      const { productRegistry } = await loadWithDefaultProduct();

      await expect(
        productRegistry.canPurchaseProducts(1, [], []),
      ).to.be.revertedWith('No products provided');
    });

    it('reverts if product and pricing ids are not the same length', async () => {
      const { productRegistry } = await loadWithDefaultProduct();

      await expect(
        productRegistry.canPurchaseProducts(1, [1], [1, 2]),
      ).to.be.revertedWith('Product and pricing IDs must be the same length');
    });

    it('cannot purchase a product if any product does not have a linked pricing', async () => {
      const { productRegistry, pricingRegistry } =
        await loadWithDefaultProduct();

      await productRegistry.createProduct({
        orgId: 1,
        name: 'Product 2',
        description: 'Product 2 Description',
        imageUrl: 'https://test.com/image2',
        externalUrl: 'https://test.com/external2',
        isTransferable: false,
      });

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        token: ethers.ZeroAddress,
        flatPrice: 10,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(productRegistry.canPurchaseProducts(1, [1, 2], [1, 1]))
        .to.be.revertedWithCustomError(
          productRegistry,
          'PricingNotLinkedToProduct',
        )
        .withArgs(2, 1);
    });

    it('should return false if the product does not exist', async () => {
      const { productRegistry } = await loadFixture(deployProductRegistry);
      await expect(productRegistry.canPurchaseProduct(1, 1, 1))
        .to.be.revertedWithCustomError(
          productRegistry,
          'ProductNotFoundForOrganization',
        )
        .withArgs(1, 1);
    });

    it('should return false if the product does not belong to the org', async () => {
      const { productRegistry } = await loadWithDefaultProduct();

      await expect(productRegistry.canPurchaseProduct(2, 1, 1))
        .to.be.revertedWithCustomError(
          productRegistry,
          'ProductNotFoundForOrganization',
        )
        .withArgs(2, 1);
    });

    it('should return false if the product is not active', async () => {
      const { productRegistry, pricingRegistry } =
        await loadWithDefaultProduct();

      await productRegistry.setProductActive(1, false);

      await pricingRegistry.createOneTimePricing({
        organizationId: 1,
        token: ethers.ZeroAddress,
        flatPrice: 10,
        isRestricted: false,
      });

      await productRegistry.linkPricing(1, [1]);

      await expect(productRegistry.canPurchaseProduct(1, 1, 1))
        .to.be.revertedWithCustomError(productRegistry, 'ProductIsNotActive')
        .withArgs(1);
    });

    it('should return false if the product pricing is not linked', async () => {
      const { productRegistry, pricingRegistry, owner } =
        await loadWithDefaultProduct();

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        token: ethers.ZeroAddress,
        flatPrice: 10,
        isRestricted: false,
      });

      await expect(productRegistry.canPurchaseProduct(1, 1, 1))
        .to.be.revertedWithCustomError(
          productRegistry,
          'PricingNotLinkedToProduct',
        )
        .withArgs(1, 1);
    });
  });

  it('should not allow a product to be created if the product does not exist', async () => {
    const { productRegistry } = await loadFixture(deployProductRegistry);

    await expect(productRegistry.getProduct(1)).to.be.revertedWith(
      'Product not found',
    );
  });

  describe('Get Product Details', () => {
    it('should get batch of products spanning multiple orgs', async () => {
      const { productRegistry, otherAccount, organizationNFT } =
        await loadWithDefaultProduct();

      await organizationNFT.connect(otherAccount).mint(otherAccount);

      await productRegistry.connect(otherAccount).createProduct({
        orgId: 2,
        name: 'Product Name 2',
        description: 'Product Description 2',
        imageUrl: 'https://test.com/image2',
        externalUrl: 'https://test.com/external2',
        isTransferable: false,
      });

      await productRegistry.connect(otherAccount).createProduct({
        orgId: 2,
        name: 'Product Name 3',
        description: 'Product Description 3',
        imageUrl: 'https://test.com/image3',
        externalUrl: 'https://test.com/external3',
        isTransferable: false,
      });

      const products = await productRegistry.getProductsBatch([3, 2, 1]);

      expect(products.length).to.equal(3);
      expect(products[2]).to.deep.equal([
        1,
        'Product Name',
        'Product Description',
        'https://test.com/image',
        'https://test.com/external',
        false,
        true,
      ]);
      expect(products[1]).to.deep.equal([
        2,
        'Product Name 2',
        'Product Description 2',
        'https://test.com/image2',
        'https://test.com/external2',
        false,
        true,
      ]);
      expect(products[0]).to.deep.equal([
        2,
        'Product Name 3',
        'Product Description 3',
        'https://test.com/image3',
        'https://test.com/external3',
        false,
        true,
      ]);
    });

    it('should get all org products only', async () => {
      const { productRegistry, owner, otherAccount, organizationNFT } =
        await loadWithDefaultProduct();

      await organizationNFT.connect(otherAccount).mint(otherAccount);

      await productRegistry.connect(otherAccount).createProduct({
        orgId: 2,
        name: 'Other Product',
        description: 'Other Product Description',
        imageUrl: 'https://test.com/image2',
        externalUrl: 'https://test.com/external2',
        isTransferable: false,
      });

      await productRegistry.connect(owner).createProduct({
        orgId: 1,
        name: 'Product Name 3',
        description: 'Product Description 3',
        imageUrl: 'https://test.com/image3',
        externalUrl: 'https://test.com/external3',
        isTransferable: false,
      });

      const [productIds, products] = await productRegistry.getOrgProducts(1);

      expect(productIds.length).to.equal(2);
      expect(products.length).to.equal(2);
    });
  });

  describe('Create Product', () => {
    it('should create products', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      expect(await productRegistry.getOrgProductIds(1)).to.deep.equal([1]);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,
        'Product Name',
        'Product Description',
        'https://test.com/image',
        'https://test.com/external',
        false,
        true,
      ]);

      await expect(
        productRegistry.connect(owner).createProduct({
          orgId: 1,
          name: 'Product Name 2',
          description: 'Product Description 2',
          imageUrl: 'https://test.com/image2',
          externalUrl: 'https://test.com/external2',
          isTransferable: false,
        }),
      )
        .to.emit(productRegistry, 'ProductCreated')
        .withArgs(1, 2);

      expect(await productRegistry.getOrgProductIds(1)).to.deep.equal([1, 2]);

      expect(await productRegistry.getProduct(2)).to.deep.equal([
        1,
        'Product Name 2',
        'Product Description 2',
        'https://test.com/image2',
        'https://test.com/external2',
        false,
        true,
      ]);
    });

    it('should not allow a non org owner to create a product for an org that does not exist', async () => {
      const { productRegistry, organizationNFT, otherAccount } =
        await loadFixture(deployProductRegistry);

      await expect(
        productRegistry.connect(otherAccount).createProduct({
          orgId: 1,
          name: 'Product Name',
          description: 'Product Description',
          imageUrl: 'https://test.com/image',
          externalUrl: 'https://test.com/external',
          isTransferable: false,
        }),
      )
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(1);
    });

    it('should not allow a non org owner to create a product for an org', async () => {
      const { productRegistry, organizationNFT, owner, otherAccount } =
        await loadFixture(deployProductRegistry);

      await organizationNFT.connect(owner).mint(owner.address);

      await expect(
        productRegistry.connect(otherAccount).createProduct({
          orgId: 1,
          name: 'Product Name',
          description: 'Product Description',
          imageUrl: 'https://test.com/image',
          externalUrl: 'https://test.com/external',
          isTransferable: false,
        }),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('should not be able to the name of a product to be empty', async () => {
      const { productRegistry, organizationNFT, owner } = await loadFixture(
        deployProductRegistry,
      );

      await organizationNFT.connect(owner).mint(owner.address);

      await expect(
        productRegistry.connect(owner).createProduct({
          orgId: 1,
          name: '',
          description: 'Product Description',
          imageUrl: 'https://test.com/image',
          externalUrl: 'https://test.com/external',
          isTransferable: false,
        }),
      ).to.be.revertedWithCustomError(productRegistry, 'ValueCannotBeEmpty');
    });
  });

  describe('Set Product Name', () => {
    it('should set the name of a product', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      const productName = 'a'.repeat(64);

      await expect(
        productRegistry.connect(owner).setProductName(1, productName),
      )
        .to.emit(productRegistry, 'ProductUpdated')
        .withArgs(1, 1);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,
        productName,
        'Product Description',
        'https://test.com/image',
        'https://test.com/external',
        false,
        true,
      ]);
    });

    it('only the org owner can set the name of a product', async () => {
      const { productRegistry, organizationNFT, otherAccount, owner } =
        await loadWithDefaultProduct();

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
        productRegistry.connect(otherAccount).setProductName(1, 'New Name'),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        productRegistry.connect(owner).setProductName(2, 'New Name'),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set empty name', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        productRegistry.connect(owner).setProductName(1, ''),
      ).to.be.revertedWithCustomError(productRegistry, 'ValueCannotBeEmpty');
    });

    it('cannot set a name that is too long', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        productRegistry.connect(owner).setProductName(1, 'a'.repeat(65)),
      ).to.be.revertedWithCustomError(productRegistry, 'ValueTooLong');
    });
  });

  describe('Set Product Description', () => {
    it('should set the description of a product', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      const productDescription = 'a'.repeat(512);

      await expect(
        productRegistry
          .connect(owner)
          .setProductDescription(1, productDescription),
      )
        .to.emit(productRegistry, 'ProductUpdated')
        .withArgs(1, 1);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,

        'Product Name',
        productDescription,
        'https://test.com/image',
        'https://test.com/external',
        false,
        true,
      ]);
    });

    it('only the org owner can set the description of a product', async () => {
      const { productRegistry, organizationNFT, otherAccount, owner } =
        await loadWithDefaultProduct();

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
        productRegistry
          .connect(otherAccount)
          .setProductDescription(1, 'New Description'),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        productRegistry
          .connect(owner)
          .setProductDescription(2, 'New Description'),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set an empty description', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        productRegistry.connect(owner).setProductDescription(1, ''),
      ).to.be.revertedWithCustomError(productRegistry, 'ValueCannotBeEmpty');
    });

    it('cannot set a description that is too long', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        productRegistry
          .connect(owner)
          .setProductDescription(1, 'a'.repeat(513)),
      ).to.be.revertedWithCustomError(productRegistry, 'ValueTooLong');
    });
  });

  describe('Set Product Image URL', () => {
    it('should set the image URL of a product', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      const imageUrl = 'https://test.com/new-image';

      await expect(
        productRegistry.connect(owner).setProductImageUrl(1, imageUrl),
      )
        .to.emit(productRegistry, 'ProductUpdated')
        .withArgs(1, 1);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,

        'Product Name',
        'Product Description',
        imageUrl,
        'https://test.com/external',
        false,
        true,
      ]);
    });

    it('only the org owner can set the image URL of a product', async () => {
      const { productRegistry, organizationNFT, otherAccount, owner } =
        await loadWithDefaultProduct();

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
        productRegistry
          .connect(otherAccount)
          .setProductImageUrl(1, 'New Image'),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        productRegistry.connect(owner).setProductImageUrl(2, 'New Image'),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set an image URL that is too long', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        productRegistry.connect(owner).setProductImageUrl(1, 'a'.repeat(129)),
      ).to.be.revertedWithCustomError(productRegistry, 'ValueTooLong');
    });

    it('can set empty image URL', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(productRegistry.connect(owner).setProductImageUrl(1, ''))
        .to.emit(productRegistry, 'ProductUpdated')
        .withArgs(1, 1);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,

        'Product Name',
        'Product Description',
        '',
        'https://test.com/external',
        false,
        true,
      ]);
    });
  });

  describe('Set Product External URL', () => {
    it('should set the external URL of a product', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      const externalUrl = 'https://test.com/new-external';

      await expect(
        productRegistry.connect(owner).setProductExternalUrl(1, externalUrl),
      )
        .to.emit(productRegistry, 'ProductUpdated')
        .withArgs(1, 1);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,

        'Product Name',
        'Product Description',
        'https://test.com/image',
        externalUrl,
        false,
        true,
      ]);
    });

    it('only the org owner can set the external URL of a product', async () => {
      const { productRegistry, organizationNFT, otherAccount, owner } =
        await loadWithDefaultProduct();

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
        productRegistry
          .connect(otherAccount)
          .setProductExternalUrl(1, 'New External'),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        productRegistry.connect(owner).setProductExternalUrl(2, 'New External'),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('cannot set an external URL that is too long', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        productRegistry
          .connect(owner)
          .setProductExternalUrl(1, 'a'.repeat(129)),
      ).to.be.revertedWithCustomError(productRegistry, 'ValueTooLong');
    });

    it('can set empty external URL', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(productRegistry.connect(owner).setProductExternalUrl(1, ''))
        .to.emit(productRegistry, 'ProductUpdated')
        .withArgs(1, 1);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,

        'Product Name',
        'Product Description',
        'https://test.com/image',
        '',
        false,
        true,
      ]);
    });
  });

  describe('Set Product Transferable', () => {
    it('should set the transferable status of a product', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        productRegistry.connect(owner).setProductTransferable(1, true),
      )
        .to.emit(productRegistry, 'ProductUpdated')
        .withArgs(1, 1);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,

        'Product Name',
        'Product Description',
        'https://test.com/image',
        'https://test.com/external',
        true,
        true,
      ]);

      await expect(
        productRegistry.connect(owner).setProductTransferable(1, false),
      )
        .to.emit(productRegistry, 'ProductUpdated')
        .withArgs(1, 1);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,

        'Product Name',
        'Product Description',
        'https://test.com/image',
        'https://test.com/external',
        false,
        true,
      ]);
    });

    it('only the org owner can set the transferable status of a product', async () => {
      const { productRegistry, organizationNFT, otherAccount, owner } =
        await loadWithDefaultProduct();

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
        productRegistry.connect(otherAccount).setProductTransferable(1, true),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        productRegistry.connect(owner).setProductTransferable(2, true),
      ).to.be.revertedWith('Not an admin of the organization');
    });
  });

  describe('Set Product Active', () => {
    it('should set the active status of a product', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(productRegistry.connect(owner).setProductActive(1, false))
        .to.emit(productRegistry, 'ProductStatusChanged')
        .withArgs(1, 1, false);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,
        'Product Name',
        'Product Description',
        'https://test.com/image',
        'https://test.com/external',
        false,
        false,
      ]);

      await expect(productRegistry.connect(owner).setProductActive(1, true))
        .to.emit(productRegistry, 'ProductStatusChanged')
        .withArgs(1, 1, true);

      expect(await productRegistry.getProduct(1)).to.deep.equal([
        1,
        'Product Name',
        'Product Description',
        'https://test.com/image',
        'https://test.com/external',
        false,
        true,
      ]);
    });

    it('only the org owner can set the active status of a product', async () => {
      const { productRegistry, organizationNFT, otherAccount, owner } =
        await loadWithDefaultProduct();

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
        productRegistry.connect(otherAccount).setProductActive(1, true),
      ).to.be.revertedWith('Not an admin of the organization');

      await expect(
        productRegistry.connect(owner).setProductActive(2, true),
      ).to.be.revertedWith('Not an admin of the organization');
    });
  });

  describe('Price Linkage', () => {
    it('can link multiple pricing to multiple products and unlink them', async () => {
      const { productRegistry, pricingRegistry, owner } =
        await loadWithDefaultProduct();

      // Create pricings
      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        token: ethers.ZeroAddress,
        flatPrice: 10,
        isRestricted: false,
      });
      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        token: ethers.ZeroAddress,
        flatPrice: 20,
        isRestricted: false,
      });

      // Link pricing to default product
      await expect(productRegistry.connect(owner).linkPricing(1, [1, 2]))
        .to.emit(productRegistry, 'ProductPricingLinkUpdate')
        .withArgs(1, 1, 1, true)
        .and.to.emit(productRegistry, 'ProductPricingLinkUpdate')
        .withArgs(1, 1, 2, true);

      // Check that the pricing IDs are linked to the product
      expect(await productRegistry.getProductPricingIds(1)).to.deep.equal([
        1, 2,
      ]);
      const [pricingIds, pricingOptions] =
        await productRegistry.getProductPricing(1);
      expect(pricingIds.length).to.equal(2);
      expect(pricingOptions.length).to.equal(2);

      // Check all the pricing options are correct
      expect(pricingIds[0]).to.equal(1);
      const expectedPricing1 = [
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        10,
        0,
        true,
        false,
      ];
      expect(pricingOptions[0]).to.deep.equal(expectedPricing1);

      expect(pricingIds[1]).to.equal(2);
      const expectedPricing2 = [
        1,
        0,
        0,
        [],
        ethers.ZeroAddress,
        20,
        0,
        true,
        false,
      ];
      expect(pricingOptions[1]).to.deep.equal(expectedPricing2);

      // Create another product
      await productRegistry.connect(owner).createProduct({
        orgId: 1,
        name: 'Product Name 2',
        description: 'Product Description 2',
        imageUrl: 'https://test.com/image2',
        externalUrl: 'https://test.com/external2',
        isTransferable: false,
      });

      // Link pricing to new product
      await expect(productRegistry.connect(owner).linkPricing(2, [1, 2]))
        .to.emit(productRegistry, 'ProductPricingLinkUpdate')
        .withArgs(1, 2, 1, true)
        .and.to.emit(productRegistry, 'ProductPricingLinkUpdate')
        .withArgs(1, 2, 2, true);

      // Check that the pricing IDs are linked to the new product
      expect(await productRegistry.getProductPricingIds(2)).to.deep.equal([
        1, 2,
      ]);

      // Get all the pricing options for the products
      const [pricingIdsBatched, pricingOptionsBatched] =
        await productRegistry.getProductPricingBatch([1, 2]);
      expect(pricingIdsBatched.length).to.equal(2);
      expect(pricingIdsBatched[0]).to.deep.equal([1, 2]);
      expect(pricingIdsBatched[1]).to.deep.equal([1, 2]);
      expect(pricingOptionsBatched.length).to.equal(2);
      expect(pricingOptionsBatched[0].length).to.equal(2);
      expect(pricingOptionsBatched[0]).to.deep.equal([
        expectedPricing1,
        expectedPricing2,
      ]);
      expect(pricingOptionsBatched[1].length).to.equal(2);
      expect(pricingOptionsBatched[1]).to.deep.equal([
        expectedPricing1,
        expectedPricing2,
      ]);

      // Unlink pricing from default product
      await expect(productRegistry.connect(owner).unlinkPricing(1, [1]))
        .to.emit(productRegistry, 'ProductPricingLinkUpdate')
        .withArgs(1, 1, 1, false);

      // Check that the pricing IDs are linked to the new product
      expect(await productRegistry.getProductPricingIds(1)).to.deep.equal([2]);
      expect(await productRegistry.getProductPricingIds(2)).to.deep.equal([
        1, 2,
      ]);

      // Unlink pricing from new product
      await expect(productRegistry.connect(owner).unlinkPricing(2, [2]))
        .to.emit(productRegistry, 'ProductPricingLinkUpdate')
        .withArgs(1, 2, 2, false);

      // Check that the pricing IDs are linked to the new product
      expect(await productRegistry.getProductPricingIds(2)).to.deep.equal([1]);
    });

    it('cannot unlink a pricing that is not linked to a product', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await expect(productRegistry.connect(owner).unlinkPricing(1, [1]))
        .to.be.revertedWithCustomError(
          productRegistry,
          'PricingNotLinkedToProduct',
        )
        .withArgs(1, 1);
    });

    it('cannot link a pricing to a product that does not exist', async () => {
      const { productRegistry, organizationNFT, owner } =
        await loadWithDefaultProduct();

      await expect(productRegistry.connect(owner).linkPricing(2, [1]))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(0);
    });

    it('cannot link a pricing to a product that is not owned by the org', async () => {
      const {
        productRegistry,
        pricingRegistry,
        organizationNFT,
        owner,
        otherAccount,
      } = await loadWithDefaultProduct();

      await organizationNFT.connect(otherAccount).mint(otherAccount);

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        token: ethers.ZeroAddress,
        flatPrice: 10,
        isRestricted: false,
      });

      await expect(
        productRegistry.connect(owner).linkPricing(1, [1]),
      ).to.be.revertedWithCustomError(pricingRegistry, 'PricingNotAuthorized');
    });

    it('cannot unlink a pricing for a product that is not owned by the org', async () => {
      const { productRegistry, pricingRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      await pricingRegistry.connect(owner).createOneTimePricing({
        organizationId: 1,
        token: ethers.ZeroAddress,
        flatPrice: 10,
        isRestricted: false,
      });

      await productRegistry.connect(owner).linkPricing(1, [1]);

      await expect(
        productRegistry.connect(otherAccount).unlinkPricing(1, [1]),
      ).to.be.revertedWith('Not an admin of the organization');
    });
  });

  describe('Transferability', () => {
    it('should return true if all the products are transferable', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await productRegistry.connect(owner).setProductTransferable(1, true);

      expect(await productRegistry.isTransferable([1])).to.equal(true);

      await productRegistry.connect(owner).createProduct({
        orgId: 1,
        name: 'Product Name 2',
        description: 'Product Description 2',
        imageUrl: 'https://test.com/image2',
        externalUrl: 'https://test.com/external2',
        isTransferable: false,
      });

      await productRegistry.connect(owner).setProductTransferable(2, true);

      expect(await productRegistry.isTransferable([1, 2])).to.equal(true);
    });

    it('should return false if any of the products are not transferable', async () => {
      const { productRegistry, owner } = await loadWithDefaultProduct();

      await productRegistry.connect(owner).setProductTransferable(1, true);

      expect(await productRegistry.isTransferable([1])).to.equal(true);

      await productRegistry.connect(owner).createProduct({
        orgId: 1,
        name: 'Product Name 2',
        description: 'Product Description 2',
        imageUrl: 'https://test.com/image2',
        externalUrl: 'https://test.com/external2',
        isTransferable: false,
      });

      expect(await productRegistry.isTransferable([1, 2])).to.equal(false);
    });
  });
});
