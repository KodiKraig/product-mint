import {
  OrganizationMetadataProvider__factory,
  PassMetadataProviderV2__factory,
} from '@product-mint/ethers-sdk';
import { Command } from 'commander';
import { provider, signerWallet } from '../provider';
import { getContractAddress } from '../contract-address';
import { waitTx } from '../utils/tx';

const passMetadataProvider = PassMetadataProviderV2__factory.connect(
  getContractAddress('passMetadataProvider'),
  provider,
);

const organizationMetadataProvider =
  OrganizationMetadataProvider__factory.connect(
    getContractAddress('organizationMetadataProvider'),
    provider,
  );

export default function registerMetadataCommand(program: Command) {
  const metadataCommand = program
    .command('metadata')
    .description('Manage metadata for product passes and organizations');

  // Product Pass

  const passMetadataCommand = metadataCommand
    .command('pass')
    .description('Manage metadata for product passes');

  const defaultPassMetadataCommand = metadataCommand
    .command('defaultPass')
    .description('Manage the default metadata for product passes (team only)');

  registerPassMetadataCommand(passMetadataCommand);
  registerDefaultPassMetadataCommand(defaultPassMetadataCommand);

  // Organization

  const organizationMetadataCommand = metadataCommand
    .command('organization')
    .description('Manage metadata for organizations');

  const defaultOrganizationMetadataCommand = metadataCommand
    .command('defaultOrg')
    .description('Manage the default metadata for organizations (team only)');

  registerOrganizationMetadataCommand(organizationMetadataCommand);
  registerDefaultOrganizationMetadataCommand(
    defaultOrganizationMetadataCommand,
  );
}

// Organization

const registerOrganizationMetadataCommand = (command: Command) => {
  // List

  command
    .command('list')
    .description('List the metadata for an organization')
    .argument('organizationId', 'The id of the organization')
    .action(async (organizationId) => {
      const organizationMetadata =
        await organizationMetadataProvider.getCustomMetadata(organizationId);

      outputMetadata(organizationMetadata);
    });

  // Update

  const updateCommand = command
    .command('update')
    .description('Update the metadata for an organization');

  updateCommand
    .command('name')
    .description('Update the name of the organization')
    .argument('organizationId', 'The id of the organization')
    .argument('name', 'The name of the organization')
    .action(async (organizationId, name) => {
      await waitTx(
        organizationMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 0, name),
      );
    });

  updateCommand
    .command('description')
    .description('Update the description of the organization')
    .argument('organizationId', 'The id of the organization')
    .argument('description', 'The description of the organization')
    .action(async (organizationId, description) => {
      await waitTx(
        organizationMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 1, description),
      );
    });

  updateCommand
    .command('externalUrl')
    .argument('organizationId', 'The id of the organization')
    .argument('externalUrl', 'The external URL of the organization')
    .action(async (organizationId, externalUrl) => {
      await waitTx(
        organizationMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 2, externalUrl),
      );
    });

  updateCommand
    .command('image')
    .description('Update the image of the organization')
    .argument('organizationId', 'The id of the organization')
    .argument('image', 'The image of the organization')
    .action(async (organizationId, image) => {
      await waitTx(
        organizationMetadataProvider
          .connect(signerWallet)
          .setCustomMetadataField(organizationId, 3, image),
      );
    });
};

const registerDefaultOrganizationMetadataCommand = (command: Command) => {
  command
    .command('list')
    .description('List the default metadata for organizations (team only)')
    .action(async () => {
      const defaultOrganizationMetadata =
        await organizationMetadataProvider.getDefaultMetadata();

      outputMetadata(defaultOrganizationMetadata);
    });

  // Update

  const updateCommand = command
    .command('update')
    .description('Update the default metadata for organizations (team only)');

  updateCommand
    .command('image')
    .description('Update the image of the organization')
    .argument('image', 'The image of the organization')
    .action(async (image) => {
      await waitTx(
        organizationMetadataProvider
          .connect(signerWallet)
          .setDefaultMetadataField(3, image),
      );
    });
};

// Product Pass

const registerDefaultPassMetadataCommand = (command: Command) => {
  command
    .command('list')
    .description('List the default metadata for product passes (team only)')
    .action(async () => {
      const defaultPassMetadata =
        await passMetadataProvider.getDefaultMetadata();

      outputMetadata(defaultPassMetadata);
    });

  // Update

  const updateCommand = command
    .command('update')
    .description('Update the default metadata for product passes (team only)');

  updateCommand
    .command('image')
    .description('Update the image of the product pass')
    .argument('image', 'The image of the product pass')
    .action(async (image) => {
      await waitTx(
        passMetadataProvider
          .connect(signerWallet)
          .setDefaultMetadataField(3, image),
      );
    });
};

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

// Helpers

type Metadata = {
  name: string;
  description: string;
  externalUrl: string;
  image: string;
  backgroundColor: string;
  animationUrl: string;
};

const outputMetadata = (metadata: Metadata) => {
  console.log(`Name: ${metadata.name}`);
  console.log(`Description: ${metadata.description}`);
  console.log(`External URL: ${metadata.externalUrl}`);
  console.log(`Image: ${metadata.image}`);
  console.log(`Background Color: ${metadata.backgroundColor}`);
  console.log(`Animation URL: ${metadata.animationUrl}`);
};
