import { Command } from 'commander';
import { signerWallet } from '../../provider';
import { ProductRegistry__factory } from '@product-mint/ethers-sdk';
import { waitTx } from '../../utils/tx';
import { getContractAddress } from '../../contract-address';
import { parseCommaSeparatedList } from '../../utils/parsing';
import { formatPricing } from '../../utils/pricing';

const productRegistry = ProductRegistry__factory.connect(
  getContractAddress('productRegistry'),
  signerWallet,
);

export default function registerProductCommand(program: Command): Command {
  const productCommand = program
    .command('product')
    .description('Manage products and link them to pricing configurations');

  productCommand
    .command('totalSupply')
    .description('Get the total number of products that have been created')
    .action(async () => {
      const totalProductSupply = await productRegistry.totalProductSupply();
      console.log(`Total product supply: ${totalProductSupply}`);
    });

  /**
   * Get Products
   */

  productCommand
    .command('getOrgProducts')
    .description('Get all products for an organization')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const [productIds, products] = await productRegistry.getOrgProducts(
        organizationId,
      );

      console.log(`Organization ID: ${organizationId}`);
      console.log(`Total products: ${productIds.length}`);

      for (let i = 0; i < productIds.length; i++) {
        console.log(`\nProduct ID: ${productIds[i]}`);
        console.log(`Name: ${products[i].name}`);
        console.log(`Description: ${products[i].description}`);
        console.log(`Image URL: ${products[i].imageUrl}`);
        console.log(`External URL: ${products[i].externalUrl}`);
        console.log(`Is Transferable: ${products[i].isTransferable}`);
        console.log(`Is Active: ${products[i].isActive}`);
      }
    });

  /**
   * Product Creation
   */

  productCommand
    .command('create')
    .description('Create a new product')
    .argument(
      '<organizationId>',
      'The organization ID that the product belongs to',
    )
    .argument('<name>', 'The name of the product')
    .argument('<description>', 'The description of the product')
    .option('-i, --image-url <imageUrl>', 'The image URL for the product', '')
    .option(
      '-e, --external-url <externalUrl>',
      'The external URL for the product',
      '',
    )
    .option(
      '-t, --is-transferable <isTransferable>',
      'Whether the product is transferable',
      false,
    )
    .action(async (organizationId, name, description, options) => {
      const { imageUrl, externalUrl, isTransferable } = options;

      await waitTx(
        productRegistry.createProduct({
          orgId: organizationId,
          name,
          description,
          imageUrl,
          externalUrl,
          isTransferable,
        }),
      );
    });

  /**
   * Price Linking
   */

  productCommand
    .command('linkPricing')
    .description('Link pricing configurations to a product')
    .argument('<productId>', 'The product ID')
    .argument(
      '<pricingIds>',
      'Comma separated pricing IDs to link to the product',
    )
    .action(async (productId, pricingIds) => {
      const pricingIdsArray = parseCommaSeparatedList<bigint>(
        pricingIds,
        'number',
      );

      await waitTx(productRegistry.linkPricing(productId, pricingIdsArray));
    });

  productCommand
    .command('unlinkPricing')
    .description('Unlink pricing configurations from a product')
    .argument('<productId>', 'The product ID')
    .argument(
      '<pricingIds>',
      'Comma separated pricing IDs to unlink from the product',
    )
    .action(async (productId, pricingIds) => {
      const pricingIdsArray = parseCommaSeparatedList<bigint>(
        pricingIds,
        'number',
      );

      await waitTx(productRegistry.unlinkPricing(productId, pricingIdsArray));
    });

  productCommand
    .command('getLinkedPricing')
    .description('Get the linked pricing details for a product')
    .argument('<productId>', 'The product ID')
    .action(async (productId) => {
      const [pricingIds, pricingDetails] =
        await productRegistry.getProductPricing(productId);

      console.log(`Product ID: ${productId}`);

      if (pricingIds.length === 0) {
        console.log(`No pricing IDs linked`);
        return;
      }

      console.log(`Pricing IDs: ${pricingIds.join(', ')}\n`);

      for (let i = 0; i < pricingDetails.length; i++) {
        console.log(
          await formatPricing({
            id: pricingIds[i],
            chargeStyle: pricingDetails[i].chargeStyle,
            chargeFrequency: pricingDetails[i].chargeFrequency,
            tiers: pricingDetails[i].tiers,
            token: pricingDetails[i].token,
            flatPrice: pricingDetails[i].flatPrice,
            usageMeterId: pricingDetails[i].usageMeterId,
            isActive: pricingDetails[i].isActive,
            isRestricted: pricingDetails[i].isRestricted,
          }),
        );
      }
    });

  return productCommand;
}
