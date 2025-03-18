import { BigNumberish, formatUnits, parseUnits } from 'ethers';
import { getTokenDecimals } from './tokens';

/**
 * Pricing
 */

export type Pricing = {
  id: bigint;
  chargeStyle: bigint;
  chargeFrequency: bigint;
  tiers: PricingTier[];
  token: string;
  flatPrice: bigint;
  usageMeterId: bigint;
  isActive: boolean;
  isRestricted: boolean;
};

export const formatPricing = async (pricing: Pricing): Promise<string> => {
  const decimals = await getTokenDecimals(pricing.token);

  let formattedPricing = [
    `ID: ${pricing.id}`,
    `Charge Style: ${pricing.chargeStyle} (${formatChargeStyle(
      pricing.chargeStyle,
    )})`,
    `Charge Frequency: ${pricing.chargeFrequency} (${formatChargeFrequency(
      pricing.chargeFrequency,
    )})`,
    `Tiers: ${await formatPricingTiers(pricing.tiers, pricing.token)}`,
    `Token: ${pricing.token}`,
    `Flat Price: ${pricing.flatPrice} (${formatUnits(
      pricing.flatPrice,
      decimals,
    )})`,
    `Usage Meter ID: ${pricing.usageMeterId}`,
    `Is Active: ${pricing.isActive}`,
    `Is Restricted: ${pricing.isRestricted}`,
  ];
  return formattedPricing.join('\n');
};

/**
 * Pricing Tier
 */
export type PricingTier = {
  lowerBound: BigNumberish;
  upperBound: BigNumberish;
  pricePerUnit: BigNumberish;
  priceFlatRate: BigNumberish;
};

export const parsePricingTierString = (
  pricingTier: string,
  decimals?: number,
): PricingTier[] => {
  const split = pricingTier.split(',');

  if (split.length === 0 || split.length % 4 !== 0) {
    throw new Error('Invalid pricing tier string');
  }

  const tiers: PricingTier[] = [];

  for (let i = 0; i < split.length; i += 4) {
    tiers.push({
      lowerBound: split[i],
      upperBound: split[i + 1],
      pricePerUnit: parseUnits(split[i + 2], decimals),
      priceFlatRate: parseUnits(split[i + 3], decimals),
    });
  }

  return tiers;
};

export const formatPricingTiers = async (
  pricingTiers: PricingTier[],
  tokenAddress: string,
): Promise<string> => {
  const decimals = await getTokenDecimals(tokenAddress);

  const convertedTiers = pricingTiers.map((t) => ({
    lowerBound: Number(t.lowerBound),
    upperBound: Number(t.upperBound),
    pricePerUnit: formatUnits(t.pricePerUnit, decimals),
    priceFlatRate: formatUnits(t.priceFlatRate, decimals),
  }));

  return JSON.stringify(convertedTiers);
};

/**
 * Charge Frequency
 */

export type ChargeFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'YEARLY';

export const formatChargeFrequency = (
  chargeFrequency: bigint,
): ChargeFrequency => {
  const chargeFrequencyNumber = Number(chargeFrequency);

  switch (chargeFrequencyNumber) {
    case 0:
      return 'DAILY';
    case 1:
      return 'WEEKLY';
    case 2:
      return 'MONTHLY';
    case 3:
      return 'QUARTERLY';
    case 4:
      return 'YEARLY';
    default:
      throw new Error(`Invalid charge frequency: ${chargeFrequencyNumber}`);
  }
};

/**
 * Charge Style
 */

export type ChargeStyle =
  | 'ONE_TIME'
  | 'FLAT_RATE'
  | 'TIERED_VOLUME'
  | 'TIERED_GRADUATED'
  | 'USAGE_BASED_VOLUME'
  | 'USAGE_BASED_GRADUATED';

export const formatChargeStyle = (chargeStyle: bigint): ChargeStyle => {
  const chargeStyleNumber = Number(chargeStyle);

  switch (chargeStyleNumber) {
    case 0:
      return 'ONE_TIME';
    case 1:
      return 'FLAT_RATE';
    case 2:
      return 'TIERED_VOLUME';
    case 3:
      return 'TIERED_GRADUATED';
    case 4:
      return 'USAGE_BASED_VOLUME';
    case 5:
      return 'USAGE_BASED_GRADUATED';
    default:
      throw new Error(`Invalid charge style: ${chargeStyleNumber}`);
  }
};
