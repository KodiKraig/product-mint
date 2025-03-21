import { Command } from 'commander';
import { provider, signerWallet } from '../../provider';
import { CouponRegistry__factory } from '@product-mint/ethers-sdk';
import { getContractAddress } from '../../contract-address';
import { waitTx } from '../../utils/tx';

const couponRegistry = CouponRegistry__factory.connect(
  getContractAddress('couponRegistry'),
  provider,
);

export default function registerCouponCommand(program: Command) {
  const couponCommand = program
    .command('coupon')
    .description('Manage coupons for organizations');

  /**
   * Queries
   */

  couponCommand
    .command('listOrg')
    .description('List all coupons for an organization')
    .argument('<organizationId>', 'Organization ID that the coupon belongs to')
    .action(async (organizationId) => {
      const coupons = await couponRegistry.getOrgCoupons(organizationId);

      console.log(
        `${coupons.length} coupons found for organization ${organizationId}`,
      );

      for (const coupon of coupons) {
        console.log(`\nCode: ${coupon.code}`);
        console.log(
          `Discount: ${coupon.discount} (${Number(coupon.discount) / 100}%)`,
        );
        console.log(`Expiration: ${coupon.expiration}`);
        console.log(`Total Redemptions: ${coupon.totalRedemptions}`);
        console.log(`Max Total Redemptions: ${coupon.maxTotalRedemptions}`);
        console.log(
          `Is Initial Purchase Only: ${coupon.isInitialPurchaseOnly}`,
        );
        console.log(`Is Active: ${coupon.isActive}`);
        console.log(`Is Restricted: ${coupon.isRestricted}`);
        console.log(`Is One Time Use: ${coupon.isOneTimeUse}`);
      }
    });

  /**
   * Create
   */

  couponCommand
    .command('create')
    .description('Create a new coupon')
    .argument('<organizationId>', 'Organization ID that the coupon belongs to')
    .argument('<code>', 'The coupon code')
    .argument(
      '<discount>',
      'Discount percentage. 1 = 1%, 15 = 15%, 100 = 100%, etc.',
    )
    .argument(
      '<expiration>',
      'Expiration timestamp when the coupon will no longer be valid. 0 = never expires.',
    )
    .argument(
      '<maxTotalRedemptions>',
      'Maximum total redemptions for the coupon. 0 = unlimited.',
    )
    .option(
      '-i, --initial-purchase-only <initialPurchaseOnly>',
      'True then only initial product pass mint purchases should be able to use the coupon',
      false,
    )
    .option(
      '-a, --active <active>',
      'True then the coupon is currently active and can be redeemed',
      true,
    )
    .option(
      '-r, --restricted <restricted>',
      'True then the coupon is restricted to a specific group of users that have been granted access',
      false,
    )
    .option(
      '-o, --one-time-use <oneTimeUse>',
      'True then the coupon can only be used once per customer',
      false,
    )
    .action(
      async (
        organizationId,
        code,
        discount,
        expiration,
        maxTotalRedemptions,
        options,
      ) => {
        const { initialPurchaseOnly, active, restricted, oneTimeUse } = options;

        waitTx(
          couponRegistry.connect(signerWallet).createCoupon({
            orgId: organizationId,
            code,
            discount: discount * 100,
            expiration,
            maxTotalRedemptions,
            isInitialPurchaseOnly: initialPurchaseOnly,
            isActive: active,
            isRestricted: restricted,
            isOneTimeUse: oneTimeUse,
          }),
        );
      },
    );

  registerUpdateCouponCommand(couponCommand);
}

const registerUpdateCouponCommand = (program: Command) => {
  const updateCouponCommand = program
    .command('update')
    .description('Update an existing coupon');

  updateCouponCommand
    .command('discount')
    .description('Update the discount for a coupon')
    .argument('<couponId>', 'The ID of the coupon to update')
    .argument(
      '<discount>',
      'The new discount percentage. 1 = 1%, 15.2 = 15.2%, 100 = 100%, etc.',
    )
    .action(async (couponId, discount) => {
      waitTx(
        couponRegistry
          .connect(signerWallet)
          .setCouponDiscount(couponId, discount * 100),
      );
    });

  updateCouponCommand
    .command('active')
    .description('Update the active status for a coupon')
    .argument('<couponId>', 'The ID of the coupon to update')
    .argument(
      '<active>',
      'The new active status. true = active, false = inactive',
    )
    .action(async (couponId, active) => {
      waitTx(
        couponRegistry
          .connect(signerWallet)
          .setCouponActive(couponId, active === 'true'),
      );
    });
  return updateCouponCommand;
};
