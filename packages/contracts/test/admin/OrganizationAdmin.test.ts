import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';

describe('OrganizationAdmin', () => {
  async function deployOrganizationAdmin() {
    const [owner, otherAccount, account3] = await hre.ethers.getSigners();

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

    const OrganizationAdmin = await hre.ethers.getContractFactory(
      'OrganizationAdmin',
    );
    const organizationAdmin = await OrganizationAdmin.deploy(contractRegistry);

    await contractRegistry.setOrgAdmin(organizationAdmin);
    await contractRegistry.setOrganizationNFT(organizationNFT);

    return {
      organizationAdmin,
      contractRegistry,
      organizationNFT,
      owner,
      otherAccount,
      account3,
    };
  }

  describe('Deployment', () => {
    it('should set the contract registry', async () => {
      const { organizationAdmin, contractRegistry } = await loadFixture(
        deployOrganizationAdmin,
      );

      expect(await organizationAdmin.registry()).to.equal(contractRegistry);
    });
  });

  describe('Supports ERC165', () => {
    it('should support the ERC165 interface', async () => {
      const { organizationAdmin } = await loadFixture(deployOrganizationAdmin);

      expect(await organizationAdmin.supportsInterface('0x01ffc9a7')).to.be
        .true;
    });
  });

  describe('Org Admins', () => {
    it('can add multiple org admins as the org owner', async () => {
      const {
        organizationAdmin,
        organizationNFT,
        owner,
        otherAccount,
        account3,
      } = await loadFixture(deployOrganizationAdmin);

      await organizationNFT.connect(owner).mint(owner.address);

      await expect(
        organizationAdmin.connect(owner).addAdmin(1, otherAccount.address),
      )
        .to.emit(organizationAdmin, 'OrgAdminUpdate')
        .withArgs(1, otherAccount.address, true);

      await expect(
        organizationAdmin.connect(owner).addAdmin(1, account3.address),
      )
        .to.emit(organizationAdmin, 'OrgAdminUpdate')
        .withArgs(1, account3.address, true);

      expect(await organizationAdmin.getAdmins(1)).to.deep.equal([
        otherAccount.address,
        account3.address,
      ]);

      expect(await organizationAdmin.isAdmin(1, otherAccount.address)).to.be
        .true;
      expect(await organizationAdmin.isAdmin(1, account3.address)).to.be.true;
      expect(await organizationAdmin.isAdmin(1, owner.address)).to.be.false;
    });

    it('cannot add an org admin if the caller is not the org owner', async () => {
      const { organizationAdmin, organizationNFT, owner, otherAccount } =
        await loadFixture(deployOrganizationAdmin);

      await organizationNFT.connect(owner).mint(owner.address);

      await expect(
        organizationAdmin
          .connect(otherAccount)
          .addAdmin(1, otherAccount.address),
      ).to.be.revertedWith('Not the owner of the OrganizationNFT');
    });

    it('cannot add an admin if the admin already exists', async () => {
      const { organizationAdmin, organizationNFT, owner, otherAccount } =
        await loadFixture(deployOrganizationAdmin);

      await organizationNFT.connect(owner).mint(owner.address);

      await organizationAdmin.connect(owner).addAdmin(1, otherAccount.address);

      await expect(
        organizationAdmin.connect(owner).addAdmin(1, otherAccount.address),
      ).to.be.revertedWith('Admin already exists');
    });

    it('can remove an org admin as the org owner', async () => {
      const { organizationAdmin, organizationNFT, owner, otherAccount } =
        await loadFixture(deployOrganizationAdmin);

      await organizationNFT.connect(owner).mint(owner.address);

      await expect(
        organizationAdmin.connect(owner).addAdmin(1, otherAccount.address),
      )
        .to.emit(organizationAdmin, 'OrgAdminUpdate')
        .withArgs(1, otherAccount.address, true);

      await expect(
        organizationAdmin.connect(owner).removeAdmin(1, otherAccount.address),
      )
        .to.emit(organizationAdmin, 'OrgAdminUpdate')
        .withArgs(1, otherAccount.address, false);

      expect(await organizationAdmin.getAdmins(1)).to.deep.equal([]);
      expect(await organizationAdmin.isAdmin(1, otherAccount.address)).to.be
        .false;
    });

    it('can remove all org admins as the org owner', async () => {
      const {
        organizationAdmin,
        organizationNFT,
        owner,
        otherAccount,
        account3,
      } = await loadFixture(deployOrganizationAdmin);

      await organizationNFT.connect(owner).mint(owner.address);

      await organizationAdmin.connect(owner).addAdmin(1, otherAccount);

      await organizationAdmin.connect(owner).addAdmin(1, account3);

      await expect(organizationAdmin.connect(owner).removeAllAdmins(1))
        .to.emit(organizationAdmin, 'OrgAdminUpdate')
        .withArgs(1, otherAccount.address, false)
        .and.to.emit(organizationAdmin, 'OrgAdminUpdate')
        .withArgs(1, account3.address, false);

      expect(await organizationAdmin.getAdmins(1)).to.deep.equal([]);
    });

    it('cannot remove all org admins if the caller is not the org owner', async () => {
      const { organizationAdmin, organizationNFT, owner, otherAccount } =
        await loadFixture(deployOrganizationAdmin);

      await organizationNFT.connect(owner).mint(owner.address);

      await organizationAdmin.connect(owner).addAdmin(1, otherAccount.address);

      await expect(
        organizationAdmin.connect(otherAccount).removeAllAdmins(1),
      ).to.be.revertedWith('Not the owner of the OrganizationNFT');
    });

    it('cannot remove an org admin if not the org owner', async () => {
      const { organizationAdmin, organizationNFT, owner, otherAccount } =
        await loadFixture(deployOrganizationAdmin);

      await organizationNFT.connect(owner).mint(owner.address);

      await organizationAdmin.connect(owner).addAdmin(1, otherAccount.address);

      await expect(
        organizationAdmin
          .connect(otherAccount)
          .removeAdmin(1, otherAccount.address),
      ).to.be.revertedWith('Not the owner of the OrganizationNFT');
    });

    it('cannot remove an admin if the admin does not exist', async () => {
      const { organizationAdmin, organizationNFT, owner, otherAccount } =
        await loadFixture(deployOrganizationAdmin);

      await organizationNFT.connect(owner).mint(owner.address);

      await expect(
        organizationAdmin.connect(owner).removeAdmin(1, otherAccount.address),
      ).to.be.revertedWith('Admin not found');
    });
  });
});
