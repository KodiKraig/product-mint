// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {PricingUtils} from "../libs/PricingUtils.sol";

interface ISubscriptionEscrow {
    /**
     * @notice Subscription struct relating to a product on a product pass.
     * @param orgId Organization token ID
     * @param pricingId Pricing model ID
     * @param startDate Start date of the subscription
     * @param endDate End date of the subscription
     * @param timeRemaining Time remaining in the subscription
     * @param isCancelled Whether the subscription has been cancelled
     * @param isPaused Whether the subscription has been paused
     */
    struct Subscription {
        uint256 orgId;
        uint256 pricingId;
        uint256 startDate;
        uint256 endDate;
        uint256 timeRemaining;
        bool isCancelled;
        bool isPaused;
    }

    /**
     * @notice Statuses derived from subscription state.
     * @param ACTIVE Activated and product access should be granted.
     * @param CANCELLED Will not renew at the end of the current period but product access should remain granted.
     * @param PAST_DUE Attempted to renew at the end of the current period but failed. Product access should be revoked.
     * @param PAUSED Deactivated and product access should be revoked.
     */
    enum SubscriptionStatus {
        ACTIVE,
        CANCELLED,
        PAST_DUE,
        PAUSED
    }

    /**
     * @notice Get a subscription with its status.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @return subscription The subscription details.
     * @return status The status of the subscription.
     */
    function getSubscription(
        uint256 productPassId,
        uint256 productId
    ) external view returns (Subscription memory, SubscriptionStatus);

    /**
     * @notice Emitted when a subscription cycle is updated.
     * @param organizationId The ID of the organization.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @param status The status of the subscription.
     * @param startDate The start date of the subscription.
     * @param endDate The end date of the subscription.
     */
    event SubscriptionCycleUpdated(
        uint256 indexed organizationId,
        uint256 indexed productPassId,
        uint256 indexed productId,
        SubscriptionStatus status,
        uint256 startDate,
        uint256 endDate
    );

    /**
     * Creation
     */

    /**
     * @notice Reverts when a subscription already exists for the product pass and product.
     * @param orgId The ID of the organization.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     */
    error SubscriptionAlreadyExists(
        uint256 orgId,
        uint256 productPassId,
        uint256 productId
    );

    /**
     * @notice Reverts when the organization is not pausable when trying to create a subscription in a paused state.
     */
    error OrganizationIsNotPausable();

    /**
     * @notice Creates a new subscription for a product pass and link it to the products.
     * @param _organizationId The ID of the organization.
     * @param _productPassId The ID of the product pass.
     * @param _productIds The IDs of the products.
     * @param _pricingIds The IDs of the pricing models.
     * @param _cycleDurations The durations of the cycles.
     * @param _unitQuantities The unit quantities of the products.
     * @param _pause Whether the subscription is paused.
     */
    function createSubscriptions(
        uint256 _organizationId,
        uint256 _productPassId,
        uint256[] calldata _productIds,
        uint256[] calldata _pricingIds,
        uint256[] calldata _cycleDurations,
        uint256[] calldata _unitQuantities,
        bool _pause
    ) external;

    /**
     * Renewal
     */

    /**
     * @notice Reverts when the charge style is invalid during a renewal.
     * @param chargeStyle The charge style of the pricing model.
     */
    error InvalidChargeStyle(PricingUtils.ChargeStyle chargeStyle);

    /**
     * @notice Reverts when the unit quantity is invalid.
     * @param orgId The ID of the organization.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     */
    error InvalidUnitQuantity(
        uint256 orgId,
        uint256 productPassId,
        uint256 productId
    );

    /**
     * @notice Renews an existing subscription.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @return orgId The ID of the organization.
     * @return passOwner The owner of the pass.
     * @return token The token of the pricing model.
     * @return price The price of the pricing model.
     */
    function renewSubscription(
        uint256 productPassId,
        uint256 productId
    )
        external
        returns (
            uint256 orgId,
            address passOwner,
            address token,
            uint256 price
        );

    /**
     * Change Pricing
     */

    /**
     * @notice Emitted when a subscription pricing is changed.
     * @param organizationId The ID of the organization.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @param newPricingId The ID of the new pricing model.
     */
    event SubscriptionPricingChanged(
        uint256 indexed organizationId,
        uint256 indexed productPassId,
        uint256 indexed productId,
        uint256 newPricingId
    );

    /**
     * @notice Emitted when the owner change pricing is set.
     * @dev Only the org admin can set this.
     * @param organizationId The ID of the organization.
     * @param canChange Whether the owner can change the pricing.
     */
    event OwnerChangePricingSet(uint256 indexed organizationId, bool canChange);

    /**
     * @notice Changes the pricing of a subscription.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @param newPricingId The ID of the new pricing model.
     * @param isPassOwner Whether the pass owner is changing the pricing.
     * @return token The token of the pricing model.
     * @return amount The amount to charge for the pricing model change.
     */
    function changeSubscriptionPricing(
        uint256 productPassId,
        uint256 productId,
        uint256 newPricingId,
        bool isPassOwner
    ) external returns (address token, uint256 amount);

    /**
     * @notice Returns whether the product pass owner can change the pricing.
     * If not, then only the org admin can change the pricing.
     * @param orgId The ID of the organization.
     * @return canChange Whether the owner can change the pricing.
     */
    function ownerChangePricing(uint256 orgId) external view returns (bool);

    /**
     * @notice Sets whether the product pass owner can change the pricing.
     * @param orgId The ID of the organization.
     * @param canChange Whether the owner can change the pricing.
     */
    function setOwnerChangePricing(uint256 orgId, bool canChange) external;

    /**
     * Activation
     */

    /**
     * @notice Emitted when the subscription pausable is set.
     * @param organizationId The ID of the organization.
     * @param pausable Whether subscriptions can be paused.
     */
    event SubscriptionPausableSet(
        uint256 indexed organizationId,
        bool pausable
    );

    /**
     * @notice Reverts when the pause state is invalid. It must be updated.
     */
    error InvalidPauseState();

    /**
     * @notice Pauses a subscription.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @param pause Whether to pause the subscription.
     * @return isPastDue Whether the subscription is past due.
     */
    function pauseSubscription(
        uint256 productPassId,
        uint256 productId,
        bool pause
    ) external returns (bool);

    /**
     * @notice Returns whether subscriptions can be paused.
     * @param orgId The ID of the organization.
     * @return pausable Whether subscriptions can be paused.
     */
    function subscriptionsPauseable(uint256 orgId) external view returns (bool);

    /**
     * @notice Sets whether subscriptions can be paused.
     * @dev Only the org admin can set this.
     * @param orgId The ID of the organization.
     * @param _pausable Whether subscriptions can be paused.
     */
    function setSubscriptionsPausable(uint256 orgId, bool _pausable) external;

    /**
     * Unit Quantities
     */

    /**
     * @notice The unit quantity for a product pass used for tiered charge styles.
     * @param quantity The quantity of units for tiered charge styles.
     * @param maxQuantity The maximum quantity of units that have been purchased for the current cycle. Resets at the end of each cycle.
     */
    struct UnitQuantity {
        uint256 orgId;
        uint256 quantity;
        uint256 maxQuantity;
    }

    /**
     * Emitted when a unit quantity is set for a product pass.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @param quantity The quantity of the unit.
     * @param maxQuantity The maximum quantity of units that have been purchased for the current cycle. Resets at the end of each cycle.
     */
    event UnitQuantitySet(
        uint256 indexed productPassId,
        uint256 indexed productId,
        uint256 quantity,
        uint256 maxQuantity
    );

    /**
     * @notice Returns the current quantity for a product pass.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @return quantity The quantity of the unit.
     */
    function getUnitQuantity(
        uint256 productPassId,
        uint256 productId
    ) external view returns (uint256);

    /**
     * @notice Returns the full unit quantity for a product pass.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @return unitQuantity The full unit quantity struct.
     */
    function getUnitQuantityFull(
        uint256 productPassId,
        uint256 productId
    ) external view returns (UnitQuantity memory);

    /**
     * @notice Changes the unit quantity for a product pass.
     * @dev Only the purchase manager can call this.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @param quantity The quantity of the unit.
     * @return token The token of the pricing model.
     * @return amount The amount to charge for the unit quantity change.
     */
    function changeSubscriptionUnitQuantity(
        uint256 productPassId,
        uint256 productId,
        uint256 quantity
    ) external returns (address token, uint256 amount);

    /**
     * Cancellation
     */

    /**
     * @notice Cancels a subscription.
     * @param productPassId The ID of the product pass.
     * @param productId The ID of the product.
     * @param cancel Whether to cancel the subscription.
     * @return isPastDue True if the subscription is past due, else false.
     */
    function cancelSubscription(
        uint256 productPassId,
        uint256 productId,
        bool cancel
    ) external returns (bool);
}
