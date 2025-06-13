import {
  PermissionFactory__factory,
  PermissionRegistry__factory,
  PurchaseManager__factory,
} from '@product-mint/ethers-sdk';
import { Command } from 'commander';
import { getContractAddress } from '../../contract-address';
import { provider, signerWallet } from '../../provider';
import { parseOnChainDate } from '../../utils/parsing';
import { waitTx } from '../../utils/tx';

const factory = PermissionFactory__factory.connect(
  getContractAddress('permissionFactory'),
  provider,
);

const registry = PermissionRegistry__factory.connect(
  getContractAddress('permissionRegistry'),
  provider,
);

const manager = PurchaseManager__factory.connect(
  getContractAddress('purchaseManager'),
  provider,
);

export default function registerPermissionCommand(program: Command) {
  const permission = program
    .command('permission')
    .description('Manage permissions for pass owners and organizations');

  permission
    .command('listAll')
    .description('List all available permissions')
    .action(async () => {
      const permissions = await factory.getAllPermissions();

      console.log(`______ ${permissions.length} permissions found ______`);

      for (const permission of permissions) {
        console.log(`\nID: ${permission.id}`);
        console.log(`Name: ${permission.name}`);
        console.log(`Description: ${permission.description}`);
        console.log(`Is Active: ${permission.isActive}`);
        console.log(
          `Created At: ${permission.createdAt} (${parseOnChainDate(
            permission.createdAt,
          )?.toLocaleString()})`,
        );
      }
    });

  permission
    .command('listOwner')
    .description('List all permissions granted for an owner')
    .argument('<orgId>', 'The organization ID')
    .argument('<owner>', 'The owner address')
    .action(async (orgId, owner) => {
      const permissions = await registry.getOwnerPermissions(orgId, owner);

      console.log(`______ ${permissions.length} permissions found ______`);

      for (const permission of permissions) {
        console.log(`\nID: ${permission}`);
      }
    });

  registerAdminCommands(permission);
}

const registerAdminCommands = (command: Command) => {
  const adminCommand = command
    .command('admin')
    .description('Access to admin functions');

  adminCommand
    .command('grantPermissionsForAllPasses')
    .description('Grant initial permissions to all current pass owners')
    .action(async () => {
      const passSupply = await manager.passSupply();

      console.log(`______ ${passSupply} passes found ______`);

      if (passSupply === 0n) {
        console.log('No passes found');
        return;
      }

      const passIds = Array.from({ length: Number(passSupply) }, (_, i) =>
        BigInt(i + 1),
      );

      console.log(`Granting permissions for ${passIds.length} passes...`);
      console.log(`Pass IDs: ${passIds.join(', ')}`);

      await waitTx(
        registry
          .connect(signerWallet)
          .adminGrantInitialOwnerPermissions(passIds),
      );
    });
};
