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

    const OrganizationMetadataProvider = await hre.ethers.getContractFactory(
      'OrganizationMetadataProvider',
    );
    const organizationMetadataProvider =
      await OrganizationMetadataProvider.deploy(contractRegistry);

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

    const PassMetadataProvider = await hre.ethers.getContractFactory(
      'PassMetadataProvider',
    );
    const passMetadataProvider = await PassMetadataProvider.deploy(
      contractRegistry,
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
      const { productPassNFT, contractRegistry, passMetadataProvider } =
        await loadFixture(deployProductPassNFT);

      const newMetadataProvider = await hre.ethers.getContractFactory(
        'PassMetadataProvider',
      );
      const newMetadataProviderInstance = await newMetadataProvider.deploy(
        contractRegistry,
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

      await pricingRegistry.connect(otherAccount).createOneTimePricing({
        organizationId: 2,
        flatPrice: ethers.parseEther('1'),
        token: ethers.ZeroAddress,
        isRestricted: false,
      });

      await productRegistry.connect(otherAccount).linkPricing(2, [2]);

      // Mint the passes
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
      await purchaseManager.connect(otherAccount).purchaseProducts(
        {
          to: otherAccount,
          organizationId: 2,
          productIds: [2],
          pricingIds: [2],
          quantities: [0],
          couponCode: '',
          airdrop: false,
          pause: false,
        },
        { value: ethers.parseEther('1') },
      );

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
      await purchaseManager.connect(otherAccount2).purchaseProducts(
        {
          to: otherAccount2,
          organizationId: 2,
          productIds: [2],
          pricingIds: [2],
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

      // Pass Token URIs
      const tokenUris = await productPassNFT.tokenURIBatch([1, 2, 3, 4, 5]);
      expect(tokenUris.length).to.equal(5);

      assertMetadata(tokenUris[0], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization ID', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
        ],
      });

      assertMetadata(tokenUris[1], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization ID', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
        ],
      });

      assertMetadata(tokenUris[2], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization ID', value: '2' },
          { trait_type: 'Product 2', value: 'Name 2' },
        ],
      });

      assertMetadata(tokenUris[3], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization ID', value: '1' },
          { trait_type: 'Product 1', value: 'Product 1' },
        ],
      });

      assertMetadata(tokenUris[4], {
        ...EXPECTED_DEFAULT_PASS_METADATA,
        attributes: [
          { trait_type: 'Organization ID', value: '2' },
          { trait_type: 'Product 2', value: 'Name 2' },
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
        ],
      });

      assertMetadata(orgTokenUris[1], {
        ...EXPECTED_DEFAULT_ORGANIZATION_METADATA,
        attributes: [
          { trait_type: 'Whitelist Only', value: 'True' },
          { trait_type: 'Max Mints', value: '1' },
        ],
      });
    });
  });
});
