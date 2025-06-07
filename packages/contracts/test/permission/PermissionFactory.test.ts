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
        'createPermission(string,string)',
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

    it('should deploy the permission factory with core permissions', async () => {
      const { permissionFactory, deploymentTimestamp } = await loadFixture(
        deployPermissionFactory,
      );

      expect(await permissionFactory.getAddress()).to.not.be.undefined;

      const allPermissionIds = await permissionFactory.getAllPermissionIds();
      expect(allPermissionIds.length).to.equal(6);
      expect(allPermissionIds).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.mint'),
        hashPermissionId('pass.purchase.additional'),
        hashPermissionId('pass.subscription.renewal'),
        hashPermissionId('pass.subscription.pricing'),
        hashPermissionId('pass.subscription.quantity'),
      ]);

      const allPermissions = await permissionFactory.getAllPermissions();
      expect(allPermissions.length).to.equal(6);

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
          name: 'pass.purchase.mint',
          description: 'Mint a new Product Pass NFT',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[2],
        expected: {
          name: 'pass.purchase.additional',
          description: 'Purchase additional products',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[3],
        expected: {
          name: 'pass.subscription.renewal',
          description: 'Automatically renew expired subscriptions',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[4],
        expected: {
          name: 'pass.subscription.pricing',
          description: 'Update or downgrade the pricing for a subscription',
          isActive: true,
          createdAt: deploymentTimestamp!,
        },
      });
      assertPermission({
        test: allPermissions[5],
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
    it('should create a new permission', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.createPermission('test.permission', 'test'),
      )
        .to.emit(permissionFactory, 'PermissionCreated')
        .withArgs(
          hashPermissionId('test.permission'),
          'test.permission',
          'test',
        );

      const allPermissionIds = await permissionFactory.getAllPermissionIds();
      expect(allPermissionIds.length).to.equal(7);
      expect(allPermissionIds).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.mint'),
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
    });

    it('revert if no name is provided', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.createPermission('', 'test'),
      ).to.be.revertedWith('Name cannot be empty');
    });

    it('revert if permission name already exists', async () => {
      const { permissionFactory } = await loadFixture(deployPermissionFactory);

      await expect(
        permissionFactory.createPermission('pass.wallet.spend', 'test'),
      ).to.be.revertedWith('Permission name already exists');
    });

    it('revert if not owner', async () => {
      const { permissionFactory, otherAccount } = await loadFixture(
        deployPermissionFactory,
      );

      await expect(
        permissionFactory
          .connect(otherAccount)
          .createPermission('test.permission', 'test'),
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

    describe('Get Permission Batch', () => {
      it('should get a batch of permissions by ID', async () => {
        const { permissionFactory } = await loadFixture(
          deployPermissionFactory,
        );

        const permissions = await permissionFactory.getPermissionBatch([
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.mint'),
        ]);

        expect(permissions.length).to.equal(2);
        expect(permissions[0].name).to.equal('pass.wallet.spend');
        expect(permissions[1].name).to.equal('pass.purchase.mint');
      });

      it('should revert if permission does not exist', async () => {
        const { permissionFactory } = await loadFixture(
          deployPermissionFactory,
        );

        await expect(
          permissionFactory.getPermissionBatch([
            hashPermissionId('pass.wallet.spend'),
            hashPermissionId('pass.purchase.mint'),
            hashPermissionId('test.permission'),
          ]),
        ).to.be.revertedWith('Permission does not exist');
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

      describe('Get Permission By Name Batch', () => {
        it('should get a batch of permissions by name', async () => {
          const { permissionFactory } = await loadFixture(
            deployPermissionFactory,
          );

          const permissions = await permissionFactory.getPermissionByNameBatch([
            'pass.wallet.spend',
            'pass.purchase.mint',
          ]);

          expect(permissions.length).to.equal(2);
          expect(permissions[0].name).to.equal('pass.wallet.spend');
          expect(permissions[1].name).to.equal('pass.purchase.mint');

          it('should revert if permission does not exist', async () => {
            const { permissionFactory } = await loadFixture(
              deployPermissionFactory,
            );

            await expect(
              permissionFactory.getPermissionByNameBatch([
                'pass.wallet.spend',
                'pass.purchase.mint',
                'test.permission',
              ]),
            ).to.be.revertedWith('Permission does not exist');
          });
        });

        describe('Is Permission Active', () => {
          it('should return true if permission is active', async () => {
            const { permissionFactory } = await loadFixture(
              deployPermissionFactory,
            );

            const isActive = await permissionFactory.isPermissionActive(
              hashPermissionId('pass.wallet.spend'),
            );
            expect(isActive).to.equal(true);

            const isActiveByName =
              await permissionFactory.isPermissionActiveByName(
                'pass.wallet.spend',
              );
            expect(isActiveByName).to.equal(true);
          });

          it('should return false if permission is not active', async () => {
            const { permissionFactory } = await loadFixture(
              deployPermissionFactory,
            );

            await permissionFactory.setPermissionActive(
              hashPermissionId('pass.wallet.spend'),
              false,
            );

            const isActive = await permissionFactory.isPermissionActive(
              hashPermissionId('pass.wallet.spend'),
            );
            expect(isActive).to.equal(false);

            const isActiveByName =
              await permissionFactory.isPermissionActiveByName(
                'pass.wallet.spend',
              );
            expect(isActiveByName).to.equal(false);
          });
        });
      });

      describe('Is Permission Active Batch', () => {
        it('should return a batch of active statuses', async () => {
          const { permissionFactory } = await loadFixture(
            deployPermissionFactory,
          );

          const isActive = await permissionFactory.isPermissionActiveBatch([
            hashPermissionId('pass.wallet.spend'),
            hashPermissionId('pass.purchase.mint'),
          ]);

          expect(isActive.length).to.equal(2);
          expect(isActive[0]).to.equal(true);
          expect(isActive[1]).to.equal(true);

          const isActiveByName =
            await permissionFactory.isPermissionActiveByNameBatch([
              'pass.wallet.spend',
              'pass.purchase.mint',
            ]);

          expect(isActiveByName.length).to.equal(2);
          expect(isActiveByName[0]).to.equal(true);
          expect(isActiveByName[1]).to.equal(true);
        });

        it('should return false if permission is not active', async () => {
          const { permissionFactory } = await loadFixture(
            deployPermissionFactory,
          );

          await permissionFactory.setPermissionActive(
            hashPermissionId('pass.wallet.spend'),
            false,
          );

          const isActive = await permissionFactory.isPermissionActiveBatch([
            hashPermissionId('pass.wallet.spend'),
            hashPermissionId('pass.purchase.mint'),
          ]);

          expect(isActive.length).to.equal(2);
          expect(isActive[0]).to.equal(false);
          expect(isActive[1]).to.equal(true);

          const isActiveByName =
            await permissionFactory.isPermissionActiveByNameBatch([
              'pass.wallet.spend',
              'pass.purchase.mint',
            ]);

          expect(isActiveByName.length).to.equal(2);
          expect(isActiveByName[0]).to.equal(false);
          expect(isActiveByName[1]).to.equal(true);
        });
      });
    });
  });
});
