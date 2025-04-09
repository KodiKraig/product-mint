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
    .description(
      'Update metadata for a product pass. Metadata is OpenSea compatible.',
    );

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

  updateCommand
    .command('description')
    .description('Update the description of the product pass')
    .argument('organizationId', 'The id of the organization')
    .argument('description', 'The description of the product pass')
    .action(async (organizationId, description) => {
      await waitTx(
        passMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 1, description),
      );
    });

  updateCommand
    .command('externalUrl')
    .description('Update the external URL of the product pass')
    .argument('organizationId', 'The id of the organization')
    .argument('externalUrl', 'The external URL of the product pass')
    .action(async (organizationId, externalUrl) => {
      await waitTx(
        passMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 2, externalUrl),
      );
    });

  updateCommand
    .command('image')
    .description('Update the image of the product pass')
    .argument('organizationId', 'The id of the organization')
    .argument('image', 'The image of the product pass')
    .action(async (organizationId, image) => {
      await waitTx(
        passMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 3, image),
      );
    });

  updateCommand
    .command('backgroundColor')
    .description('Update the background color of the product pass')
    .argument('organizationId', 'The id of the organization')
    .argument(
      'backgroundColor',
      'The background color of the product pass. 6 character hex code with no leading #.',
    )
    .action(async (organizationId, backgroundColor) => {
      await waitTx(
        passMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 4, backgroundColor),
      );
    });

  updateCommand
    .command('animationUrl')
    .description('Update the animation URL of the product pass')
    .argument('organizationId', 'The id of the organization')
    .argument('animationUrl', 'The animation URL of the product pass')
    .action(async (organizationId, animationUrl) => {
      await waitTx(
        passMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 5, animationUrl),
      );
    });
};
