// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {PricingUtils} from "../libs/PricingUtils.sol";

interface IPricingCalculator {
    /**
     * Checkout Cost
     */

    /**
     * @notice The parameters to calculate the checkout total cost
     * @dev Uses the same validation as the purchase manager so it will revert if the parameters are not valid
     * @param organizationId The id of the organization
     * @param productPassOwner The address of the product pass owner
     * @param productIds The ids of the products
     * @param pricingIds The ids of the pricing
     * @param quantities The quantities of the pricing
     * @param discountIds The ids of the discounts
     * @param couponId The id of the coupon
     */
    struct CheckoutTotalCostParams {
        uint256 organizationId;
        address productPassOwner;
        uint256[] productIds;
        uint256[] pricingIds;
        uint256[] quantities;
        uint256[] discountIds;
        uint256 couponId;
    }

    /**
     * @notice The result of the checkout total cost calculation
     * @param pricingIds The ids of the pricing
     * @param token The token of the pricing
     * @param costs The costs for each pricing id
     * @param couponCost The cost after applying the coupon
     * @param couponDiscount The discount percentage applied by the coupon in basis points
     * @param couponSavings The savings from the coupon
     * @param permanentCost The cost after applying the permanent discounts
     * @param permanentDiscount The discount percentage applied by the permanent discounts in basis points
     * @param permanentSavings The savings from the permanent discounts
     * @param subTotalCost The sub total cost of the checkout before applying the coupon and permanent discounts
     * @param checkoutTotalCost The total cost of the checkout after applying the coupon and permanent discounts
     */
    struct CheckoutTotalCost {
        uint256[] pricingIds;
        address token;
        uint256[] costs;
        uint256 couponCost;
        uint256 couponDiscount;
        uint256 couponSavings;
        uint256 permanentCost;
        uint256 permanentDiscount;
        uint256 permanentSavings;
        uint256 subTotalCost;
        uint256 checkoutTotalCost;
    }

    /**
     * @notice Get the checkout total cost
     * @param params The parameters for the checkout total cost calculation
     * @return checkout The result of the checkout total cost calculation
     */
    function getCheckoutTotalCost(
        CheckoutTotalCostParams memory params
    ) external view returns (CheckoutTotalCost memory checkout);

    /**
     * Pricing Total Cost
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
