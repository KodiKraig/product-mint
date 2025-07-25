import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre, { ethers } from 'hardhat';
import { loadWithPurchasedFlatRateSubscription } from '../manager/helpers';
import {
  assertMetadata,
  DEFAULT_PASS_METADATA,
  EXPECTED_DEFAULT_ORGANIZATION_METADATA,
  EXPECTED_DEFAULT_PASS_METADATA,
} from '../metadata/helpers';
import { DEFAULT_ORGANIZATION_METADATA } from '../metadata/helpers';

describe('ProductPassNFT', () => {
  async function deployProductPassNFT() {
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

    const ProductRegistry = await hre.ethers.getContractFactory(
      'ProductRegistry',
    );
    const productRegistry = await ProductRegistry.deploy(organizationNFT);

    const PassAttributeProvider = await hre.ethers.getContractFactory(
      'PassAttributeProvider',
    );
    const passAttributeProvider = await PassAttributeProvider.deploy(
      contractRegistry,
    );

    const PassMetadataProvider = await hre.ethers.getContractFactory(
      'PassMetadataProvider',
    );
    const passMetadataProvider = await PassMetadataProvider.deploy(
      contractRegistry,
      passAttributeProvider,
    );

    const ProductPassNFT = await hre.ethers.getContractFactory(
      'ProductPassNFT',
    );
    const productPassNFT = await ProductPassNFT.deploy(
      contractRegistry,
      passMetadataProvider,
    );

    await contractRegistry.setProductPassNFT(productPassNFT);
    await contractRegistry.setProductRegistry(productRegistry);
    await contractRegistry.setOrganizationNFT(organizationNFT);

    return {
      organizationNFT,
      productRegistry,
      passAttributeProvider,
      productPassNFT,
      passMetadataProvider,
      contractRegistry,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('should set the correct name and symbol', async () => {
      const { productPassNFT } = await loadFixture(deployProductPassNFT);

      expect(await productPassNFT.name()).to.equal(
        'ProductMint Product Pass NFT',
      );
      expect(await productPassNFT.symbol()).to.equal('PASS');
    });

    it('should set the correct dependencies', async () => {
      const { productPassNFT, contractRegistry } = await loadFixture(
        deployProductPassNFT,
      );

      expect(await productPassNFT.registry()).to.equal(contractRegistry);
    });

    it('should set the correct owner', async () => {
      const { productPassNFT, owner } = await loadFixture(deployProductPassNFT);

      expect(await productPassNFT.owner()).to.equal(owner);
    });
  });

  it('only purchase manager can mint', async () => {
    const { productPassNFT, owner, otherAccount } = await loadFixture(
      deployProductPassNFT,
    );

    await expect(
      productPassNFT.connect(otherAccount).mint(owner, 1),
    ).to.be.revertedWith('Caller not authorized');
  });

  describe('Metadata', () => {
    it('should set the correct metadata provider', async () => {
      const { productPassNFT, passMetadataProvider } = await loadFixture(
        deployProductPassNFT,
      );

      expect(await productPassNFT.metadataProvider()).to.equal(
        passMetadataProvider,
      );
    });

    it('metadata provider must implement the correct interface', async () => {
      const { productPassNFT, contractRegistry } = await loadFixture(
        deployProductPassNFT,
      );

      await expect(
        productPassNFT.setMetadataProvider(contractRegistry),
      ).to.be.revertedWith('Invalid metadata provider');
    });

    it('can set another metadata provider', async () => {
      const {
        productPassNFT,
        contractRegistry,
        passMetadataProvider,
        passAttributeProvider,
      } = await loadFixture(deployProductPassNFT);

      const newMetadataProvider = await hre.ethers.getContractFactory(
        'PassMetadataProvider',
      );
      const newMetadataProviderInstance = await newMetadataProvider.deploy(
        contractRegistry,
        passAttributeProvider,
      );

      await expect(
        productPassNFT.setMetadataProvider(newMetadataProviderInstance),
      )
        .to.emit(productPassNFT, 'MetadataProviderSet')
        .withArgs(passMetadataProvider, newMetadataProviderInstance);

      expect(await productPassNFT.metadataProvider()).to.equal(
        newMetadataProviderInstance,
      );
    });

    it('only owner can set metadata provider', async () => {
      const { productPassNFT, passMetadataProvider, otherAccount } =
        await loadFixture(deployProductPassNFT);

      await expect(
        productPassNFT
          .connect(otherAccount)
          .setMetadataProvider(passMetadataProvider),
      )
        .to.be.revertedWithCustomError(
          productPassNFT,
          'OwnableUnauthorizedAccount',
        )
        .withArgs(otherAccount.address);
    });
  });

  describe('Token URI', () => {
    it('revert if token does not exist', async () => {
      const { productPassNFT } = await loadFixture(deployProductPassNFT);

      await expect(productPassNFT.tokenURI(1))
        .to.be.revertedWithCustomError(productPassNFT, 'ERC721NonexistentToken')
        .withArgs(1);
    });

    it('return the correct token URI for multiple tokens across different organizations', async () => {
      const {
        productPassNFT,
        productRegistry,
        pricingRegistry,
        organizationNFT,
        purchaseManager,
        passMetadataProvider,
        organizationMetadataProvider,
        mintToken,
        paymentEscrow,
        purchaseRegistry,
        subscriptionEscrow,
        owner,
        otherAccount,
        otherAccount2,
      } = await loadWithPurchasedFlatRateSubscription();

      // Set default metadata
      await passMetadataProvider.setDefaultMetadata(DEFAULT_PASS_METADATA);
      await organizationMetadataProvider.setDefaultMetadata(
        DEFAULT_ORGANIZATION_METADATA,
      );

      // Approve the mint token
      await mintToken
        .connect(otherAccount2)
        .approve(paymentEscrow, ethers.parseUnits('100', 6));
      await mintToken
        .connect(otherAccount2)
        .mint(otherAccount2, ethers.parseUnits('100', 6));

      // Create the second organization
      await organizationNFT.connect(otherAccount).mint(otherAccount);
      await purchaseRegistry.connect(otherAccount).setMaxMints(2, 1);
      await purchaseRegistry.connect(otherAccount).setWhitelist(2, true);
      await purchaseRegistry
        .connect(otherAccount)
        .whitelistPassOwners(2, [otherAccount, otherAccount2], [true, true]);

      await productRegistry.connect(otherAccount).createProduct({
        orgId: 2,
        name: 'Name 2',
        description: 'Product description 2',
        imageUrl: 'Product image',
        externalUrl: 'Product external URL',
        isTransferable: false,
      });

      await productRegistry.connect(otherAccount).createProduct({
        orgId: 2,
        name: 'Name 3',
        description: 'Product description 3',
        imageUrl: 'Product image',
        externalUrl: 'Product external URL',
        isTransferable: false,
      });

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.connect(otherAccount).linkPricing(2, [2]);
      await productRegistry.connect(otherAccount).linkPricing(3, [2]);

      // Create additional product for org 1
      await productRegistry.connect(owner).createProduct({
        orgId: 1,
        name: 'Name 4',
        description: 'Product description 4',
        imageUrl: 'Product image',
        externalUrl: 'Product external URL',
        isTransferable: false,
      });

      await productRegistry.connect(owner).linkPricing(4, [1]);

      // Mint the passes
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
      await purchaseManager.connect(otherAccount).purchaseProducts(
        {
          to: otherAccount,
          organizationId: 2,
          productIds: [2, 3],
          pricingIds: [2, 2],
          quantities: [0, 0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('2') },
      );

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
      await purchaseManager.connect(otherAccount2).purchaseProducts(
        {
          to: otherAccount2,
          organizationId: 2,
          productIds: [2, 3],
          pricingIds: [2, 2],
          quantities: [0, 0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('2') },
      );

      // Add additional product to the pass
      await purchaseManager.connect(otherAccount).purchaseAdditionalProducts(
        {
          productPassId: 1,
          productIds: [4],
          pricingIds: [1],
          quantities: [0],
          couponCode: '',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('1') },
      );

      // Supply checks
      expect(await purchaseManager.passSupply()).to.equal(5);
      expect(await organizationNFT.totalSupply()).to.equal(2);
      expect(await purchaseRegistry.totalProductsSold(1)).to.equal(4);
      expect(await purchaseRegistry.totalProductsSold(2)).to.equal(4);

      // Pass Token URIs
      const tokenUris = await productPassNFT.tokenURIBatch([1, 2, 3, 4, 5]);
      expect(tokenUris.length).to.equal(5);

      // Subscriptions
      const [sub1] = await subscriptionEscrow.getSubscription(1, 1);
      const [sub2] = await subscriptionEscrow.getSubscription(1, 4);
      const [sub3] = await subscriptionEscrow.getSubscription(2, 1);
      const [sub4] = await subscriptionEscrow.getSubscription(4, 1);

      assertMetadata(tokenUris[0], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
          { trait_type: 'Product 4', value: 'Name 4' },
          { trait_type: 'Subscription 1', value: 'Active' },
          {
            display_type: 'date',
            trait_type: 'Subscription 1 Start',
            value: Number(sub1.startDate),
          },
          {
            display_type: 'date',
            trait_type: 'Subscription 1 End',
            value: Number(sub1.endDate),
          },
          { trait_type: 'Subscription 4', value: 'Active' },
          {
            display_type: 'date',
            trait_type: 'Subscription 4 Start',
            value: Number(sub2.startDate),
          },
          {
            display_type: 'date',
            trait_type: 'Subscription 4 End',
            value: Number(sub2.endDate),
          },
        ],
      });

      assertMetadata(tokenUris[1], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
          { trait_type: 'Subscription 1', value: 'Active' },
          {
            display_type: 'date',
            trait_type: 'Subscription 1 Start',
            value: Number(sub3.startDate),
          },
          {
            display_type: 'date',
            trait_type: 'Subscription 1 End',
            value: Number(sub3.endDate),
          },
        ],
      });

      assertMetadata(tokenUris[2], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '2' },
          { trait_type: 'Product 2', value: 'Name 2' },
          { trait_type: 'Product 3', value: 'Name 3' },
        ],
      });

      assertMetadata(tokenUris[3], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
          { trait_type: 'Subscription 1', value: 'Active' },
          {
            display_type: 'date',
            trait_type: 'Subscription 1 Start',
            value: Number(sub4.startDate),
          },
          {
            display_type: 'date',
            trait_type: 'Subscription 1 End',
            value: Number(sub4.endDate),
          },
        ],
      });

      assertMetadata(tokenUris[4], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization', value: '2' },
          { trait_type: 'Product 2', value: 'Name 2' },
          { trait_type: 'Product 3', value: 'Name 3' },
        ],
      });

      // Organization Token URIs
      const orgTokenUris = await organizationNFT.tokenURIBatch([1, 2]);
      expect(orgTokenUris.length).to.equal(2);

      assertMetadata(orgTokenUris[0], {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        attributes: [
          { trait_type: 'Whitelist Only', value: 'False' },
          { trait_type: 'Max Mints', value: 'No Limit' },
          { trait_type: 'Products Sold', value: '4' },
          { trait_type: 'Product Pass Mints', value: '3' },
        ],
      });

      assertMetadata(orgTokenUris[1], {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        attributes: [
          { trait_type: 'Whitelist Only', value: 'True' },
          { trait_type: 'Max Mints', value: '1' },
          { trait_type: 'Products Sold', value: '4' },
          { trait_type: 'Product Pass Mints', value: '2' },
        ],
      });
    });
  });
});
