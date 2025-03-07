import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('ProductPassNFT', () => {
  async function deployProductPassNFT() {
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

    const ProductRegistry =
      await hre.ethers.getContractFactory('ProductRegistry');
    const productRegistry = await ProductRegistry.deploy(organizationNFT);

    const PassMetadataProvider = await hre.ethers.getContractFactory(
      'PassMetadataProvider',
    );
    const passMetadataProvider =
      await PassMetadataProvider.deploy(contractRegistry);

    const ProductPassNFT =
      await hre.ethers.getContractFactory('ProductPassNFT');
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
      const { productPassNFT, contractRegistry } =
        await loadFixture(deployProductPassNFT);

      expect(await productPassNFT.registry()).to.equal(contractRegistry);
    });

    it('should set the correct owner', async () => {
      const { productPassNFT, owner } = await loadFixture(deployProductPassNFT);

      expect(await productPassNFT.owner()).to.equal(owner);
    });
  });

  it('only purchase manager can mint', async () => {
    const { productPassNFT, owner, otherAccount } =
      await loadFixture(deployProductPassNFT);

    await expect(
      productPassNFT.connect(otherAccount).mint(owner, 1),
    ).to.be.revertedWith('Caller not authorized');
  });

  describe('Metadata', () => {
    it('should set the correct metadata provider', async () => {
      const { productPassNFT, passMetadataProvider } =
        await loadFixture(deployProductPassNFT);

      expect(await productPassNFT.metadataProvider()).to.equal(
        passMetadataProvider,
      );
    });

    it('metadata provider must implement the correct interface', async () => {
      const { productPassNFT, contractRegistry } =
        await loadFixture(deployProductPassNFT);

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
      const newMetadataProviderInstance =
        await newMetadataProvider.deploy(contractRegistry);

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
});
