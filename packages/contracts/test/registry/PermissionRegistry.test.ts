import { expect } from 'chai';
import {
  loadWithDefaultProduct,
  loadWithPurchasedFlatRateSubscription,
} from '../manager/helpers';
import { hashPermissionId } from '../permission/helpers';
import hre from 'hardhat';
import { parseUnits } from 'ethers';
import calculateInterfaceId from '../../utils/calculate-interface-id';

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

    it('returns true for the IPermissionRegistry interface', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      const interfaceId = calculateInterfaceId([
        'ownerPermissionsSet(uint256,address)',
        'hasOwnerPermission(uint256,address,bytes32)',
        'hasOwnerPermissionBatch(uint256,address,bytes32[])',
        'getOwnerPermissions(uint256,address)',
        'getOwnerPermissionsBatch(uint256[],address[])',
        'addOwnerPermissions(uint256,bytes32[])',
        'removeOwnerPermissions(uint256,bytes32[])',
        'excludeDefaultPermissions(uint256)',
        'setExcludeDefaultPermissions(uint256,bool)',
        'getOrgPermissions(uint256)',
        'updateOrgPermissions(uint256,bytes32[],bool[])',
        'grantInitialOwnerPermissions(uint256,address)',
        'adminUpdateOwnerPermissions((address,uint256,bytes32[],bool)[])',
        'adminGrantInitialOwnerPermissions(uint256[])',
        'setPermissionFactory(address)',
      ]);

      expect(await permissionRegistry.supportsInterface(interfaceId)).to.be
        .true;
    });
  });

  describe('Has Owner Permission', () => {
    it('returns false if the permission is not set', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      expect(
        await permissionRegistry.hasOwnerPermission(
          1,
          owner,
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.be.false;
    });

    it('reverts if the permission does not exist', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.hasOwnerPermission(
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
        permissionRegistry.hasOwnerPermission(
          1,
          owner,
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.be.revertedWithCustomError(permissionRegistry, 'InactivePermission');
    });

    it('should return false if the org does not exist', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      expect(
        await permissionRegistry.hasOwnerPermission(
          0,
          owner,
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.equal(false);
    });
  });

  describe('Has Owner Permissions', () => {
    it('returns false when the permissions are not set', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      expect(
        await permissionRegistry.hasOwnerPermissionBatch(1, owner, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
        ]),
      ).to.deep.equal([false, false]);
    });

    it('returns true for the correct permissions when the permissions are set for the owner', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await permissionRegistry.addOwnerPermissions(1, [
        hashPermissionId('pass.wallet.spend'),
      ]);

      expect(
        await permissionRegistry.hasOwnerPermissionBatch(1, owner, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
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
        permissionRegistry.hasOwnerPermissionBatch(1, owner, [
          hashPermissionId('pass.wallet.spend'),
        ]),
      ).to.be.revertedWithCustomError(
        permissionRegistry,
        'InactivePermissionBatch',
      );
    });

    it('reverts if the permission does not exist', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.hasOwnerPermissionBatch(1, owner, [
          hashPermissionId('not a permission'),
        ]),
      )
        .to.be.revertedWithCustomError(
          permissionRegistry,
          'InactivePermissionBatch',
        )
        .withArgs([hashPermissionId('not a permission')]);
    });

    it('reverts if no permissions are provided', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.hasOwnerPermissionBatch(1, owner, []),
      ).to.be.revertedWith('No permissions provided');
    });
  });

  describe('Get Owner Permissions', () => {
    it('returns the correct permissions for the org for multiple owners', async () => {
      const { permissionRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      await permissionRegistry
        .connect(owner)
        .addOwnerPermissions(1, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.subscription.quantity'),
        ]);

      await permissionRegistry
        .connect(otherAccount)
        .addOwnerPermissions(1, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
        ]);

      expect(
        await permissionRegistry.getOwnerPermissions(1, owner),
      ).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.subscription.quantity'),
      ]);

      expect(
        await permissionRegistry.getOwnerPermissions(1, otherAccount),
      ).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

      expect(
        await permissionRegistry.getOwnerPermissionsBatch(
          [1, 1],
          [owner, otherAccount],
        ),
      ).to.deep.equal([
        [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.subscription.quantity'),
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

      expect(
        await permissionRegistry.getOwnerPermissions(0, owner),
      ).to.deep.equal([]);
      expect(
        await permissionRegistry.getOwnerPermissionsBatch(
          [0, 0],
          [owner, otherAccount],
        ),
      ).to.deep.equal([[], []]);
    });

    it('returns empty array if no permissions are set for the org and owner', async () => {
      const { permissionRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      expect(
        await permissionRegistry.getOwnerPermissions(1, owner),
      ).to.deep.equal([]);
      expect(
        await permissionRegistry.getOwnerPermissionsBatch(
          [1, 1],
          [owner, otherAccount],
        ),
      ).to.deep.equal([[], []]);
    });

    it('reverts if no orgIds are provided', async () => {
      const { permissionRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.getOwnerPermissionsBatch([], [owner, otherAccount]),
      ).to.be.revertedWith('No orgIds provided');
    });

    it('reverts if the orgIds and owners are not the same length', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.getOwnerPermissionsBatch([1, 1], [owner]),
      ).to.be.revertedWith('Invalid input length');
    });
  });

  describe('Add Owner Permissions', () => {
    it('can add valid permissions even with duplicates', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.addOwnerPermissions(1, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
          hashPermissionId('pass.purchase.additional'),
        ]),
      )
        .to.emit(permissionRegistry, 'OwnerPermissionsUpdated')
        .withArgs(1, owner, true, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
          hashPermissionId('pass.purchase.additional'),
        ]);

      expect(
        await permissionRegistry.hasOwnerPermission(
          1,
          owner,
          hashPermissionId('pass.wallet.spend'),
        ),
      ).to.be.true;

      expect(
        await permissionRegistry.hasOwnerPermissionBatch(1, owner, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
        ]),
      ).to.deep.equal([true, true]);

      const permissions = await permissionRegistry.getOwnerPermissions(
        1,
        owner,
      );
      expect(permissions).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);
    });

    it('reverts if the org does not exist', async () => {
      const { permissionRegistry, organizationNFT } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.addOwnerPermissions(0, [
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
        permissionRegistry.addOwnerPermissions(1, [
          hashPermissionId('not a permission'),
        ]),
      )
        .to.be.revertedWithCustomError(
          permissionRegistry,
          'InactivePermissionBatch',
        )
        .withArgs([hashPermissionId('not a permission')]);
    });

    it('reverts if the permission is not active', async () => {
      const { permissionRegistry, permissionFactory } =
        await loadWithDefaultProduct();

      await permissionFactory.setPermissionActive(
        hashPermissionId('pass.wallet.spend'),
        false,
      );

      await expect(
        permissionRegistry.addOwnerPermissions(1, [
          hashPermissionId('pass.wallet.spend'),
        ]),
      )
        .to.be.revertedWithCustomError(
          permissionRegistry,
          'InactivePermissionBatch',
        )
        .withArgs([hashPermissionId('pass.wallet.spend')]);
    });

    it('reverts if no permissions are provided', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.addOwnerPermissions(1, []),
      ).to.be.revertedWith('No permissions provided');
    });
  });

  describe('Remove Owner Permissions', () => {
    it('can remove the correct permissions when multiple permissions are set even with duplicates', async () => {
      const { permissionRegistry, owner } = await loadWithDefaultProduct();

      await permissionRegistry.addOwnerPermissions(1, [
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

      expect(
        await permissionRegistry.getOwnerPermissions(1, owner),
      ).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

      await expect(
        permissionRegistry.removeOwnerPermissions(1, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.wallet.spend'),
        ]),
      )
        .to.emit(permissionRegistry, 'OwnerPermissionsUpdated')
        .withArgs(1, owner, false, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.wallet.spend'),
        ]);

      expect(
        await permissionRegistry.getOwnerPermissions(1, owner),
      ).to.deep.equal([hashPermissionId('pass.purchase.additional')]);
    });

    it('reverts if the org does not exist', async () => {
      const { permissionRegistry, organizationNFT } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.removeOwnerPermissions(0, [
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
        permissionRegistry.removeOwnerPermissions(1, []),
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

  describe('Set Exclude Default Permissions', () => {
    it('can set the exclude default permissions', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      expect(await permissionRegistry.excludeDefaultPermissions(1)).to.be.false;

      await expect(permissionRegistry.setExcludeDefaultPermissions(1, true))
        .to.emit(permissionRegistry, 'ExcludeDefaultPermissionsUpdated')
        .withArgs(1, true);

      expect(await permissionRegistry.excludeDefaultPermissions(1)).to.be.true;

      await expect(permissionRegistry.setExcludeDefaultPermissions(1, false))
        .to.emit(permissionRegistry, 'ExcludeDefaultPermissionsUpdated')
        .withArgs(1, false);

      expect(await permissionRegistry.excludeDefaultPermissions(1)).to.be.false;
    });

    it('reverts if the org does not exist', async () => {
      const { permissionRegistry, organizationNFT } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.setExcludeDefaultPermissions(0, true),
      ).to.be.revertedWithCustomError(
        organizationNFT,
        'ERC721NonexistentToken',
      );
    });

    it('reverts if the caller is not the org admin', async () => {
      const { permissionRegistry, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry
          .connect(otherAccount)
          .setExcludeDefaultPermissions(1, true),
      ).to.be.revertedWith('Not an admin of the organization');
    });
  });

  describe('Update Org Permissions', () => {
    it('can update the org permissions with custom permissions', async () => {
      const { permissionRegistry, permissionFactory } =
        await loadWithDefaultProduct();

      await permissionFactory.createPermission(
        'custom.permission',
        'Custom permission',
        false,
      );

      await expect(
        permissionRegistry.updateOrgPermissions(
          1,
          [
            hashPermissionId('pass.wallet.spend'),
            hashPermissionId('custom.permission'),
          ],
          [true, true],
        ),
      )
        .to.emit(permissionRegistry, 'OrgPermissionUpdated')
        .withArgs(1, hashPermissionId('pass.wallet.spend'), true)
        .and.to.emit(permissionRegistry, 'OrgPermissionUpdated')
        .withArgs(1, hashPermissionId('custom.permission'), true);

      let permissions = await permissionRegistry.getOrgPermissions(1);
      expect(permissions).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('custom.permission'),
      ]);

      await expect(
        permissionRegistry.updateOrgPermissions(
          1,
          [hashPermissionId('pass.wallet.spend')],
          [false],
        ),
      )
        .to.emit(permissionRegistry, 'OrgPermissionUpdated')
        .withArgs(1, hashPermissionId('pass.wallet.spend'), false);

      permissions = await permissionRegistry.getOrgPermissions(1);
      expect(permissions).to.deep.equal([
        hashPermissionId('custom.permission'),
      ]);
    });

    it('reverts if the org does not exist', async () => {
      const { permissionRegistry, organizationNFT } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.updateOrgPermissions(0, [], [true]),
      ).to.be.revertedWithCustomError(
        organizationNFT,
        'ERC721NonexistentToken',
      );
    });

    it('reverts if the caller is not the org admin', async () => {
      const { permissionRegistry, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry
          .connect(otherAccount)
          .updateOrgPermissions(1, [], [true]),
      ).to.be.revertedWith('Not an admin of the organization');
    });

    it('reverts if the permissions are not active', async () => {
      const { permissionRegistry, permissionFactory } =
        await loadWithDefaultProduct();

      await permissionFactory.setPermissionActive(
        hashPermissionId('pass.wallet.spend'),
        false,
      );

      await expect(
        permissionRegistry.updateOrgPermissions(
          1,
          [hashPermissionId('pass.wallet.spend')],
          [true],
        ),
      )
        .to.be.revertedWithCustomError(
          permissionRegistry,
          'InactivePermissionBatch',
        )
        .withArgs([hashPermissionId('pass.wallet.spend')]);
    });

    it('reverts if no permissions are provided', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.updateOrgPermissions(1, [], [true]),
      ).to.be.revertedWith('No permissions provided');
    });

    it('reverts if the permissions and add array are not the same length', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.updateOrgPermissions(
          1,
          [hashPermissionId('pass.wallet.spend')],
          [true, false],
        ),
      ).to.be.revertedWith('Invalid input length');
    });
  });

  describe('Set Initial Owner Permissions', () => {
    it('revert if not called by the purchase manager', async () => {
      const { permissionRegistry, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.grantInitialOwnerPermissions(1, otherAccount),
      ).to.be.revertedWith('Caller not authorized');
    });
  });

  describe('Admin Update Owner Permissions', () => {
    it('can update the owner permissions', async () => {
      const { permissionRegistry, owner, otherAccount } =
        await loadWithDefaultProduct();

      // Add permissions to the owner
      await expect(
        permissionRegistry.adminUpdateOwnerPermissions([
          {
            owner,
            orgId: 1,
            permissions: [
              hashPermissionId('pass.wallet.spend'),
              hashPermissionId('pass.purchase.additional'),
            ],
            grantAccess: true,
          },
          {
            owner: otherAccount,
            orgId: 1,
            permissions: [hashPermissionId('pass.wallet.spend')],
            grantAccess: true,
          },
        ]),
      )
        .to.emit(permissionRegistry, 'OwnerPermissionsUpdated')
        .withArgs(1, owner, true, [
          hashPermissionId('pass.wallet.spend'),
          hashPermissionId('pass.purchase.additional'),
        ])
        .and.to.emit(permissionRegistry, 'OwnerPermissionsUpdated')
        .withArgs(1, otherAccount, true, [
          hashPermissionId('pass.wallet.spend'),
        ]);

      let ownerPermissions = await permissionRegistry.getOwnerPermissions(
        1,
        owner,
      );
      expect(ownerPermissions).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
      ]);

      let otherAccountPermissions =
        await permissionRegistry.getOwnerPermissions(1, otherAccount);
      expect(otherAccountPermissions).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
      ]);

      // Remove permissions from the owner
      await expect(
        permissionRegistry.adminUpdateOwnerPermissions([
          {
            owner,
            orgId: 1,
            permissions: [hashPermissionId('pass.wallet.spend')],
            grantAccess: false,
          },
          {
            owner: otherAccount,
            orgId: 1,
            permissions: [hashPermissionId('pass.wallet.spend')],
            grantAccess: false,
          },
        ]),
      )
        .to.emit(permissionRegistry, 'OwnerPermissionsUpdated')
        .withArgs(1, owner, false, [hashPermissionId('pass.wallet.spend')])
        .and.to.emit(permissionRegistry, 'OwnerPermissionsUpdated')
        .withArgs(1, otherAccount, false, [
          hashPermissionId('pass.wallet.spend'),
        ]);

      ownerPermissions = await permissionRegistry.getOwnerPermissions(1, owner);
      expect(ownerPermissions).to.deep.equal([
        hashPermissionId('pass.purchase.additional'),
      ]);

      otherAccountPermissions = await permissionRegistry.getOwnerPermissions(
        1,
        otherAccount,
      );
      expect(otherAccountPermissions).to.deep.equal([]);
    });

    it('revert if not called by the owner', async () => {
      const { permissionRegistry, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.connect(otherAccount).adminUpdateOwnerPermissions([
          {
            owner: otherAccount,
            orgId: 1,
            permissions: [],
            grantAccess: true,
          },
        ]),
      ).to.be.revertedWithCustomError(
        permissionRegistry,
        'OwnableUnauthorizedAccount',
      );
    });

    it('revert if no params are provided', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.adminUpdateOwnerPermissions([]),
      ).to.be.revertedWith('No params provided');
    });
  });

  describe('Admin Grant Initial Owner Permissions', () => {
    it('default permissions are not re granted after the initial product pass mint for the org', async () => {
      const { permissionRegistry, otherAccount } =
        await loadWithPurchasedFlatRateSubscription();

      expect(await permissionRegistry.excludeDefaultPermissions(1)).to.be.false;
      expect(await permissionRegistry.ownerPermissionsSet(1, otherAccount)).to
        .be.true;

      // Ensure the default permissions are set from mint
      const currentPermissions = await permissionRegistry.getOwnerPermissions(
        1,
        otherAccount,
      );
      expect(currentPermissions).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
        hashPermissionId('pass.subscription.renewal'),
        hashPermissionId('pass.subscription.pricing'),
        hashPermissionId('pass.subscription.quantity'),
      ]);

      // Remove one of the default permissions
      await permissionRegistry
        .connect(otherAccount)
        .removeOwnerPermissions(1, [
          hashPermissionId('pass.subscription.renewal'),
        ]);

      // Grant permissions again
      await expect(
        permissionRegistry.adminGrantInitialOwnerPermissions([1]),
      ).to.not.emit(permissionRegistry, 'OwnerPermissionsUpdated');

      // Ensure the default permissions are not re granted
      const newPermissions = await permissionRegistry.getOwnerPermissions(
        1,
        otherAccount,
      );
      expect(newPermissions).to.deep.equal([
        hashPermissionId('pass.wallet.spend'),
        hashPermissionId('pass.purchase.additional'),
        hashPermissionId('pass.subscription.quantity'),
        hashPermissionId('pass.subscription.pricing'),
      ]);
    });

    it('can still mint a product pass even if the org has excluded default permissions when setting the initial owner permissions', async () => {
      const {
        permissionRegistry,
        otherAccount2,
        paymentEscrow,
        mintToken,
        purchaseManager,
      } = await loadWithPurchasedFlatRateSubscription();

      // Default permissions
      await permissionRegistry.setExcludeDefaultPermissions(1, true);

      await mintToken
        .connect(otherAccount2)
        .mint(otherAccount2, parseUnits('100', 6));
      await mintToken
        .connect(otherAccount2)
        .approve(await paymentEscrow.getAddress(), parseUnits('100', 6));

      await expect(
        purchaseManager.connect(otherAccount2).purchaseProducts({
          to: otherAccount2,
          organizationId: 1,
          productIds: [1],
          pricingIds: [1],
          quantities: [0],
          discountIds: [],
          couponCode: '',
          airdrop: false,
          pause: false,
        }),
      ).to.not.emit(permissionRegistry, 'OwnerPermissionsUpdated');

      expect(
        await permissionRegistry.getOwnerPermissions(1, otherAccount2),
      ).to.deep.equal([]);
      expect(await permissionRegistry.ownerPermissionsSet(1, otherAccount2)).to
        .be.true;
    });

    it('revert if not called by the owner', async () => {
      const { permissionRegistry, otherAccount } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry
          .connect(otherAccount)
          .adminGrantInitialOwnerPermissions([1]),
      ).to.be.revertedWithCustomError(
        permissionRegistry,
        'OwnableUnauthorizedAccount',
      );
    });

    it('revert if no passIds are provided', async () => {
      const { permissionRegistry } = await loadWithDefaultProduct();

      await expect(
        permissionRegistry.adminGrantInitialOwnerPermissions([]),
      ).to.be.revertedWith('No passIds provided');
    });

    it('revert if the passId does not exist', async () => {
      const { permissionRegistry, organizationNFT } =
        await loadWithDefaultProduct();

      await expect(
        permissionRegistry.adminGrantInitialOwnerPermissions([0]),
      ).to.be.revertedWithCustomError(
        organizationNFT,
        'ERC721NonexistentToken',
      );
    });
  });
});
