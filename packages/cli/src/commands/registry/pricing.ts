import { Command } from 'commander';
import { PricingRegistry__factory } from '@product-mint/ethers-sdk';
import { provider, signerWallet } from '../../provider';
import { getContractAddress } from '../../contract-address';
import { waitTx } from '../../utils/tx';
import { getTokenDecimals } from '../../utils/tokens';
import { ethers, parseUnits } from 'ethers';
import { parsePricingTierString, formatPricing } from '../../utils/pricing';

const pricingRegistry = PricingRegistry__factory.connect(
  getContractAddress('pricingRegistry'),
  provider,
);

export default function registerPricingCommand(program: Command): Command {
  const pricing = program
    .command('pricing')
    .description('Create and manage pricing configurations');

  pricing
    .command('orgPricing')
    .description('Get all pricing IDs and details for a given organization')
    .argument('<organizationId>', 'The organization ID')
    .action(async (organizationId) => {
      const [pricingIds, pricingDetails] = await pricingRegistry.getOrgPricing(
        organizationId,
      );

      if (pricingIds.length === 0) {
        console.log('No pricing IDs found for organization', organizationId);
        return;
      }

      console.log(
        `${pricingIds.length} Pricing IDs for Organization ${organizationId}:\n`,
      );

      for (let i = 0; i < pricingIds.length; i++) {
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

  registerCreatePricingCommand(pricing);

  return pricing;
}

function registerCreatePricingCommand(program: Command): Command {
  const pricing = program
    .command('create')
    .description('Create new pricing configurations for a given organization');

  pricing
    .command('oneTime')
    .description(
      'Create a new one-time pricing configuration. If no ERC20 token is passed then native token will be used.',
    )
    .argument('<organizationId>', 'The organization ID')
    .argument(
      '<price>',
      'The price in human readable format. i.e. 1 ether = 1, 5.99 USDC = 5.99',
    )
    .option('--erc20 <erc20>', 'The ERC20 token address', ethers.ZeroAddress)
    .option(
      '--restricted',
      'Whether the pricing is restricted to only addresses with restricted access',
      false,
    )
    .action(async (organizationId, price, options) => {
      const { erc20, restricted } = options;

      const decimals = await getTokenDecimals(erc20);

      await waitTx(
        pricingRegistry.connect(signerWallet).createOneTimePricing({
          organizationId,
          token: erc20,
          flatPrice: parseUnits(price, decimals),
          isRestricted: restricted,
        }),
      );
    });

  pricing
    .command('flatRate')
    .description(
      'Create a new flat rate subscription pricing configuration. Requires ERC20 token.',
    )
    .argument('<organizationId>', 'The organization ID')
    .argument(
      '<flatPrice>',
      'The price in human readable format. i.e. 1 ether = 1, 5.99 USDC = 5.99',
    )
    .argument('<token>', 'The ERC20 token address to use for the subscription.')
    .argument(
      '<chargeFrequency>',
      'The charge frequency of how often the subscription will be charged. 0 (DAILY), 1 (WEEKLY), 2 (MONTHLY), 3 (QUARTERLY), 4 (YEARLY)',
    )
    .option(
      '--restricted',
      'Whether the pricing is restricted to only addresses with restricted access',
      false,
    )
    .action(
      async (organizationId, flatPrice, token, chargeFrequency, options) => {
        const { restricted } = options;

        const decimals = await getTokenDecimals(token);

        await waitTx(
          pricingRegistry
            .connect(signerWallet)
            .createFlatRateSubscriptionPricing({
              organizationId,
              flatPrice: parseUnits(flatPrice, decimals),
              token,
              chargeFrequency,
              isRestricted: restricted,
            }),
        );
      },
    );

  pricing
    .command('tiered')
    .description(
      'Create a new tiered pricing configuration. Requires ERC20 token.',
    )
    .argument('<organizationId>', 'The organization ID')
    .argument('<token>', 'The ERC20 token address to use for the subscription.')
    .argument(
      '<chargeFrequency>',
      'The charge frequency of how often the subscription will be charged. 0 (DAILY), 1 (WEEKLY), 2 (MONTHLY), 3 (QUARTERLY), 4 (YEARLY)',
    )
    .argument(
      '<pricingTiers>',
      'The pricing tiers to use for the subscription in a comma separated list using human readable format. i.e. 1,0,1000,1000000 -> (lowerBound, upperBound, pricePerUnit, priceFlatRate)',
    )
    .option(
      '--volume',
      'Whether the pricing tiers are volume tiers or graduated tiers',
      false,
    )
    .option(
      '--restricted',
      'Whether the pricing is restricted to only addresses with restricted access',
      false,
    )
    .action(
      async (organizationId, token, chargeFrequency, pricingTiers, options) => {
        const { volume, restricted } = options;

        const decimals = await getTokenDecimals(token);

        await waitTx(
          pricingRegistry
            .connect(signerWallet)
            .createTieredSubscriptionPricing({
              organizationId,
              token,
              chargeFrequency,
              tiers: parsePricingTierString(pricingTiers, decimals),
              isVolume: volume,
              isRestricted: restricted,
            }),
        );
      },
    );

  pricing
    .command('usage')
    .description(
      'Create a new usage based pricing configuration. Requires ERC20 token.',
    )
    .argument('<organizationId>', 'The organization ID')
    .argument('<token>', 'The ERC20 token address to use for the subscription.')
    .argument(
      '<chargeFrequency>',
      'The charge frequency of how often the subscription will be charged. 0 (DAILY), 1 (WEEKLY), 2 (MONTHLY), 3 (QUARTERLY), 4 (YEARLY)',
    )
    .argument(
      '<pricingTiers>',
      'The pricing tiers to use for the subscription in a comma separated list using human readable format. i.e. 1,0,1.5,10 -> (lowerBound, upperBound, pricePerUnit, priceFlatRate)',
    )
    .argument(
      '<usageMeterId>',
      'The usage meter ID to use for the subscription.',
    )
    .option(
      '--volume',
      'Whether the pricing tiers are volume tiers or graduated tiers',
      false,
    )
    .option(
      '--restricted',
      'Whether the pricing is restricted to only addresses with restricted access',
      false,
    )
    .action(
      async (
        organizationId,
        token,
        chargeFrequency,
        pricingTiers,
        usageMeterId,
        options,
      ) => {
        const { volume, restricted } = options;

        const decimals = await getTokenDecimals(token);

        await waitTx(
          pricingRegistry
            .connect(signerWallet)
            .createUsageBasedSubscriptionPricing({
              organizationId,
              token,
              chargeFrequency,
              tiers: parsePricingTierString(pricingTiers, decimals),
              usageMeterId,
              isVolume: volume,
              isRestricted: restricted,
            }),
        );
      },
    );

  return pricing;
}
