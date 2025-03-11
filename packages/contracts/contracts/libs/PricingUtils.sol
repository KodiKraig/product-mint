// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @notice Utility library for managing pricing configurations.
 */
library PricingUtils {
    /**
     * @notice A pricing configuration option for a product.
     * @param orgId The organization ID that the pricing configuration belongs to.
     * @param chargeStyle How the product should be charged.
     * @param chargeFrequency How often the subscription is charged.
     * @param tiers The tiers of pricing used in TIER and USAGE_BASED models.
     * @param token The ERC20 token that is used for all tiers. address(0) means use the native token of the chain.
     * @param flatPrice The price of the product if the pricing model is FLAT_RATE or chargeStyle is ONE_TIME.
     * @param usageMeterId The usage meter ID that is used to record the usage of the product. 0 if not used.
     * @param isActive If true, then the pricing configuration can be used in new purchases, else it is not available for purchase.
     * @param isRestricted If true, then the pricing configuration is restricted to wallets that have been granted restricted access.
     */
    struct Pricing {
        uint256 orgId;
        ChargeStyle chargeStyle;
        ChargeFrequency chargeFrequency;
        PricingTier[] tiers;
        address token;
        uint256 flatPrice;
        uint256 usageMeterId;
        bool isActive;
        bool isRestricted;
    }

    /**
     * @notice Returns true if the pricing is usage based.
     * @param pricing The pricing configuration.
     * @return true if the pricing is usage based, false otherwise.
     */
    function isUsage(Pricing memory pricing) internal pure returns (bool) {
        return
            pricing.chargeStyle == ChargeStyle.USAGE_BASED_VOLUME ||
            pricing.chargeStyle == ChargeStyle.USAGE_BASED_GRADUATED;
    }

    /**
     * @notice Returns true if the pricing is tiered.
     * @param pricing The pricing configuration.
     * @return true if the pricing is tiered, false otherwise.
     */
    function isTiered(Pricing memory pricing) internal pure returns (bool) {
        return
            pricing.chargeStyle == ChargeStyle.TIERED_VOLUME ||
            pricing.chargeStyle == ChargeStyle.TIERED_GRADUATED;
    }

    /**
     * @notice ChargeStyle is how the product should be charged.
     * @param ONE_TIME The product is charged once for a one-time purchase.
     * @param FLAT_RATE The price for a recurring subscription.
     * @param TIERED_VOLUME The price is different for different quantity of units.
     *        Final tier reached is used for all units. Billed at the start of the period.
     * @param TIERED_GRADUATED The price is different for different quantity of units.
     *        Tiers apply progressively. Billed at the start of the period.
     * @param USAGE_BASED_VOLUME The price is based on the final usage recorded in the billing period.
     *        Final tier reached is used. Billed at the end of the period.
     * @param USAGE_BASED_GRADUATED The price is based on the usage recorded in the billing period.
     *        Tiers apply progressively. Billed at the end of the period.
     */
    enum ChargeStyle {
        ONE_TIME,
        FLAT_RATE,
        TIERED_VOLUME,
        TIERED_GRADUATED,
        USAGE_BASED_VOLUME,
        USAGE_BASED_GRADUATED
    }

    /**
     * Subscription based products
     */

    /**
     * @notice ChargeFrequency is how often the subscription is charged.
     * @param DAILY Every 1 day
     * @param WEEKLY Every 7 days
     * @param MONTHLY Every 30 days
     * @param QUARTERLY Every 90 days
     * @param YEARLY Every 365 days
     */
    enum ChargeFrequency {
        DAILY,
        WEEKLY,
        MONTHLY,
        QUARTERLY,
        YEARLY
    }

    /**
     * @notice PricingTier is a tier of pricing.
     * @param lowerBound The lower number of units for the tier.
     * @param upperBound The upper number of units for the tier.
     * @param pricePerUnit The price per unit.
     * @param priceFlatRate The flat rate that is added to the price.
     */
    struct PricingTier {
        uint256 lowerBound;
        uint256 upperBound;
        uint256 pricePerUnit;
        uint256 priceFlatRate;
    }
}
