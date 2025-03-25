import { Command } from 'commander';
import { provider } from '../provider';
import {
  MintToken__factory,
  PricingCalculator__factory,
} from '@product-mint/ethers-sdk';
import { getContractAddress } from '../contract-address';
import { parseCommaSeparatedList } from '../utils/parsing';
import { ethers } from 'ethers';

const calculator = PricingCalculator__factory.connect(
  getContractAddress('pricingCalculator'),
  provider,
);

export default function registerCalculatorCommand(program: Command) {
  const calculatorCommand = program
    .command('calculator')
    .description('Calculate different costs for pricing models');

  calculatorCommand
    .command('getCheckoutTotalCost')
    .description('Calculate the total cost of a checkout')
    .argument('<organizationId>', 'The id of the organization')
    .argument('<productPassOwner>', 'The address of the product pass owner')
    .argument('<productIds>', 'The ids of the products')
    .argument('<pricingIds>', 'The ids of the pricing')
    .argument('<quantities>', 'The quantities of the pricing')
    .option('-c, --couponId <couponId>', 'The id of the coupon', '0')
    .option(
      '-d, --discountIds <discountIds>',
      'The ids of the discounts in a comma separated list',
      [],
    )
    .action(
      async (
        organizationId,
        productPassOwner,
        productIds,
        pricingIds,
        quantities,
        options,
      ) => {
        const { couponId, discountIds } = options;

        const params = {
          organizationId: parseInt(organizationId),
          productPassOwner: productPassOwner,
          productIds: parseCommaSeparatedList<number>(productIds, 'number'),
          pricingIds: parseCommaSeparatedList<number>(pricingIds, 'number'),
          quantities: parseCommaSeparatedList<number>(quantities, 'number'),
          couponId: parseInt(couponId),
          discountIds:
            discountIds.length > 0
              ? parseCommaSeparatedList<number>(discountIds, 'number')
              : [],
        };

        console.log(params);

        const checkout = await calculator.getCheckoutTotalCost(params);

        const token = new ethers.Contract(
          checkout.token,
          MintToken__factory.abi,
          provider,
        );
        const decimals = await token.decimals();

        console.log(`Pricing IDs: ${checkout.pricingIds}`);
        console.log(`Token: ${checkout.token}`);
        console.log(
          `Costs: ${checkout.costs.map((cost) =>
            ethers.formatUnits(cost, decimals),
          )}`,
        );
        console.log(
          `Coupon Cost: ${checkout.couponCost} (${ethers.formatUnits(
            checkout.couponCost,
            decimals,
          )})`,
        );
        console.log(
          `Coupon Discount: ${checkout.couponDiscount} (${
            Number(checkout.couponCost) / 100
          })`,
        );
        console.log(
          `Coupon Savings: ${checkout.couponSavings} (${ethers.formatUnits(
            checkout.couponSavings,
            decimals,
          )})`,
        );
        console.log(
          `Permanent Cost: ${checkout.permanentCost} (${ethers.formatUnits(
            checkout.permanentCost,
            decimals,
          )})`,
        );
        console.log(
          `Permanent Discount: ${checkout.permanentDiscount} (${
            Number(checkout.permanentCost) / 100
          })`,
        );
        console.log(
          `Permanent Savings: ${
            checkout.permanentSavings
          } (${ethers.formatUnits(checkout.permanentSavings, decimals)})`,
        );
        console.log(
          `Sub Total Cost: ${checkout.subTotalCost} (${ethers.formatUnits(
            checkout.subTotalCost,
            decimals,
          )})`,
        );
        console.log(
          `Checkout Total Cost: ${
            checkout.checkoutTotalCost
          } (${ethers.formatUnits(checkout.checkoutTotalCost, decimals)})`,
        );
      },
    );
}
