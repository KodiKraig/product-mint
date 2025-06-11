import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import hre, { ethers } from 'hardhat';
import { assertPermission, hashPermissionId } from './helpers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

describe('PermissionFactory', () => {
  async function deployPermissionFactory() {
    const [owner, otherAccount] = await ethers.getSigners();

    const PermissionFactory = await hre.ethers.getContractFactory(
      'PermissionFactory',
    );
    const permissionFactory = await PermissionFactory.deploy();

    // Get the deployment block to get the timestamp
    const deploymentBlock = permissionFactory.deploymentTransaction();
    const blockNumber = deploymentBlock?.blockNumber;
    const block = await ethers.provider.getBlock(blockNumber!);
    const deploymentTimestamp = block?.timestamp;

    return { owner, otherAccount, permissionFactory, deploymentTimestamp };
  }

  describe('ERC165', () => {
    it('should return true for IERC165 interface', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);
      expect(await permissionFactory.supportsInterface('0x01ffc9a7')).to.equal(
        true,
      );
    });

    it('should return true for IPermissionFactory interface', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      const interfaceId = calculateInterfaceId([
        'createPermission(string,string,bool)',
        'setPermissionDescription(bytes32,string)',
        'setPermissionActive(bytes32,bool)',
        'getPermissionIdByName(string)',
        'getAllPermissionIds()',
        'getAllPermissions()',
        'getPermission(bytes32)',
        'getPermissionBatch(bytes32[])',
        'getPermissionByName(string)',
        'getPermissionByNameBatch(string[])',
        'isPermissionActive(bytes32)',
        'isPermissionActiveBatch(bytes32[])',
        'isPermissionActiveByName(string)',
        'isPermissionActiveByNameBatch(string[])',
        'getDefaultPermissionIds()',
        'isDefaultPermission(bytes32)',
        'addDefaultPermission(bytes32)',
        'removeDefaultPermission(bytes32)',
      ]);

      expect(await permissionFactory.supportsInterface(interfaceId)).to.equal(
        true,
      );
    });

    it('should return false for non-existent interface', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      expect(await permissionFactory.supportsInterface('0xffffffff')).to.equal(
        false,
      );
    });
  });

  describe('Deployment', () => {
    it('owner should be the deployer', async () => {
      const { owner, permissionFactory } = await loadFixture(
        deployPermissionFactory,
      );
      expect(await permissionFactory.owner()).to.equal(owner.address);
    });

    it('should deploy the permission factory with default permissions', async () => {
      const { permissionFactory, deploymentTimestamp } = await loadFixture(
        deployPermissionFactory,
      );

      expect(await permissionFactory.getAddress()).to.not.be.undefined;

      const allPermissionIds = await permissionFactory.getAllPermissionIds();
      expect(allPermissionIds.length).to.equal(5);
      expect(allPermissionIds).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
        hashPermissionId('pass.subscription.renewal'),
        hashPermissionId('pass.subscription.pricing'),
        hashPermissionId('pass.subscription.quantity'),
      ]);

      const defaultPermissions =
        await permissionFactory.getDefaultPermissionIds();
      expect(defaultPermissions).to.deep.equal(allPermissionIds);

      const allPermissions = await permissionFactory.getAllPermissions();
      expect(allPermissions.length).to.equal(5);

      assertPermission({
        test: allPermissions[0],
        expected: {
          name: 'pass.wallet.spend',
          description:
            'Approve an organization to spend funds from your wallet',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[1],
        expected: {
          name: 'pass.purchase.additional',
          description: 'Purchase additional products',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[2],
        expected: {
          name: 'pass.subscription.renewal',
          description: 'Automatically renew expired subscriptions',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[3],
        expected: {
          name: 'pass.subscription.pricing',
          description: 'Update or downgrade the pricing for a subscription',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[4],
        expected: {
          name: 'pass.subscription.quantity',
          description: 'Change the quantity for a TIERED subscription',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
    });
  });

  describe('Create Permission', () => {
    it('should create a new default permission', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.createPermission('test.permission', 'test', true),
      )
        .to.emit(permissionFactory, 'PermissionCreated')
        .withArgs(
          hashPermissionId('test.permission'),
          'test.permission',
          'test',
          true,
        )
        .and.to.emit(permissionFactory, 'DefaultPermissionAdded')
        .withArgs(hashPermissionId('test.permission'));

      const allPermissionIds = await permissionFactory.getAllPermissionIds();
      expect(allPermissionIds.length).to.equal(6);
      expect(allPermissionIds).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
        hashPermissionId('pass.subscription.renewal'),
        hashPermissionId('pass.subscription.pricing'),
        hashPermissionId('pass.subscription.quantity'),
        hashPermissionId('test.permission'),
      ]);

      const test = await permissionFactory.getPermissionByName(
        'test.permission',
      );
      expect(test.name).to.equal('test.permission');
      expect(test.description).to.equal('test');
      expect(test.isActive).to.equal(true);

      expect(
        await permissionFactory.isDefaultPermission(
          hashPermissionId('test.permission'),
        ),
      ).to.equal(true);
    });

    it('should create a none default permission', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.createPermission('test.permission', 'test', false),
      )
        .to.emit(permissionFactory, 'PermissionCreated')
        .withArgs(
          hashPermissionId('test.permission'),
          'test.permission',
          'test',
          false,
        )
        .and.not.to.emit(permissionFactory, 'DefaultPermissionAdded');

      const allPermissionIds = await permissionFactory.getAllPermissionIds();
      expect(allPermissionIds.length).to.equal(6);
      expect(allPermissionIds).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
        hashPermissionId('pass.subscription.renewal'),
        hashPermissionId('pass.subscription.pricing'),
        hashPermissionId('pass.subscription.quantity'),
        hashPermissionId('test.permission'),
      ]);

      const test = await permissionFactory.getPermissionByName(
        'test.permission',
      );
      expect(test.name).to.equal('test.permission');
      expect(test.description).to.equal('test');
      expect(test.isActive).to.equal(true);

      expect(
        await permissionFactory.isDefaultPermission(
          hashPermissionId('test.permission'),
        ),
      ).to.equal(false);
    });

    it('revert if no name is provided', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.createPermission('', 'test', true),
      ).to.be.revertedWith('Name cannot be empty');
    });

    it('revert if permission name already exists', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.createPermission('pass.wallet.spend', 'test', true),
      ).to.be.revertedWith('Permission name already exists');
    });

    it('revert if not owner', async () => {
      const { permissionFactory, otherAccount } = await loadFixture(
        deployPermissionFactory,
      );

      await expect(
        permissionFactory
          .connect(otherAccount)
          .createPermission('test.permission', 'test', true),
      ).to.be.revertedWithCustomError(
        permissionFactory,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Set Permission Active', () => {
    it('should deactivate and reactivate a permission', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.setPermissionActive(
          hashPermissionId('pass.wallet.spend'),
          false,
        ),
      )
        .to.emit(permissionFactory, 'PermissionActivation')
        .withArgs(hashPermissionId('pass.wallet.spend'), false);

      let test = await permissionFactory.getPermissionByName(
        'pass.wallet.spend',
      );
      expect(test.isActive).to.equal(false);

      await expect(
        permissionFactory.setPermissionActive(
          hashPermissionId('pass.wallet.spend'),
          true,
        ),
      )
        .to.emit(permissionFactory, 'PermissionActivation')
        .withArgs(hashPermissionId('pass.wallet.spend'), true);

      test = await permissionFactory.getPermissionByName('pass.wallet.spend');
      expect(test.isActive).to.equal(true);
    });

    it('revert if permission does not exist', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.setPermissionActive(
          hashPermissionId('test.permission'),
          true,
        ),
      ).to.be.revertedWith('Permission does not exist');
    });

    it('revert if permission already set to this active state', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.setPermissionActive(
          hashPermissionId('pass.wallet.spend'),
          true,
        ),
      ).to.be.revertedWith('Permission already set to this active state');
    });

    it('revert if not owner', async () => {
      const { permissionFactory, otherAccount } = await loadFixture(
        deployPermissionFactory,
      );

      await expect(
        permissionFactory
          .connect(otherAccount)
          .setPermissionActive(hashPermissionId('pass.wallet.spend'), true),
      ).to.be.revertedWithCustomError(
        permissionFactory,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Set Permission Description', () => {
    it('should set the description of a permission', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.setPermissionDescription(
          hashPermissionId('pass.wallet.spend'),
          'Updated description',
        ),
      )
        .to.emit(permissionFactory, 'PermissionDescriptionSet')
        .withArgs(hashPermissionId('pass.wallet.spend'), 'Updated description');

      const test = await permissionFactory.getPermissionByName(
        'pass.wallet.spend',
      );
      expect(test.description).to.equal('Updated description');
    });

    it('revert if permission does not exist', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.setPermissionDescription(
          hashPermissionId('test.permission'),
          'test',
        ),
      ).to.be.revertedWith('Permission does not exist');
    });

    it('revert if not owner', async () => {
      const { permissionFactory, otherAccount } = await loadFixture(
        deployPermissionFactory,
      );

      await expect(
        permissionFactory
          .connect(otherAccount)
          .setPermissionDescription(
            hashPermissionId('pass.wallet.spend'),
            'Updated description',
          ),
      ).to.be.revertedWithCustomError(
        permissionFactory,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Get Permission ID By Name', () => {
    it('should get a permission by ID', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      const id = await permissionFactory.getPermissionIdByName(
        'pass.wallet.spend',
      );
      expect(id).to.equal(hashPermissionId('pass.wallet.spend'));
    });

    it('revert if permission does not exist', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.getPermissionIdByName('test.permission'),
      ).to.be.revertedWith('Permission does not exist');
    });
  });

  describe('Get Permission', () => {
    it('should get a permission by ID', async () => {
      const { permissionFactory, deploymentTimestamp } = await loadFixture(
        deployPermissionFactory,
      );

      const permission = await permissionFactory.getPermission(
        hashPermissionId('pass.wallet.spend'),
      );
      assertPermission({
        test: permission,
        expected: {
          name: 'pass.wallet.spend',
          description:
            'Approve an organization to spend funds from your wallet',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
    });

    it('should revert if permission does not exist', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.getPermission(hashPermissionId('test.permission')),
      ).to.be.revertedWith('Permission does not exist');
    });
  });

  describe('Get Permission Batch', () => {
    it('should get a batch of permissions by ID', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      const permissions = await permissionFactory.getPermissionBatch([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

      expect(permissions.length).to.equal(2);
      expect(permissions[0].name).to.equal('pass.wallet.spend');
      expect(permissions[1].name).to.equal('pass.purchase.additional');
    });

    it('should revert if permission does not exist', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.getPermissionBatch([
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
          hashPermissionId('test.permission'),
        ]),
      ).to.be.revertedWith('Permission does not exist');
    });

    it('should revert if no permissions are provided', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(permissionFactory.getPermissionBatch([])).to.be.revertedWith(
        'No permissions provided',
      );
    });
  });

  describe('Get Permission By Name', () => {
    it('should get a permission by name', async () => {
      const { permissionFactory, deploymentTimestamp } = await loadFixture(
        deployPermissionFactory,
      );

      const permission = await permissionFactory.getPermissionByName(
        'pass.wallet.spend',
      );
      assertPermission({
        test: permission,
        expected: {
          name: 'pass.wallet.spend',
          description:
            'Approve an organization to spend funds from your wallet',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });

      it('should revert if permission does not exist', async () => {
        const { permissionFactory } = await loadFixture(
          deployPermissionFactory,
        );

        await expect(
          permissionFactory.getPermissionByName('test.permission'),
        ).to.be.revertedWith('Permission does not exist');
      });
    });
  });

  describe('Get Permission By Name Batch', () => {
    it('should get a batch of permissions by name', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      const permissions = await permissionFactory.getPermissionByNameBatch([
        'pass.wallet.spend',
        'pass.purchase.additional',
      ]);

      expect(permissions.length).to.equal(2);
      expect(permissions[0].name).to.equal('pass.wallet.spend');
      expect(permissions[1].name).to.equal('pass.purchase.additional');
    });

    it('should revert if permission does not exist', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.getPermissionByNameBatch([
          'pass.wallet.spend',
          'pass.purchase.additional',
          'test.permission',
        ]),
      ).to.be.revertedWith('Permission does not exist');
    });

    it('should revert if no permissions are provided', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.getPermissionByNameBatch([]),
      ).to.be.revertedWith('No permission names provided');
    });
  });

  describe('Is Permission Active', () => {
    it('should return true if permission is active', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      const isActive = await permissionFactory.isPermissionActive(
        hashPermissionId('pass.wallet.spend'),
      );
      expect(isActive).to.equal(true);

      const isActiveByName = await permissionFactory.isPermissionActiveByName(
        'pass.wallet.spend',
      );
      expect(isActiveByName).to.equal(true);
    });

    it('should return false if permission is not active', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await permissionFactory.setPermissionActive(
        hashPermissionId('pass.wallet.spend'),
        false,
      );

      const isActive = await permissionFactory.isPermissionActive(
        hashPermissionId('pass.wallet.spend'),
      );
      expect(isActive).to.equal(false);

      const isActiveByName = await permissionFactory.isPermissionActiveByName(
        'pass.wallet.spend',
      );
      expect(isActiveByName).to.equal(false);
    });
  });

  describe('Is Permission Active Batch', () => {
    it('should return a batch of active statuses', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      const isActive = await permissionFactory.isPermissionActiveBatch([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

      expect(isActive).to.equal(true);

      const isActiveByName =
        await permissionFactory.isPermissionActiveByNameBatch([
          'pass.wallet.spend',
          'pass.purchase.additional',
        ]);

      expect(isActiveByName).to.equal(true);
    });

    it('should return false if permission is not active', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await permissionFactory.setPermissionActive(
        hashPermissionId('pass.wallet.spend'),
        false,
      );

      const isActive = await permissionFactory.isPermissionActiveBatch([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

      expect(isActive).to.equal(false);

      const isActiveByName =
        await permissionFactory.isPermissionActiveByNameBatch([
          'pass.wallet.spend',
          'pass.purchase.additional',
        ]);

      expect(isActiveByName).to.equal(false);
    });

    it('should revert if no permissions are provided', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.isPermissionActiveBatch([]),
      ).to.be.revertedWith('No permissions provided');

      await expect(
        permissionFactory.isPermissionActiveByNameBatch([]),
      ).to.be.revertedWith('No permission names provided');
    });
  });

  describe('Default Permissions', () => {
    it('can add and remove default permissions', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      const newPermissionHash = hashPermissionId('test.permission');

      await expect(
        permissionFactory.createPermission('test.permission', 'test', false),
      )
        .to.emit(permissionFactory, 'PermissionCreated')
        .withArgs(newPermissionHash, 'test.permission', 'test', false);

      await expect(permissionFactory.addDefaultPermission(newPermissionHash))
        .to.emit(permissionFactory, 'DefaultPermissionAdded')
        .withArgs(newPermissionHash);

      expect(
        await permissionFactory.isDefaultPermission(newPermissionHash),
      ).to.equal(true);

      await expect(permissionFactory.removeDefaultPermission(newPermissionHash))
        .to.emit(permissionFactory, 'DefaultPermissionRemoved')
        .withArgs(newPermissionHash);

      expect(
        await permissionFactory.isDefaultPermission(newPermissionHash),
      ).to.equal(false);
    });

    it('revert if permission is not found', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.addDefaultPermission(
          hashPermissionId('test.permission'),
        ),
      ).to.be.revertedWith('Permission does not exist');

      await expect(
        permissionFactory.removeDefaultPermission(
          hashPermissionId('test.permission'),
        ),
      ).to.be.revertedWith('Permission does not exist');
    });

    it('revert if not owner', async () => {
      const { permissionFactory, otherAccount } = await loadFixture(
        deployPermissionFactory,
      );

      await expect(
        permissionFactory
          .connect(otherAccount)
          .addDefaultPermission(hashPermissionId('pass.wallet.spend')),
      ).to.be.revertedWithCustomError(
        permissionFactory,
        'OwnableUnauthorizedAccount',
      );

      await expect(
        permissionFactory
          .connect(otherAccount)
          .removeDefaultPermission(hashPermissionId('pass.wallet.spend')),
      ).to.be.revertedWithCustomError(
        permissionFactory,
        'OwnableUnauthorizedAccount',
      );
    });

    it('revert on add if permission is already a default permission', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.addDefaultPermission(
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.be.revertedWith('Permission already added');
    });

    it('revert on remove if valid permission is not a default permission', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await permissionFactory.createPermission(
        'test.permission',
        'test',
        false,
      );

      await expect(
        permissionFactory.removeDefaultPermission(
          hashPermissionId('test.permission'),
        ),
      ).to.be.revertedWith('Permission not added');
    });
  });
});
