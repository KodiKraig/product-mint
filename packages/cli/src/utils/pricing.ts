/**
 * Pricing Tier
 */

export type PricingTier = {
  lowerBound: bigint;
  upperBound: bigint;
  pricePerUnit: bigint;
  priceFlatRate: bigint;
};

export const parsePricingTierString = (pricingTier: string): PricingTier[] => {
  const split = pricingTier.split(',');

  if (split.length === 0 || split.length % 4 !== 0) {
    throw new Error('Invalid pricing tier string');
  }

  const tiers: PricingTier[] = [];

  for (let i = 0; i < split.length; i += 4) {
    tiers.push({
      lowerBound: BigInt(split[i]),
      upperBound: BigInt(split[i + 1]),
      pricePerUnit: BigInt(split[i + 2]),
      priceFlatRate: BigInt(split[i + 3]),
    });
  }

  return tiers;
};

export const formatPricingTiers = (pricingTiers: PricingTier[]): string => {
  return JSON.stringify(
    pricingTiers.map((t) => ({
      lowerBound: t.lowerBound.toString(),
      upperBound: t.upperBound.toString(),
      pricePerUnit: t.pricePerUnit.toString(),
      priceFlatRate: t.priceFlatRate.toString(),
    })),
  );
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
