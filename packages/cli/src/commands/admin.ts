import { Command } from 'commander';
import { provider, signerWallet } from '../provider';
import { OrganizationAdmin__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../contract-address';
import { waitTx } from '../utils/tx';

const adminContract = OrganizationAdmin__factory.connect(
  getContractAddress('organizationAdmin'),
  provider,
);

export default function registerAdminCommand(program: Command) {
  const adminCommand = program
    .command('admin')
    .description(
      'Interact with the admin contract to manage organization administrators',
    );

  adminCommand
    .command('listAll')
    .description('List all admins for an organization')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const admins = await adminContract.getAdmins(organizationId);

      if (admins.length === 0) {
        console.log(`No admins found for organization ${organizationId}`);
        return;
      }

      console.log(
        `${admins.length} admins found for organization ${organizationId}:`,
      );
      for (const admin of admins) {
        console.log(`- ${admin}`);
      }
    });

  adminCommand
    .command('isAdmin')
    .description('Check if an address is an admin for an organization')
    .argument('<organizationId>', 'The organization ID')
    .argument('<adminAddress>', 'The admin address')
    .action(async (organizationId, adminAddress) => {
      const isAdmin = await adminContract.isAdmin(organizationId, adminAddress);
      console.log(`Organization ${organizationId}; Address ${adminAddress}`);
      console.log(`Is admin: ${isAdmin}`);
    });

  adminCommand
    .command('add')
    .description('Add an admin to an organization')
    .argument('<organizationId>', 'The organization ID')
    .argument('<adminAddress>', 'The admin address')
    .action(async (organizationId, adminAddress) => {
      await waitTx(
        adminContract
          .connect(signerWallet)
          .addAdmin(organizationId, adminAddress),
      );
    });

  adminCommand
    .command('remove')
    .description('Remove an admin from an organization')
    .argument('<organizationId>', 'The organization ID')
    .argument('<adminAddress>', 'The admin address')
    .action(async (organizationId, adminAddress) => {
      await waitTx(
        adminContract
          .connect(signerWallet)
          .removeAdmin(organizationId, adminAddress),
      );
    });
}
