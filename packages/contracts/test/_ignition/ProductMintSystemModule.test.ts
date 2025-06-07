import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre from 'hardhat';
import { expect } from 'chai';
import ProductMintSystemModule from '../../ignition/modules/ProductMintSystem';

describe('ProductMintSystemModule', () => {
  async function deployProductMintSystem() {
    const [owner] = await hre.ethers.getSigners();
    const module = await hre.ignition.deploy(ProductMintSystemModule);

    return {
      owner,
      ...module,
    };
  }

  it('should deploy the test ERC20 token', async () => {
    const { mintToken } = await loadFixture(deployProductMintSystem);

    expect(await mintToken.name()).to.equal('MintToken');
    expect(await mintToken.symbol()).to.equal('MINT');
    expect(await mintToken.getAddress()).to.not.be.undefined;
  });

  it('should set the correct default metadata for the pass NFT', async () => {
    const { passMetadataProvider } = await loadFixture(deployProductMintSystem);

    const metadata = await passMetadataProvider.getDefaultMetadata();
    expect(metadata.name).to.equal('Product Pass');
    expect(metadata.description).to.equal(
      'A ProductMint Product Pass is used for tokenizing products and creating permissionless subscriptions. Organizations can sell product passes to their customers to grant them access to their products.',
    );
    expect(metadata.externalUrl).to.equal('https://productmint.io');
    expect(metadata.image).to.equal('https://productmint.io/image.png');
    expect(metadata.backgroundColor).to.equal('');
    expect(metadata.animationUrl).to.equal('');
  });

  it('should set the correct default metadata for the organization NFT', async () => {
    const { organizationMetadataProvider } = await loadFixture(
      deployProductMintSystem,
    );

    const metadata = await organizationMetadataProvider.getDefaultMetadata();
    expect(metadata.name).to.equal('Organization');
    expect(metadata.description).to.equal(
      'A ProductMint Organization is required to sell products and subscriptions. Create products and pricing models within the organization to start selling product passes for your products.',
    );
    expect(metadata.externalUrl).to.equal('https://productmint.io');
    expect(metadata.image).to.equal('https://productmint.io/image.png');
    expect(metadata.backgroundColor).to.equal('');
    expect(metadata.animationUrl).to.equal('');
  });

  it('should set the correct contracts in the contract registry', async () => {
    const {
      contractRegistry,
      productRegistry,
      pricingRegistry,
      productPassNFT,
      organizationNFT,
      purchaseManager,
      subscriptionEscrow,
      paymentEscrow,
      usageRecorder,
      pricingCalculator,
      couponRegistry,
      purchaseRegistry,
      discountRegistry,
      orgAdmin,
    } = await loadFixture(deployProductMintSystem);

    // Admin
    expect(await contractRegistry.orgAdmin()).to.equal(orgAdmin);

    // Registry
    expect(await contractRegistry.productRegistry()).to.equal(productRegistry);
    expect(await contractRegistry.pricingRegistry()).to.equal(pricingRegistry);
    expect(await contractRegistry.purchaseRegistry()).to.equal(
      purchaseRegistry,
    );
    expect(await contractRegistry.couponRegistry()).to.equal(couponRegistry);
    expect(await contractRegistry.discountRegistry()).to.equal(
      discountRegistry,
    );

    // Calculator
    expect(await contractRegistry.pricingCalculator()).to.equal(
      pricingCalculator,
    );

    // NFTs
    expect(await contractRegistry.productPassNFT()).to.equal(productPassNFT);
    expect(await contractRegistry.organizationNFT()).to.equal(organizationNFT);

    // Oracles
    expect(await contractRegistry.productTransferOracle()).to.equal(
      productRegistry,
    );
    expect(await contractRegistry.subscriptionTransferOracle()).to.equal(
      subscriptionEscrow,
    );

    // Escrow
    expect(await contractRegistry.purchaseManager()).to.equal(purchaseManager);
    expect(await contractRegistry.subscriptionEscrow()).to.equal(
      subscriptionEscrow,
    );
    expect(await contractRegistry.paymentEscrow()).to.equal(paymentEscrow);

    // Usage recorder
    expect(await contractRegistry.usageRecorder()).to.equal(usageRecorder);
  });

  it('should set the owner in the contract registry', async () => {
    const { owner, contractRegistry } = await loadFixture(
      deployProductMintSystem,
    );

    expect(await contractRegistry.owner()).to.equal(owner.address);
  });

  it('should set the correct metadata providers for the NFTs', async () => {
    const {
      productPassNFT,
      organizationNFT,
      passMetadataProvider,
      organizationMetadataProvider,
    } = await loadFixture(deployProductMintSystem);

    expect(await productPassNFT.metadataProvider()).to.equal(
      passMetadataProvider,
    );
    expect(await organizationNFT.metadataProvider()).to.equal(
      organizationMetadataProvider,
    );
  });

  it('should deploy the renewal processor with the correct registry', async () => {
    const { renewalProcessor, contractRegistry } = await loadFixture(
      deployProductMintSystem,
    );

    expect(await renewalProcessor.getAddress()).to.not.be.undefined;
    expect(await renewalProcessor.registry()).to.equal(contractRegistry);
  });

  it('should deploy the permission factory and registry with the correct contracts', async () => {
    const { permissionFactory, permissionRegistry } = await loadFixture(
      deployProductMintSystem,
    );

    expect(await permissionFactory.getAddress()).to.not.be.undefined;
    expect(await permissionRegistry.getAddress()).to.not.be.undefined;
  });
});
