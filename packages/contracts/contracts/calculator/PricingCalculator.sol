// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {PricingUtils} from "../libs/PricingUtils.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPricingRegistry} from "../registry/IPricingRegistry.sol";
import {IPricingCalculator} from "./IPricingCalculator.sol";

contract PricingCalculator is RegistryEnabled, IPricingCalculator, IERC165 {
    using PricingUtils for PricingUtils.Pricing;

    constructor(address _contractRegistry) RegistryEnabled(_contractRegistry) {}

    /**
     * Total Cost
     */

    function getPricingTotalCost(
        uint256 pricingId,
        uint256 quantity
    ) external view returns (uint256) {
        PricingUtils.Pricing memory pricing = IPricingRegistry(
            registry.pricingRegistry()
        ).getPricing(pricingId);

        return
            getTotalCost(
                pricing.chargeStyle,
                pricing.tiers,
                pricing.flatPrice,
                quantity
            );
    }

    function getInitialPurchaseCost(
        uint256[] memory pricingIds,
        uint256[] memory quantities
    ) external view returns (uint256 cost) {
        require(pricingIds.length > 0, "No pricing ids provided");
        require(pricingIds.length == quantities.length, "Invalid pricing ids");

        PricingUtils.Pricing[] memory pricing = IPricingRegistry(
            registry.pricingRegistry()
        ).getPricingBatch(pricingIds);

        for (uint256 i = 0; i < pricingIds.length; i++) {
            if (!pricing[i].isUsage()) {
                // Usage pricing is only applied at the end of the billing cycle
                cost += getTotalCost(
                    pricing[i].chargeStyle,
                    pricing[i].tiers,
                    pricing[i].flatPrice,
                    quantities[i]
                );
            }
        }
    }

    function getTotalCost(
        PricingUtils.ChargeStyle chargeStyle,
        PricingUtils.PricingTier[] memory tiers,
        uint256 flatPrice,
        uint256 quantity
    ) public pure returns (uint256) {
        if (
            chargeStyle == PricingUtils.ChargeStyle.ONE_TIME ||
            chargeStyle == PricingUtils.ChargeStyle.FLAT_RATE
        ) {
            return flatPrice;
        }

        if (
            chargeStyle == PricingUtils.ChargeStyle.TIERED_VOLUME ||
            chargeStyle == PricingUtils.ChargeStyle.USAGE_BASED_VOLUME
        ) {
            return totalVolumeCost(tiers, quantity);
        }

        return totalGraduatedCost(tiers, quantity);
    }

    function totalVolumeCost(
        PricingUtils.PricingTier[] memory tiers,
        uint256 quantity
    ) public pure returns (uint256) {
        if (tiers.length == 0) {
            return 0;
        }

        if (quantity == 0) {
            return tiers[0].priceFlatRate;
        }

        // Find the tier where the quantity falls into the range
        for (uint256 i = 0; i < tiers.length; i++) {
            if (
                quantity >= tiers[i].lowerBound &&
                quantity <= tiers[i].upperBound
            ) {
                return
                    tiers[i].pricePerUnit * quantity + tiers[i].priceFlatRate;
            }
        }

        // If the quantity does not fall into any tier, use the last tier
        return
            tiers[tiers.length - 1].pricePerUnit *
            quantity +
            tiers[tiers.length - 1].priceFlatRate;
    }

    function totalGraduatedCost(
        PricingUtils.PricingTier[] memory tiers,
        uint256 quantity
    ) public pure returns (uint256) {
        if (quantity == 0 || tiers.length == 0) {
            return 0;
        }

        uint256 cost = 0;

        // Add up the cost accrued for each tier
        for (uint256 i = 0; i < tiers.length; i++) {
            if (quantity < tiers[i].lowerBound) {
                break;
            }

            if (
                i == tiers.length - 1 ||
                (quantity >= tiers[i].lowerBound &&
                    quantity <= tiers[i].upperBound)
            ) {
                if (i == 0) {
                    cost +=
                        tiers[i].pricePerUnit *
                        quantity +
                        tiers[i].priceFlatRate;
                } else {
                    cost +=
                        tiers[i].pricePerUnit *
                        (quantity - tiers[i].lowerBound + 1) +
                        tiers[i].priceFlatRate;
                }
            } else if (tiers[i].lowerBound == tiers[i].upperBound) {
                cost += tiers[i].pricePerUnit + tiers[i].priceFlatRate;
            } else if (i == 0) {
                cost +=
                    tiers[i].pricePerUnit *
                    tiers[i].upperBound +
                    tiers[i].priceFlatRate;
            } else {
                cost +=
                    tiers[i].pricePerUnit *
                    (tiers[i].upperBound - tiers[i].lowerBound + 1) +
                    tiers[i].priceFlatRate;
            }
        }

        return cost;
    }

    /**
     * Change Subscription Pricing
     */

    function getChangeSubscriptionCost(
        uint256 oldPricingId,
        uint256 newPricingId,
        uint256 currentStartDate,
        uint256 currentEndDate,
        uint256 quantity
    )
        external
        view
        returns (uint256 newEndDate, address token, uint256 amount)
    {
        require(oldPricingId != newPricingId, "Pricing ids are the same");
        _checkValidDateRange(currentStartDate, currentEndDate);

        PricingUtils.Pricing memory oldPricing = IPricingRegistry(
            registry.pricingRegistry()
        ).getPricing(oldPricingId);

        PricingUtils.Pricing memory newPricing = IPricingRegistry(
            registry.pricingRegistry()
        ).getPricing(newPricingId);

        if (
            oldPricing.chargeStyle == PricingUtils.ChargeStyle.ONE_TIME ||
            newPricing.chargeStyle == PricingUtils.ChargeStyle.ONE_TIME
        ) {
            revert InvalidChargeStyle();
        }

        if (oldPricing.isUsage() != newPricing.isUsage()) {
            revert UsageBasedChargeStyleInconsistency();
        }

        if (oldPricing.isTiered() != newPricing.isTiered()) {
            revert TieredChargeStyleInconsistency();
        }

        token = newPricing.token;

        (newEndDate, amount) = _getChangePricingCost(
            oldPricing,
            newPricing,
            currentStartDate,
            currentEndDate,
            quantity
        );
    }

    function _getChangePricingCost(
        PricingUtils.Pricing memory oldPricing,
        PricingUtils.Pricing memory newPricing,
        uint256 currentStartDate,
        uint256 currentEndDate,
        uint256 quantity
    ) internal view returns (uint256 newEndDate, uint256 amount) {
        uint256 newCycleDuration = IPricingRegistry(registry.pricingRegistry())
            .getChargeFrequencyCycleDuration(newPricing.chargeFrequency);

        uint256 oldCycleDuration = IPricingRegistry(registry.pricingRegistry())
            .getChargeFrequencyCycleDuration(oldPricing.chargeFrequency);

        if (
            Math.max(currentEndDate - currentStartDate, oldCycleDuration) >=
            newCycleDuration
        ) {
            // Downgrade or no change to cycle duration
            // Takes effect at the end of the current cycle
            // Freely change pricing models at no cost if cycle duration is the same or less
            newEndDate = currentEndDate;
        } else {
            // Usage based pricing charges always occur at the end of the cycle with no proration
            if (!oldPricing.isUsage()) {
                // Upgrade to a longer cycle duration
                // Apply prorated cost for new pricing with new the current cycle end date
                amount = _getProratedCost(
                    getTotalCost(
                        newPricing.chargeStyle,
                        newPricing.tiers,
                        newPricing.flatPrice,
                        quantity
                    ),
                    currentStartDate,
                    newCycleDuration
                );
            }
            newEndDate = currentStartDate + newCycleDuration;
        }
    }

    function _getProratedCost(
        uint256 amount,
        uint256 currentStartDate,
        uint256 cycleDuration
    ) internal view returns (uint256) {
        uint256 elapsedTime = block.timestamp - currentStartDate;
        uint256 proratedTime = cycleDuration - elapsedTime;
        return (amount * proratedTime) / cycleDuration;
    }

    /**
     * Change Tiered Subscription Unit Quantity
     */

    function getChangeUnitQuantityCost(
        uint256 pricingId,
        uint256 currentStartDate,
        uint256 currentEndDate,
        uint256 oldQuantity,
        uint256 newQuantity
    ) external view returns (address, uint256) {
        _checkValidDateRange(currentStartDate, currentEndDate);

        PricingUtils.Pricing memory pricing = IPricingRegistry(
            registry.pricingRegistry()
        ).getPricing(pricingId);

        if (!pricing.isTiered()) {
            revert InvalidChargeStyle();
        }

        if (oldQuantity == newQuantity) {
            revert UnitQuantityIsTheSame();
        }

        uint256 oldCost = getTotalCost(
            pricing.chargeStyle,
            pricing.tiers,
            pricing.flatPrice,
            oldQuantity
        );

        uint256 newCost = getTotalCost(
            pricing.chargeStyle,
            pricing.tiers,
            pricing.flatPrice,
            newQuantity
        );

        if (oldCost >= newCost) {
            // No charge if higher quantity is cheaper
            return (pricing.token, 0);
        }

        return (
            pricing.token,
            _getProratedCost(
                newCost - oldCost,
                currentStartDate,
                IPricingRegistry(registry.pricingRegistry())
                    .getChargeFrequencyCycleDuration(pricing.chargeFrequency)
            )
        );
    }

    /**
     * Checks
     */

    function _checkValidDateRange(
        uint256 currentStartDate,
        uint256 currentEndDate
    ) internal view {
        require(
            currentStartDate < block.timestamp &&
                currentEndDate > block.timestamp,
            "Invalid date range"
        );
    }

    /**
     * IERC165
     */

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == type(IPricingCalculator).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
