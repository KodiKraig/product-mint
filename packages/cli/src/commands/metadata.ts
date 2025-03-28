import { PassMetadataProvider__factory } from '@product-mint/ethers-sdk';
import { Command } from 'commander';
import { provider, signerWallet } from '../provider';
import { getContractAddress } from '../contract-address';
import { waitTx } from '../utils/tx';

const passMetadataProvider = PassMetadataProvider__factory.connect(
  getContractAddress('passMetadataProvider'),
  provider,
);

export default function registerMetadataCommand(program: Command) {
  const metadataCommand = program
    .command('metadata')
    .description('Manage metadata for product passes and organizations');

  const passMetadataCommand = metadataCommand
    .command('pass')
    .description('Manage metadata for product passes');

  registerPassMetadataCommand(passMetadataCommand);
}

const registerPassMetadataCommand = (command: Command) => {
  const updateCommand = command
    .command('update')
    .description('Update metadata for a product pass');

  updateCommand
    .command('name')
    .description('Update the name of the product pass')
    .argument('organizationId', 'The id of the organization')
    .argument('name', 'The name of the product pass')
    .action(async (organizationId, name) => {
      await waitTx(
        passMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 0, name),
      );
    });
};
