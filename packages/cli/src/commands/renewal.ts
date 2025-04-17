import {
  PurchaseManager__factory,
  RenewalProcessor__factory,
} from '@product-mint/ethers-sdk';
import { provider, signerWallet } from '../provider';
import { getContractAddress } from '../contract-address';
import { Command } from 'commander';
import { waitTx } from '../utils/tx';

const renewalContract = RenewalProcessor__factory.connect(
  getContractAddress('renewalProcessor'),
  provider,
);

const purchaseManagerContract = PurchaseManager__factory.connect(
  getContractAddress('purchaseManager'),
  provider,
);

export default function registerRenewalCommands(program: Command) {
  const renewalCommand = program
    .command('renewal')
    .description('Renewal processor commands');

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
          .processAllPassRenewalBatch(1n, totalPasses),
      );
    });

  registerEventsCommand(renewalCommand);
}

const registerEventsCommand = (program: Command) => {
  const eventsCommand = program
    .command('events')
    .description('Renewal events commands');

  eventsCommand
    .command('renewalProcessed')
    .description('Renewal processed events')
    .option('-f, --from <block>', 'From block', '0')
    .option('-t, --to <block>', 'To block', '0')
    .action(async (options) => {
      const { from, to } = options;
      const filter = renewalContract.filters.RenewalProcessed;
      const events = await renewalContract.queryFilter(
        filter,
        from === '0' ? undefined : parseInt(from!),
        to === '0' ? undefined : parseInt(to!),
      );

      if (events.length === 0) {
        console.log('No renewal processed events found');
        return;
      }

      console.log(`Found ${events.length} renewal processed events`);

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

      for (const event of events) {
        console.log(`\nOrg ID: ${event.args.orgId}`);
        console.log(`Product Pass ID: ${event.args.productPassId}`);
        console.log(`Product ID: ${event.args.productId}`);
        console.log(`Status: ${parseStatus(event.args.status)}`);
      }
    });
};
