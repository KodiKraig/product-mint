// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {PricingUtils} from "../libs/PricingUtils.sol";

interface IPricingCalculator {
    /**
     * Total Cost
     */

    /**
     * @notice Get the total cost for a pricing id
     * @param pricingId The id of the pricing
     * @param quantity The quantity of the pricing. Ignored if not tiered or usage based pricing.
     * @return The total cost of the pricing
     */
    function getPricingTotalCost(
        uint256 pricingId,
        uint256 quantity
    ) external view returns (uint256);

    /**
     * @notice Get the initial purchase cost for a list of pricing ids
     * @param pricingIds The ids of the pricing
     * @param quantities The quantities of the pricing. Ignored if not tiered or usage based pricing.
     * @return cost The initial purchase cost of the pricing
     */
    function getInitialPurchaseCost(
        uint256[] memory pricingIds,
        uint256[] memory quantities
    ) external view returns (uint256 cost);

    /**
     * @notice Get the total cost for a pricing model
     * @param chargeStyle The charge style of the pricing
     * @param tiers The tiers of the pricing
     * @param flatPrice The flat price of the pricing
     * @param quantity The quantity of the pricing. Ignored if not tiered or usage based pricing.
     * @return The total cost of the pricing
     */
    function getTotalCost(
        PricingUtils.ChargeStyle chargeStyle,
        PricingUtils.PricingTier[] memory tiers,
        uint256 flatPrice,
        uint256 quantity
    ) external pure returns (uint256);

    /**
     * @notice Get the total cost for a pricing model
     * @param tiers The tiers of the pricing
     * @param quantity The quantity of the pricing.
     * @return The total cost of the pricing
     */
    function totalVolumeCost(
        PricingUtils.PricingTier[] memory tiers,
        uint256 quantity
    ) external pure returns (uint256);

    /**
     * @notice Get the total cost for a pricing model
     * @param tiers The tiers of the pricing
     * @param quantity The quantity of the pricing.
     * @return The total cost of the pricing
     */
    function totalGraduatedCost(
        PricingUtils.PricingTier[] memory tiers,
        uint256 quantity
    ) external pure returns (uint256);

    /**
     * Change Subscription Pricing
     */

    /**
     * @notice Reverts if the charge style is not valid when changing subscription pricing
     */
    error InvalidChargeStyle();

    /**
     * @notice Reverts if the charge style is not usage based when changing subscription pricing for another usage based pricing
     * @dev You cannot change to a non-usage based pricing model from a usage based pricing model and vice versa
     */
    error UsageBasedChargeStyleInconsistency();

    /**
     * @notice Reverts if the charge style is not tiered when changing subscription pricing for another tiered pricing
     * @dev You cannot change to a non-tiered pricing model from a tiered pricing model and vice versa
     */
    error TieredChargeStyleInconsistency();

    /**
     * @notice Get the new end date, token, and amount to change a subscription pricing
     * @dev Reverts if the charge style or date range is not valid
     * @param oldPricingId The id of the old pricing
     * @param newPricingId The id of the new pricing
     * @param currentStartDate The start date of the current subscription
     * @param currentEndDate The end date of the current subscription
     * @param quantity The quantity of the pricing
     * @return newEndDate The new end date of the subscription
     * @return token The token of the pricing
     * @return amount The amount of the pricing
     */
    function getChangeSubscriptionCost(
        uint256 oldPricingId,
        uint256 newPricingId,
        uint256 currentStartDate,
        uint256 currentEndDate,
        uint256 quantity
    ) external view returns (uint256 newEndDate, address token, uint256 amount);

    /**
     * Change Tiered Subscription Unit Quantity
     */

    /**
     * @notice Reverts if the old quantity is the same as the new quantity
     */
    error UnitQuantityIsTheSame();

    /**
     * @notice Get the new end date, token, and amount to change a tiered subscription unit quantity
     * @dev Reverts if the charge style or date range is not valid
     * @param pricingId The id of the pricing
     * @param currentStartDate The start date of the current subscription
     * @param currentEndDate The end date of the current subscription
     * @param oldQuantity The old quantity of the pricing
     * @param newQuantity The new quantity of the pricing
     * @return The pricing token and amount to charge for the change in quantity
     */
    function getChangeUnitQuantityCost(
        uint256 pricingId,
        uint256 currentStartDate,
        uint256 currentEndDate,
        uint256 oldQuantity,
        uint256 newQuantity
    ) external view returns (address, uint256);
}
