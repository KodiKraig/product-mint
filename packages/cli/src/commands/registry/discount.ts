import { Command } from 'commander';
import { provider, signerWallet } from '../../provider';
import { DiscountRegistry__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../../contract-address';
import { waitTx } from '../../utils/tx';
import { parseCommaSeparatedList } from '../../utils/parsing';

const discountRegistry = DiscountRegistry__factory.connect(
  getContractAddress('discountRegistry'),
  provider,
);

export default function registerDiscountCommand(program: Command) {
  const discountCommand = program
    .command('discount')
    .description('Manage discounts for organizations');

  /**
   * Queries
   */

  discountCommand
    .command('listOrg')
    .description('List all discounts for an organization')
    .argument(
      '<organizationId>',
      'Organization ID that the discount belongs to',
    )
    .action(async (organizationId) => {
      const discountIds = await discountRegistry.getOrgDiscountIds(
        organizationId,
      );

      const discounts = await discountRegistry.getDiscountBatch(
        discountIds.map((id) => Number(id)),
      );

      console.log(
        `${discountIds.length} discounts found for organization ${organizationId}`,
      );

      for (const discount of discounts) {
        console.log(`ID: ${discount.id}`);
        console.log(`Name: ${discount.name}`);
        console.log(
          `Discount: ${discount.discount} (${
            Number(discount.discount) / 100
          }%)`,
        );
        console.log(`Total Mints: ${discount.totalMints}`);
        console.log(`Max Mints: ${discount.maxMints}`);
        console.log(`Is Active: ${discount.isActive}`);
        console.log(`Is Restricted: ${discount.isRestricted}`);
      }
    });

  discountCommand
    .command('hasRestrictedAccess')
    .description(
      'Check if a wallet address has restricted access to a discount',
    )
    .argument('<organizationId>', 'Organization ID')
    .argument('<discountId>', 'Discount ID')
    .argument('<passOwner>', 'Wallet address')
    .action(async (organizationId, discountId, passOwner) => {
      const hasRestrictedAccess = await discountRegistry.hasRestrictedAccess(
        organizationId,
        discountId,
        passOwner,
      );

      console.log(
        `${passOwner}\nDiscount ID: ${discountId}\nRestricted Access: ${hasRestrictedAccess}`,
      );
    });

  discountCommand
    .command('listRestricted')
    .description(
      'List all restricted access updated events with optional filters',
    )
    .option('-o, --organizationId <organizationId>', 'Organization ID')
    .option('-d, --discountId <discountId>', 'Discount ID')
    .option('-p, --passOwner <passOwner>', 'Pass owner')
    .option('-f, --from <from>', 'From block')
    .action(async (options) => {
      const { organizationId, discountId, passOwner, from } = options;

      const filter = discountRegistry.filters.RestrictedAccessUpdated(
        organizationId,
        discountId,
        passOwner,
      );

      const events = await discountRegistry.queryFilter(filter, from);

      if (events.length === 0) {
        console.log('No events found');
        return;
      }

      for (const event of events) {
        console.log(`\nOrganization ID: ${event.args.orgId}`);
        console.log(`Discount ID: ${event.args.accessId}`);
        console.log(`Pass owner: ${event.args.passOwner}`);
        console.log(`Restricted: ${event.args.restricted}`);
      }
    });

  /**
   * Create
   */

  discountCommand
    .command('create')
    .description('Create a new discount')
    .argument(
      '<organizationId>',
      'Organization ID that the discount belongs to',
    )
    .argument('<name>', 'The name of the discount')
    .argument(
      '<discount>',
      'The discount amount. 1 = 1%, 15.2 = 15.2%, 100 = 100%, etc.',
    )
    .argument(
      '<maxMints>',
      'The maximum number of times the discount can be minted. 0 means unlimited.',
    )
    .option(
      '-a, --active <active>',
      'Whether the discount is active and can be minted',
      true,
    )
    .option(
      '-r, --restricted <restricted>',
      'Whether the discount is restricted to specific pass owners',
      false,
    )
    .action(async (organizationId, name, discount, maxMints, options) => {
      const { active, restricted } = options;

      await waitTx(
        discountRegistry.connect(signerWallet).createDiscount({
          orgId: organizationId,
          name,
          discount: Number(discount) * 100,
          maxMints,
          isActive: active,
          isRestricted: restricted,
        }),
      );
    });

  /**
   * Update
   */

  registerUpdateDiscountCommand(discountCommand);
}

const registerUpdateDiscountCommand = (program: Command) => {
  const updateDiscountCommand = program
    .command('update')
    .description('Update an existing discount');

  updateDiscountCommand
    .command('discount')
    .description(
      'Update the percentage discount. 1 = 1%, 15.2 = 15.2%, 100 = 100%, etc.',
    )
    .argument('<discountId>', 'The ID of the discount to update')
    .argument('<discount>', 'The new discount amount')
    .action(async (discountId, discount) => {
      await waitTx(
        discountRegistry
          .connect(signerWallet)
          .setDiscount(discountId, Number(discount) * 100),
      );
    });

  updateDiscountCommand
    .command('restricted')
    .description('Update the restricted status of the discount')
    .argument('<discountId>', 'The ID of the discount to update')
    .argument(
      '<restricted>',
      'Whether the discount is restricted to specific pass owners',
    )
    .action(async (discountId, restricted) => {
      await waitTx(
        discountRegistry
          .connect(signerWallet)
          .setDiscountRestricted(discountId, restricted),
      );
    });

  updateDiscountCommand
    .command('active')
    .description('Update the active status of the discount')
    .argument('<discountId>', 'The ID of the discount to update')
    .argument('<active>', 'Whether the discount is active and can be minted')
    .action(async (discountId, active) => {
      await waitTx(
        discountRegistry
          .connect(signerWallet)
          .setDiscountActive(discountId, active),
      );
    });

  updateDiscountCommand
    .command('name')
    .description('Update the name of the discount')
    .argument('<discountId>', 'The ID of the discount to update')
    .argument('<name>', 'The new name of the discount')
    .action(async (discountId, name) => {
      await waitTx(
        discountRegistry
          .connect(signerWallet)
          .setDiscountName(discountId, name),
      );
    });

  updateDiscountCommand
    .command('grantRestrictedAccess')
    .description('Grant wallet addresses restricted access to the discount')
    .argument('<discountId>', 'The ID of the discount to update')
    .argument(
      '<passOwners>',
      'Comma separated list of wallet addresses to grant access to',
    )
    .argument('<restricted>', 'Whether the pass owners can mint the discount')
    .action(async (discountId, passOwners, restricted) => {
      const _passOwners = parseCommaSeparatedList<string>(passOwners);
      const _restricted = parseCommaSeparatedList<boolean>(
        restricted,
        'boolean',
      );

      await waitTx(
        discountRegistry
          .connect(signerWallet)
          .setRestrictedAccess(discountId, _passOwners, _restricted),
      );
    });
};
