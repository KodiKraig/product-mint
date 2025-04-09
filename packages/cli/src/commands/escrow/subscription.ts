import { SubscriptionEscrow__factory } from '@product-mint/ethers-sdk';
import { Command } from 'commander';
import { getContractAddress } from '../../contract-address';
import { provider, signerWallet } from '../../provider';
import { waitTx } from '../../utils/tx';
import { parseBooleanValue } from '../../utils/parsing';

const subEscrow = SubscriptionEscrow__factory.connect(
  getContractAddress('subscriptionEscrow'),
  provider,
);

export default function registerSubscriptionCommands(program: Command) {
  const subscription = program
    .command('subscription')
    .description('Manage subscriptions');

  // Owner can change pricing

  subscription
    .command('canOwnerChangePricing')
    .description('Check if the owner can change the subscription')
    .argument('<orgId>', 'The organization id')
    .action(async (orgId) => {
      const result = await subEscrow.ownerChangePricing(orgId);
      console.log(`Can owner change subscription: ${result}`);
    });

  subscription
    .command('setOwnerChangePricing')
    .description('Set the owner change pricing')
    .argument('<orgId>', 'The organization id')
    .argument('<canChange>', 'The can change value')
    .action(async (orgId, canChange) => {
      await waitTx(
        subEscrow
          .connect(signerWallet)
          .setOwnerChangePricing(orgId, parseBooleanValue(canChange)!),
      );
    });

  registerEvents(subscription);
}

const registerEvents = async (command: Command) => {
  const events = command
    .command('events')
    .description('Query subscription related events');

  events
    .command('cycleUpdated')
    .description('Emitted when a subscription cycle is updated')
    .option('-o, --orgId <orgId>', 'The organization id')
    .option('-p, --productPassId <productPassId>', 'The product pass id')
    .action(async (options) => {
      const { productPassId, orgId } = options;

      const events = await subEscrow.queryFilter(
        subEscrow.filters.SubscriptionCycleUpdated(orgId, productPassId),
      );

      const parseSubStatus = (status: bigint) => {
        switch (status) {
          case 0n:
            return 'Active';
          case 1n:
            return 'Cancelled';
          case 2n:
            return 'Past Due';
          case 3n:
            return 'Paused';
          default:
            return 'Unknown';
        }
      };

      const parseDate = (date: bigint) => {
        return new Date(Number(date) * 1000);
      };

      if (events.length === 0) {
        console.log('No events found');
        return;
      }

      for (const event of events) {
        console.log(`\nOrganization ID: ${event.args.organizationId}`);
        console.log(`Product Pass ID: ${event.args.productPassId}`);
        console.log(`Product ID: ${event.args.productId}`);
        console.log(
          `Status: ${event.args.status} (${parseSubStatus(event.args.status)})`,
        );
        console.log(
          `Start Date: ${event.args.startDate} (${parseDate(
            event.args.startDate,
          )})`,
        );
        console.log(
          `End Date: ${event.args.endDate} (${parseDate(event.args.endDate)})`,
        );
      }
    });
};
