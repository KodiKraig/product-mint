import { Command } from 'commander';
import { provider, signerWallet } from '../provider';
import { PurchaseManager__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../contract-address';
import { logEventHeading } from '../utils/events';
import { waitTx } from '../utils/tx';
import { parseCommaSeparatedList } from '../utils/parsing';

const purchaseManager = PurchaseManager__factory.connect(
  getContractAddress('purchaseManager'),
  provider,
);

export default function registerManagerCommand(program: Command): Command {
  const managerCommand = program
    .command('manager')
    .description('Purchase products and manage subscriptions');

  managerCommand
    .command('totalPassesMinted')
    .description(
      'Get the total number of Product Pass NFTs that have been minted',
    )
    .action(async () => {
      const totalPassesMinted = await purchaseManager.passSupply();
      console.log(`Total passes minted: ${totalPassesMinted}`);
    });

  managerCommand
    .command('changeUnitQuantity')
    .description('Change the unit quantity for a tiered subscription')
    .argument('<productPassId>', 'The product pass id')
    .argument('<productId>', 'The product id')
    .argument('<quantity>', 'The quantity to change to')
    .action(async (productPassId, productId, quantity) => {
      await waitTx(
        purchaseManager
          .connect(signerWallet)
          .changeTieredSubscriptionUnitQuantity(
            productPassId,
            productId,
            quantity,
            false,
          ),
      );
    });

  managerCommand
    .command('purchaseProducts')
    .description('Purchase products by minting a new Product Pass NFT')
    .argument('to', 'The address to mint the Product Pass NFT to')
    .argument(
      'organizationId',
      'The ID of the organization to purchase the products for',
    )
    .argument('productIds', 'Comma separated list of product IDs to purchase')
    .argument(
      'pricingIds',
      'Comma separated list of pricing IDs use for each product',
    )
    .argument(
      'quantities',
      'Comma separated list of quantities to purchase for each product. 0 if not using a tiered pricing model.',
    )
    .option(
      '-d, --discountIds [discountIds]',
      'Comma separated list of discount IDs to be minted onto the product pass',
      '',
    )
    .option(
      '-c, --couponCode [couponCode]',
      'The coupon code to apply to the purchase',
      '',
    )
    .option(
      '-a, --airdrop [airdrop]',
      'Whether to airdrop the products to the user. Only org admin can call this.',
      false,
    )
    .option(
      '-p, --pause [pause]',
      'Whether to pause any subscriptions that are purchased during the purchase. Must first be enabled by the org admin.',
      false,
    )
    .action(
      async (
        to,
        organizationId,
        productIds,
        pricingIds,
        quantities,
        options,
      ) => {
        const { airdrop, pause, couponCode, discountIds } = options;

        const productIdsArray = parseCommaSeparatedList<number>(
          productIds,
          'number',
        );
        const pricingIdsArray = parseCommaSeparatedList<number>(
          pricingIds,
          'number',
        );
        const quantitiesArray = parseCommaSeparatedList<number>(
          quantities,
          'number',
        );
        const discountIdsArray = discountIds
          ? parseCommaSeparatedList<number>(discountIds, 'number')
          : [];

        const params = {
          to,
          organizationId,
          productIds: productIdsArray,
          pricingIds: pricingIdsArray,
          quantities: quantitiesArray,
          discountIds: discountIdsArray,
          couponCode,
          airdrop,
          pause,
        };

        await waitTx(
          purchaseManager.connect(signerWallet).purchaseProducts(params),
        );
      },
    );

  registerEventsCommand(managerCommand);
  registerPauseCommands(managerCommand);

  return managerCommand;
}

const registerEventsCommand = (command: Command) => {
  const eventsCommand = command.command('events');

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
};

const registerPauseCommands = (command: Command) => {
  const pauseCommand = command
    .command('pausing')
    .description('Check manager pausing status and enable/disable pausing');

  pauseCommand
    .command('isPaused')
    .description('Check the pause status of the purchase manager')
    .action(async () => {
      const isPaused = await purchaseManager.paused();
      console.log(`Is paused: ${isPaused}`);
    });

  pauseCommand
    .command('enable')
    .description('Pause purchase manager')
    .action(async () => {
      await waitTx(purchaseManager.connect(signerWallet).pausePurchases());
    });

  pauseCommand
    .command('disable')
    .description('Unpause purchase manager')
    .action(async () => {
      await waitTx(purchaseManager.connect(signerWallet).unpausePurchases());
    });
};
