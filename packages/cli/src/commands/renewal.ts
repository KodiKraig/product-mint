import {
  IRenewalProcessor,
  PurchaseManager__factory,
  RenewalProcessor__factory,
} from '@product-mint/ethers-sdk';
import { provider, signerWallet } from '../provider';
import { getContractAddress } from '../contract-address';
import { Command } from 'commander';
import { waitTx } from '../utils/tx';
import { parseCommaSeparatedList } from '../utils/parsing';

const renewalContract = RenewalProcessor__factory.connect(
  getContractAddress('renewalProcessor'),
  provider,
);

const purchaseManagerContract = PurchaseManager__factory.connect(
  getContractAddress('purchaseManager'),
  provider,
);

const parseStatus = (status: bigint) => {
  switch (status) {
    case 0n:
      return 'Success';
    case 1n:
      return 'Failed';
    case 2n:
      return 'Not Ready';
    case 3n:
      return 'Cancelled';
    case 4n:
      return 'Paused';
    case 5n:
      return 'Ready';
    default:
      return 'Unknown';
  }
};

export default function registerRenewalCommands(program: Command) {
  const renewalCommand = program
    .command('renewal')
    .description('Renewal processor commands');

  /**
   * Renew
   */

  renewalCommand
    .command('renew')
    .description('Renew a single product pass')
    .argument('<passId>', 'The token ID of the Product Pass NFT')
    .action(async (passId) => {
      await waitTx(
        renewalContract.connect(signerWallet).processAllPassRenewal(passId),
      );
    });

  renewalCommand
    .command('renewAll')
    .description('Renew all product passes')
    .action(async () => {
      const totalPasses = await purchaseManagerContract.passSupply();

      if (totalPasses === 0n) {
        console.log('No product passes found');
        return;
      }

      console.log(`Renewing ${totalPasses} product passes`);

      await waitTx(
        renewalContract
          .connect(signerWallet)
          .processAllPassRenewalBatch(
            Array.from({ length: Number(totalPasses) }, (_, i) => i + 1),
          ),
      );
    });

  /**
   * Status
   */

  renewalCommand
    .command('listStatus')
    .description('Get the renewal status for a single product pass')
    .argument('<passIds>', 'Comma separated list of pass IDs')
    .action(async (passIds) => {
      const statuses = await renewalContract.getAllPassRenewalStatusBatch(
        parseCommaSeparatedList<number>(passIds, 'number'),
      );

      outputRenewalStatusList(statuses);
    });

  renewalCommand
    .command('listStatusAll')
    .description('Get the renewal status for all product passes')
    .action(async () => {
      const totalPasses = await purchaseManagerContract.passSupply();

      const passIds = Array.from(
        { length: Number(totalPasses) },
        (_, i) => i + 1,
      );

      const statuses = await renewalContract.getAllPassRenewalStatusBatch(
        passIds,
      );

      outputRenewalStatusList(statuses);
    });

  registerEventsCommand(renewalCommand);
}

const registerEventsCommand = (program: Command) => {
  const eventsCommand = program
    .command('events')
    .description('Renewal events commands');

  eventsCommand
    .command('renewalProcessed')
    .description(
      'List all renewal statuses for all product passes and products',
    )
    .option('-o, --orgId <orgId>', 'Org ID to filter by')
    .option('-p, --passId <passId>', 'Pass ID to filter by')
    .option('-s, --status <status>', 'Status to filter by')
    .option('-f, --from <block>', 'From block', '0')
    .option('-t, --to <block>', 'To block', '0')
    .action(async (options) => {
      const { orgId, passId, status, from, to } = options;

      const filter = renewalContract.filters.RenewalProcessed(
        orgId ? parseInt(orgId) : undefined,
        passId ? parseInt(passId) : undefined,
        status ? parseInt(status) : undefined,
      );

      const events = await renewalContract.queryFilter(
        filter,
        from === '0' ? undefined : parseInt(from!),
        to === '0' ? undefined : parseInt(to!),
      );

      console.log(`Found ${events.length} renewal processed events`);

      for (const event of events) {
        console.log(`\nOrg ID: ${event.args.orgId}`);
        console.log(`Pass ID: ${event.args.productPassId}`);
        console.log(`Product ID: ${event.args.productId}`);
        console.log(`Status: ${parseStatus(event.args.status)}`);
      }
    });
};

const outputRenewalStatusList = (
  statuses: IRenewalProcessor.PassRenewalStatusStructOutput[][],
) => {
  console.log(`Renewal statuses for ${statuses.length} passes`);

  for (const status of statuses) {
    console.log('\n');
    for (const renewal of status) {
      outputRenewalStatus(renewal);
    }
  }
};

const outputRenewalStatus = (
  event: IRenewalProcessor.PassRenewalStatusStructOutput,
) => {
  console.log(`Org ID: ${event.subscription.orgId}`);
  console.log(`Pass ID: ${event.passId}`);
  console.log(`Product ID: ${event.productId}`);
  console.log(`Status: ${parseStatus(event.renewalStatus)}`);
};
