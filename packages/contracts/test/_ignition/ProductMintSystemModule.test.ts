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

  it('should set the correct default metadata for the pass NFT', async () => {
    const { passMetadataProvider } = await loadFixture(deployProductMintSystem);

    const metadata = await passMetadataProvider.defaultMetadata();
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

    const metadata = await organizationMetadataProvider.defaultMetadata();
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
});
