import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { OrganizationNFT } from '../../typechain-types';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('OrganizationNFT', () => {
  async function deployOrganizationNFT() {
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

    await contractRegistry.setOrganizationNFT(organizationNFT);

    return {
      contractRegistry,
      organizationNFT,
      organizationMetadataProvider,
      organizationAttributeProvider,
      owner,
      otherAccount,
    };
  }

  describe('Deployment', () => {
    it('Should set the correct name and symbol', async () => {
      const { organizationNFT } = await loadFixture(deployOrganizationNFT);

      expect(await organizationNFT.name()).to.equal(
        'ProductMint Organization NFT',
      );
      expect(await organizationNFT.symbol()).to.equal('ORG');
    });

    it('should set correct roles', async () => {
      const { organizationNFT, owner } = await loadFixture(
        deployOrganizationNFT,
      );

      expect(
        await organizationNFT.hasRole(
          await organizationNFT.DEFAULT_ADMIN_ROLE(),
          owner.address,
        ),
      ).to.be.true;
      expect(
        await organizationNFT.hasRole(
          await organizationNFT.WHITELIST_ROLE(),
          owner.address,
        ),
      ).to.be.true;
    });

    it('should have correct default values', async () => {
      const { organizationNFT } = await loadFixture(deployOrganizationNFT);

      expect(await organizationNFT.mintOpen()).to.be.false;
      expect(await organizationNFT.totalSupply()).to.equal(0);
    });
  });

  describe('Metadata', () => {
    it('should set the correct metadata provider', async () => {
      const { organizationNFT, organizationMetadataProvider } =
        await loadFixture(deployOrganizationNFT);

      expect(await organizationNFT.metadataProvider()).to.equal(
        organizationMetadataProvider,
      );
    });

    it('metadata provider must implement the correct interface', async () => {
      const { organizationNFT, contractRegistry } = await loadFixture(
        deployOrganizationNFT,
      );

      await expect(
        organizationNFT.setMetadataProvider(contractRegistry),
      ).to.be.revertedWith('Invalid metadata provider');
    });

    it('can set another metadata provider', async () => {
      const {
        contractRegistry,
        organizationNFT,
        organizationMetadataProvider,
        organizationAttributeProvider,
      } = await loadFixture(deployOrganizationNFT);

      const newMetadataProvider = await hre.ethers.getContractFactory(
        'OrganizationMetadataProvider',
      );
      const newMetadataProviderInstance = await newMetadataProvider.deploy(
        contractRegistry,
        organizationAttributeProvider,
      );

      await expect(
        organizationNFT.setMetadataProvider(newMetadataProviderInstance),
      )
        .to.emit(organizationNFT, 'MetadataProviderSet')
        .withArgs(
          await organizationMetadataProvider.getAddress(),
          await newMetadataProviderInstance.getAddress(),
        );

      expect(await organizationNFT.metadataProvider()).to.equal(
        newMetadataProviderInstance,
      );
    });

    it('only admin can set metadata provider', async () => {
      const { organizationNFT, organizationMetadataProvider, otherAccount } =
        await loadFixture(deployOrganizationNFT);

      await expect(
        organizationNFT
          .connect(otherAccount)
          .setMetadataProvider(organizationMetadataProvider),
      )
        .to.be.revertedWithCustomError(
          organizationNFT,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(
          otherAccount.address,
          await organizationNFT.DEFAULT_ADMIN_ROLE(),
        );
    });
  });

  describe('Minting', () => {
    async function assertMinted(
      organizationNFT: OrganizationNFT,
      address: string,
      expectedSupply: number,
    ) {
      expect(await organizationNFT.totalSupply()).to.equal(expectedSupply);
      expect(await organizationNFT.balanceOf(address)).to.equal(1);
      expect(await organizationNFT.ownerOf(expectedSupply)).to.equal(address);
    }

    it('cannot mint if mint is not open', async () => {
      const { organizationNFT, owner } = await loadFixture(
        deployOrganizationNFT,
      );

      await expect(
        organizationNFT.connect(owner).mint(owner.address),
      ).to.be.revertedWith('Mint is not open');
    });

    it('can mint if mint is open', async () => {
      const { organizationNFT, otherAccount } = await loadFixture(
        deployOrganizationNFT,
      );

      await expect(organizationNFT.setMintOpen(true))
        .to.emit(organizationNFT, 'MintOpenSet')
        .withArgs(true);

      await organizationNFT.connect(otherAccount).mint(otherAccount.address);

      await assertMinted(organizationNFT, otherAccount.address, 1);
    });

    it('cannot mint if address is not whitelisted', async () => {
      const { organizationNFT, owner, otherAccount } = await loadFixture(
        deployOrganizationNFT,
      );

      await organizationNFT.setWhitelisted([otherAccount.address], [true]);

      await expect(
        organizationNFT.connect(owner).mint(owner.address),
      ).to.be.revertedWith('Mint is not open');
    });

    it('can mint if address is whitelisted', async () => {
      const { organizationNFT, otherAccount } = await loadFixture(
        deployOrganizationNFT,
      );

      await organizationNFT.setWhitelisted([otherAccount.address], [true]);

      await organizationNFT.connect(otherAccount).mint(otherAccount.address);

      await assertMinted(organizationNFT, otherAccount.address, 1);
    });

    it('can mint multiple NFTs', async () => {
      const { organizationNFT, otherAccount, owner } = await loadFixture(
        deployOrganizationNFT,
      );

      await organizationNFT.setWhitelisted([otherAccount.address], [true]);

      await organizationNFT.connect(otherAccount).mint(otherAccount.address);

      await assertMinted(organizationNFT, otherAccount.address, 1);

      await organizationNFT.connect(otherAccount).mint(owner.address);

      await assertMinted(organizationNFT, owner.address, 2);
    });
  });

  describe('Mint Open', () => {
    it('can set mint open', async () => {
      const { organizationNFT, owner } = await loadFixture(
        deployOrganizationNFT,
      );

      await organizationNFT.connect(owner).setMintOpen(true);

      expect(await organizationNFT.mintOpen()).to.be.true;
    });

    it('cannot set mint open if no role', async () => {
      const { organizationNFT, otherAccount } = await loadFixture(
        deployOrganizationNFT,
      );

      await expect(organizationNFT.connect(otherAccount).setMintOpen(true))
        .to.be.revertedWithCustomError(
          organizationNFT,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(
          otherAccount.address,
          await organizationNFT.DEFAULT_ADMIN_ROLE(),
        );
    });
  });

  describe('Whitelist Management', () => {
    it('can set whitelist', async () => {
      const { organizationNFT, otherAccount } = await loadFixture(
        deployOrganizationNFT,
      );

      await organizationNFT.setWhitelisted([otherAccount.address], [true]);

      expect(await organizationNFT.whitelisted(otherAccount.address)).to.be
        .true;
    });

    it('cannot set whitelist if no role', async () => {
      const { organizationNFT, otherAccount } = await loadFixture(
        deployOrganizationNFT,
      );

      await expect(
        organizationNFT
          .connect(otherAccount)
          .setWhitelisted([otherAccount.address], [true]),
      )
        .to.be.revertedWithCustomError(
          organizationNFT,
          'AccessControlUnauthorizedAccount',
        )
        .withArgs(otherAccount.address, await organizationNFT.WHITELIST_ROLE());
    });

    it('must provide addresses', async () => {
      const { organizationNFT } = await loadFixture(deployOrganizationNFT);

      await expect(organizationNFT.setWhitelisted([], [])).to.be.revertedWith(
        'No addresses provided',
      );
    });

    it('must provide equal number of addresses and isWhitelisted', async () => {
      const { organizationNFT, owner } = await loadFixture(
        deployOrganizationNFT,
      );

      await expect(
        organizationNFT.setWhitelisted([owner.address], [true, false]),
      ).to.be.revertedWith('Invalid input length');
    });

    it('can set whitelist for multiple addresses', async () => {
      const { organizationNFT, owner, otherAccount } = await loadFixture(
        deployOrganizationNFT,
      );

      await expect(
        organizationNFT.setWhitelisted(
          [owner.address, otherAccount.address],
          [true, true],
        ),
      )
        .to.emit(organizationNFT, 'WhitelistedSet')
        .withArgs(owner.address, true)
        .and.emit(organizationNFT, 'WhitelistedSet')
        .withArgs(otherAccount.address, true);

      expect(await organizationNFT.whitelisted(owner.address)).to.be.true;
      expect(await organizationNFT.whitelisted(otherAccount.address)).to.be
        .true;

      await organizationNFT.setWhitelisted(
        [owner.address, otherAccount.address],
        [false, false],
      );

      expect(await organizationNFT.whitelisted(owner.address)).to.be.false;
      expect(await organizationNFT.whitelisted(otherAccount.address)).to.be
        .false;
    });
  });

  describe('Supports Interface', () => {
    it('supports ERC721 interface', async () => {
      const { organizationNFT } = await loadFixture(deployOrganizationNFT);

      expect(await organizationNFT.supportsInterface('0x01ffc9a7')).to.be.true;
    });

    it('supports IOrganizationNFT interface', async () => {
      const { organizationNFT } = await loadFixture(deployOrganizationNFT);

      const interfaceId = calculateInterfaceId([
        'mintOpen()',
        'totalSupply()',
        'mint(address)',
        'setMintOpen(bool)',
        'whitelisted(address)',
        'setWhitelisted(address[],bool[])',
      ]);

      expect(await organizationNFT.supportsInterface(interfaceId)).to.be.true;
    });
  });
});
