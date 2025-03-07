// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {PricingUtils} from "../libs/PricingUtils.sol";

interface ISubscriptionEscrow {
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

    function changeSubscriptionUnitQuantity(
        uint256 productPassId,
        uint256 productId,
        uint256 quantity
    ) external returns (address token, uint256 amount);

    function getUnitQuantity(
        uint256 productPassId,
        uint256 productId
    ) external view returns (uint256);

    error SubscriptionAlreadyExists(
        uint256 orgId,
        uint256 productPassId,
        uint256 productId
    );

    error InvalidUnitQuantity(
        uint256 orgId,
        uint256 productPassId,
        uint256 productId
    );

    error InvalidChargeStyle(PricingUtils.ChargeStyle chargeStyle);

    error InvalidPauseState();

    error OrganizationIsNotPausable();

    event SubscriptionCycleUpdated(
        uint256 indexed organizationId,
        uint256 indexed productPassId,
        uint256 indexed productId,
        SubscriptionStatus status,
        uint256 startDate,
        uint256 endDate
    );

    event SubscriptionPausableSet(
        uint256 indexed organizationId,
        bool pausable
    );

    event SubscriptionPricingChanged(
        uint256 indexed organizationId,
        uint256 indexed productPassId,
        uint256 indexed productId,
        uint256 newPricingId
    );

    function subscriptionsPauseable(uint256 orgId) external view returns (bool);

    function setSubscriptionsPausable(uint256 orgId, bool _pausable) external;

    function createSubscriptions(
        uint256 _organizationId,
        uint256 _productPassId,
        uint256[] calldata _productIds,
        uint256[] calldata _pricingIds,
        uint256[] calldata _cycleDurations,
        uint256[] calldata _unitQuantities,
        bool _pause
    ) external;

    function changeSubscriptionPricing(
        uint256 productPassId,
        uint256 productId,
        uint256 newPricingId,
        bool isPassOwner
    ) external returns (address token, uint256 amount);

    function setOwnerChangePricing(uint256 orgId, bool canChange) external;

    event OwnerChangePricingSet(uint256 indexed organizationId, bool canChange);

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

    function pauseSubscription(
        uint256 productPassId,
        uint256 productId,
        bool pause
    ) external returns (bool);

    function cancelSubscription(
        uint256 productPassId,
        uint256 productId,
        bool cancel
    ) external returns (bool);

    function getSubscription(
        uint256 productPassId,
        uint256 productId
    ) external view returns (Subscription memory, SubscriptionStatus);
}
