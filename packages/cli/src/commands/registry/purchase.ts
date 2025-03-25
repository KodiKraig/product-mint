import { Command } from 'commander';
import { PurchaseRegistry__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../../contract-address';
import { signerWallet } from '../../provider';
import { waitTx } from '../../utils/tx';
import {
  parseBooleanValue,
  parseCommaSeparatedList,
} from '../../utils/parsing';

const purchaseRegistry = PurchaseRegistry__factory.connect(
  getContractAddress('purchaseRegistry'),
  signerWallet,
);

export default function registerPurchaseCommand(program: Command) {
  const purchaseCommand = program
    .command('purchase')
    .description('Manage purchase related operations');

  /**
   * Pass Ownership
   */

  purchaseCommand
    .command('passOrganization')
    .description('Get the organization ID the the product pass belongs to')
    .argument('<tokenId>', 'The product pass token ID')
    .action(async (tokenId) => {
      const organizationId = await purchaseRegistry.passOrganization(tokenId);
      console.log(`Token ID: ${tokenId}`);
      console.log(`Organization ID: ${organizationId}`);
    });

  purchaseCommand
    .command('productSupply')
    .description('Get the total number of purchases for a certain product')
    .argument('<productId>', 'The product ID')
    .action(async (productId) => {
      const supply = await purchaseRegistry.productSupply(productId);
      console.log(`Product ID: ${productId}`);
      console.log(`Current supply: ${supply}`);
    });

  purchaseCommand
    .command('productMaxSupply')
    .description('Get the max supply for a product')
    .argument('<productId>', 'The product ID')
    .action(async (productId) => {
      const maxSupply = await purchaseRegistry.productMaxSupply(productId);
      console.log(`Product ID: ${productId}`);
      console.log(`Max supply: ${maxSupply}`);
    });

  purchaseCommand
    .command('totalProductsSold')
    .description('Get the total number of products sold for an organization')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const totalProductsSold = await purchaseRegistry.totalProductsSold(
        organizationId,
      );
      console.log(`Organization ID: ${organizationId}`);
      console.log(`Total products sold: ${totalProductsSold}`);
    });

  purchaseCommand
    .command('totalPassMints')
    .description('Get the total number of pass mints for an organization')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const totalPassMints = await purchaseRegistry.totalPassMints(
        organizationId,
      );
      console.log(`Organization ID: ${organizationId}`);
      console.log(`Total pass mints: ${totalPassMints}`);
    });

  /**
   * Max Mints
   */

  purchaseCommand
    .command('maxMints')
    .description('Get the max mints per wallet for an organization')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const maxMints = await purchaseRegistry.maxMints(organizationId);
      console.log(`Organization ID: ${organizationId}`);
      console.log(`Max mints: ${maxMints}`);
    });

  purchaseCommand
    .command('setMaxMints')
    .description('Set the max mints per wallet for an organization')
    .argument('<organizationId>', 'The organization ID')
    .argument('<maxMints>', 'The max mints for the organization')
    .action(async (organizationId, maxMints) => {
      await waitTx(purchaseRegistry.setMaxMints(organizationId, maxMints));
    });

  /**
   * Whitelist
   */

  purchaseCommand
    .command('isWhitelist')
    .description('Is the organization whitelist only?')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const isWhitelist = await purchaseRegistry.isWhitelist(organizationId);
      console.log(`Organization ID: ${organizationId}`);
      console.log(`Is whitelist: ${isWhitelist}`);
    });

  purchaseCommand
    .command('setWhitelist')
    .description('Set the whitelist status for an organization')
    .argument('<organizationId>', 'The organization ID')
    .argument('<isWhitelist>', 'The whitelist status for the organization')
    .action(async (organizationId, isWhitelist) => {
      await waitTx(
        purchaseRegistry.setWhitelist(
          organizationId,
          parseBooleanValue(isWhitelist)!,
        ),
      );
    });

  purchaseCommand
    .command('whitelistPassOwners')
    .description(
      'Whitelist addresses for an organization to mint a product pass',
    )
    .argument('<organizationId>', 'The organization ID')
    .argument('<addresses>', 'Comma separated list of addresses to whitelist')
    .argument('<isWhitelisted>', 'Comma separated list of whitelist statuses')
    .action(async (organizationId, addresses, isWhitelisted) => {
      const addressesList = parseCommaSeparatedList<string>(addresses);
      const isWhitelistedList = parseCommaSeparatedList<boolean>(
        isWhitelisted,
        'boolean',
      );
      await waitTx(
        purchaseRegistry.whitelistPassOwners(
          organizationId,
          addressesList,
          isWhitelistedList,
        ),
      );
    });

  /**
   * Mint Closed
   */

  purchaseCommand
    .command('setMintClosed')
    .description('Set the mint closed status for an organization')
    .argument('<organizationId>', 'The organization ID')
    .argument(
      '<isMintClosed>',
      'The mint closed status for the organization. true or false.',
    )
    .action(async (organizationId, isMintClosed) => {
      await waitTx(
        purchaseRegistry.setMintClosed(
          organizationId,
          parseBooleanValue(isMintClosed)!,
        ),
      );
    });

  purchaseCommand
    .command('isMintClosed')
    .description('Is the mint closed for an organization?')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const isMintClosed = await purchaseRegistry.isMintClosed(organizationId);
      console.log(`Organization ID: ${organizationId}`);
      console.log(`Is mint closed: ${isMintClosed}`);
    });
}
