import { expect } from 'chai';
import { loadWithDefaultProduct } from '../manager/helpers';
import { hashPermissionId } from '../permission/helpers';
import hre from 'hardhat';

describe('PermissionRegistry', () => {
  describe('Deployment', () => {
    it('has owner and registry set', async () => {
      const { permissionRegistry, permissionFactory, contractRegistry, owner } =
        await loadWithDefaultProduct();

      expect(await permissionRegistry.owner()).to.equal(owner);
      expect(await permissionRegistry.registry()).to.equal(
        await contractRegistry.getAddress(),
      );
      expect(await permissionRegistry.permissionFactory()).to.equal(
        await permissionFactory.getAddress(),
      );
    });
  });

  describe('ERC165', () => {
    it('returns true for the IERC165 interface', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();
      expect(await permissionRegistry.supportsInterface('0x01ffc9a7')).to.be
        .true;
    });
  });

  describe('Has Permission', () => {
    it('returns false if the permission is not set', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      expect(
        await permissionRegistry.hasPermission(
          1,
          owner,
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.be.false;
    });

    it('reverts if the permission does not exist', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.hasPermission(
          1,
          owner,
          hashPermissionId('not a permission'),
        ),
      ).to.be.revertedWithCustomError(permissionRegistry, 'InactivePermission');
    });

    it('reverts if the permission is not active', async () => {
      const { permissionRegistry, permissionFactory, owner } =
        await loadWithDefaultProduct();

      await permissionFactory.setPermissionActive(
        hashPermissionId('pass.wallet.spend'),
        false,
      );

      await expect(
        permissionRegistry.hasPermission(
          1,
          owner,
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.be.revertedWithCustomError(permissionRegistry, 'InactivePermission');
    });

    it('should return false if the org does not exist', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      expect(
        await permissionRegistry.hasPermission(
          0,
          owner,
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.equal(false);
    });
  });

  describe('Has Permissions', () => {
    it('returns false when the permissions are not set', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      expect(
        await permissionRegistry.hasPermissions(1, owner, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.mint'),
        ]),
      ).to.deep.equal([false, false]);
    });

    it('returns true for the correct permissions when the permissions are set for the owner', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await permissionRegistry.addPermissions(1, [
        hashPermissionId('pass.wallet.spend'),
      ]);

      expect(
        await permissionRegistry.hasPermissions(1, owner, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.mint'),
        ]),
      ).to.deep.equal([true, false]);
    });

    it('reverts if the permissions are not active', async () => {
      const { permissionRegistry, permissionFactory, owner } =
        await loadWithDefaultProduct();

      await permissionFactory.setPermissionActive(
        hashPermissionId('pass.wallet.spend'),
        false,
      );

      await expect(
        permissionRegistry.hasPermissions(1, owner, [
          hashPermissionId('pass.wallet.spend'),
        ]),
      ).to.be.revertedWithCustomError(permissionRegistry, 'InactivePermission');
    });

    it('reverts if the permission does not exist', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.hasPermissions(1, owner, [
          hashPermissionId('not a permission'),
        ]),
      ).to.be.revertedWithCustomError(permissionRegistry, 'InactivePermission');
    });

    it('reverts if no permissions are provided', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.hasPermissions(1, owner, []),
      ).to.be.revertedWith('No permissions provided');
    });
  });

  describe('Get Permissions', () => {
    it('returns the correct permissions for the org for multiple owners', async () => {
      const { permissionRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      await permissionRegistry
        .connect(owner)
        .addPermissions(1, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.mint'),
        ]);

      await permissionRegistry
        .connect(otherAccount)
        .addPermissions(1, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
        ]);

      expect(await permissionRegistry.getPermissions(1, owner)).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.mint'),
      ]);

      expect(
        await permissionRegistry.getPermissions(1, otherAccount),
      ).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

      expect(
        await permissionRegistry.getPermissionsBatch(
          [1, 1],
          [owner, otherAccount],
        ),
      ).to.deep.equal([
        [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.mint'),
        ],
        [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
        ],
      ]);
    });
    it('returns no permissions if the org does not exist', async () => {
      const { permissionRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      expect(await permissionRegistry.getPermissions(0, owner)).to.deep.equal(
        [],
      );
      expect(
        await permissionRegistry.getPermissionsBatch(
          [0, 0],
          [owner, otherAccount],
        ),
      ).to.deep.equal([[], []]);
    });

    it('returns empty array if no permissions are set for the org and owner', async () => {
      const { permissionRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      expect(await permissionRegistry.getPermissions(1, owner)).to.deep.equal(
        [],
      );
      expect(
        await permissionRegistry.getPermissionsBatch(
          [1, 1],
          [owner, otherAccount],
        ),
      ).to.deep.equal([[], []]);
    });

    it('reverts if no orgIds are provided', async () => {
      const { permissionRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.getPermissionsBatch([], [owner, otherAccount]),
      ).to.be.revertedWith('No orgIds provided');
    });

    it('reverts if the orgIds and owners are not the same length', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.getPermissionsBatch([1, 1], [owner]),
      ).to.be.revertedWith('Invalid input length');
    });
  });

  describe('Add Permissions', () => {
    it('can add valid permissions', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await permissionRegistry.addPermissions(1, [
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.mint'),
      ]);

      expect(
        await permissionRegistry.hasPermission(
          1,
          owner,
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.be.true;

      expect(
        await permissionRegistry.hasPermissions(1, owner, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.mint'),
        ]),
      ).to.deep.equal([true, true]);
    });

    it('reverts if the org does not exist', async () => {
      const { permissionRegistry, organizationNFT } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.addPermissions(0, [
          hashPermissionId('pass.wallet.spend'),
        ]),
      )
        .to.be.revertedWithCustomError(
          organizationNFT,
          'ERC721NonexistentToken',
        )
        .withArgs(0);
    });

    it('reverts if the permission does not exist', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.addPermissions(1, [
          hashPermissionId('not a permission'),
        ]),
      ).to.be.revertedWithCustomError(permissionRegistry, 'InactivePermission');
    });

    it('reverts if the permission is not active', async () => {
      const { permissionRegistry, permissionFactory } =
        await loadWithDefaultProduct();

      await permissionFactory.setPermissionActive(
        hashPermissionId('pass.wallet.spend'),
        false,
      );

      await expect(
        permissionRegistry.addPermissions(1, [
          hashPermissionId('pass.wallet.spend'),
        ]),
      ).to.be.revertedWithCustomError(permissionRegistry, 'InactivePermission');
    });

    it('reverts if no permissions are provided', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      await expect(permissionRegistry.addPermissions(1, [])).to.be.revertedWith(
        'No permissions provided',
      );
    });
  });

  describe('Remove Permissions', () => {
    it('can remove the correct permissions when multiple permissions are set', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await permissionRegistry.addPermissions(1, [
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.mint'),
      ]);

      expect(await permissionRegistry.getPermissions(1, owner)).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.mint'),
      ]);

      await permissionRegistry.removePermissions(1, [
        hashPermissionId('pass.wallet.spend'),
      ]);

      expect(await permissionRegistry.getPermissions(1, owner)).to.deep.equal([
        hashPermissionId('pass.purchase.mint'),
      ]);
    });

    it('reverts if the org does not exist', async () => {
      const { permissionRegistry, organizationNFT } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.removePermissions(0, [
          hashPermissionId('pass.wallet.spend'),
        ]),
      ).to.be.revertedWithCustomError(
        organizationNFT,
        'ERC721NonexistentToken',
      );
    });

    it('reverts if no permissions are provided', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.removePermissions(1, []),
      ).to.be.revertedWith('No permissions provided');
    });
  });

  describe('Set Permission Factory', () => {
    it('can set the permission factory', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      const PermissionFactory = await hre.ethers.getContractFactory(
        'PermissionFactory',
      );
      const newPermissionFactory = await PermissionFactory.deploy();

      await permissionRegistry.setPermissionFactory(
        await newPermissionFactory.getAddress(),
      );

      expect(await permissionRegistry.permissionFactory()).to.equal(
        await newPermissionFactory.getAddress(),
      );
    });

    it('reverts if the permission factory does not conform to the interface', async () => {
      const { permissionRegistry, organizationNFT } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.setPermissionFactory(
          await organizationNFT.getAddress(),
        ),
      ).to.be.revertedWith('Invalid permission factory');
    });

    it('reverts if the caller is not the owner', async () => {
      const { permissionRegistry, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry
          .connect(otherAccount)
          .setPermissionFactory(otherAccount),
      ).to.be.revertedWithCustomError(
        permissionRegistry,
        'OwnableUnauthorizedAccount',
      );
    });
  });
});
