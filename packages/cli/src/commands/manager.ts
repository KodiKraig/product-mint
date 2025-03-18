import { Command } from 'commander';
import { provider } from '../provider';
import { PurchaseManager__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../contract-address';
import { logEventHeading } from '../utils/events';

const purchaseManager = PurchaseManager__factory.connect(
  getContractAddress('purchaseManager'),
  provider,
);

export default function registerManagerCommand(program: Command): Command {
  const managerCommand = program
    .command('manager')
    .description('Purchase products and manage subscriptions');

  managerCommand
    .command('getTotalPassesMinted')
    .description(
      'Get the total number of Product Pass NFTs that have been minted',
    )
    .action(async () => {
      const totalPassesMinted = await purchaseManager.passSupply();
      console.log(`Total passes minted: ${totalPassesMinted}`);
    });

  const eventsCommand = managerCommand.command('events');

  eventsCommand
    .command('ProductsPurchased')
    .description('Emitted when product(s) are purchased')
    .action(async () => {
      const filter = purchaseManager.filters.ProductsPurchased();
      const events = await purchaseManager.queryFilter(filter);
      logEventHeading('ProductsPurchased', events.length);
      events.forEach((event) => {
        console.log(event);
      });
    });

  return managerCommand;
}
