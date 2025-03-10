// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {ISubscriptionEscrow} from "./ISubscriptionEscrow.sol";
import {PricingUtils} from "../libs/PricingUtils.sol";
import {IPricingRegistry} from "../registry/IPricingRegistry.sol";
import {IUsageRecorder} from "../usage/IUsageRecorder.sol";
import {IPricingCalculator} from "../calculator/IPricingCalculator.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {
    ISubscriptionTransferOracle
} from "../oracle/ISubscriptionTransferOracle.sol";

/**
 * @title SubscriptionEscrow
 * @notice A contract that manages subscriptions for products on a product pass.
 *
 * Every product on a product pass can have its own subscription allowing for individual management of each subscription.
 *
 * This contract is used to manage the lifecycle of a subscription.
 *
 * There are 3 kinds of subscriptions:
 * - Flat rate: A flat rate subscription is a subscription that has a flat rate price.
 * - Tiered: A tiered subscription is a subscription that has a tiered price.
 * - Usage based: A usage based subscription is a subscription that has a usage based price used in conjunction with a usage meter.
 *
 * There are 4 states that a subscription can be in:
 * - Active: The subscription is active and the product should be accessible.
 * - Paused: The subscription is paused and the product should not be accessible.
 * - Past due: The subscription is past due and the product should not be accessible.
 * - Cancelled: The subscription is cancelled and the product should be accessible until the end of the current cycle.
 */
contract SubscriptionEscrow is
    RegistryEnabled,
    ISubscriptionEscrow,
    ISubscriptionTransferOracle,
    IERC165
{
    using PricingUtils for PricingUtils.Pricing;

    // Product Pass Token ID => Product ID => Subscription
    mapping(uint256 => mapping(uint256 => Subscription)) private subs;

    // Product Pass Token ID => Product ID => Unit Quantity
    mapping(uint256 => mapping(uint256 => UnitQuantity)) private unitQuantities;

    // Organization ID => Are subscriptions pausable for the organization?
    mapping(uint256 => bool) public subscriptionsPauseable;

    // Organization ID => Can pass owner change pricing models for subscriptions?
    mapping(uint256 => bool) public ownerChangePricing;

    constructor(address _contractRegistry) RegistryEnabled(_contractRegistry) {}

    function getSubscription(
        uint256 productPassId,
        uint256 productId
    ) external view returns (Subscription memory, SubscriptionStatus) {
        _checkSubExists(productPassId, productId);

        return (
            subs[productPassId][productId],
            _getSubStatus(subs[productPassId][productId])
        );
    }

    function _getSubStatus(
        Subscription memory sub
    ) internal view returns (SubscriptionStatus) {
        if (sub.isPaused) {
            return SubscriptionStatus.PAUSED;
        } else if (_isPastDue(sub)) {
            return SubscriptionStatus.PAST_DUE;
        } else if (sub.isCancelled) {
            return SubscriptionStatus.CANCELLED;
        }

        return SubscriptionStatus.ACTIVE;
    }

    /**
     * Creation
     */

    function createSubscriptions(
        uint256 _organizationId,
        uint256 _productPassId,
        uint256[] calldata _productIds,
        uint256[] calldata _pricingIds,
        uint256[] calldata _cycleDurations,
        uint256[] calldata _unitQuantities,
        bool _pause
    ) external onlyRegistry(registry.purchaseManager()) {
        for (uint256 i = 0; i < _productIds.length; i++) {
            if (_subExists(_productPassId, _productIds[i])) {
                revert SubscriptionAlreadyExists(
                    _organizationId,
                    _productPassId,
                    _productIds[i]
                );
            }

            if (_cycleDurations[i] > 0) {
                if (_pause && !subscriptionsPauseable[_organizationId]) {
                    revert OrganizationIsNotPausable();
                }

                subs[_productPassId][_productIds[i]] = Subscription({
                    orgId: _organizationId,
                    pricingId: _pricingIds[i],
                    startDate: _pause ? 0 : block.timestamp,
                    endDate: _pause ? 0 : block.timestamp + _cycleDurations[i],
                    timeRemaining: _pause ? _cycleDurations[i] : 0,
                    isCancelled: false,
                    isPaused: _pause
                });

                if (_unitQuantities[i] > 0) {
                    _createUnitQuantity(
                        _organizationId,
                        _productPassId,
                        _productIds[i],
                        _unitQuantities[i]
                    );

                    emit UnitQuantitySet(
                        _productPassId,
                        _productIds[i],
                        _unitQuantities[i],
                        _unitQuantities[i]
                    );
                }

                _emitCycleUpdated(_productPassId, _productIds[i]);
            }
        }
    }

    /**
     * Renewal
     */

    function renewSubscription(
        uint256 productPassId,
        uint256 productId
    )
        external
        onlyRegistry(registry.purchaseManager())
        returns (uint256 orgId, address passOwner, address token, uint256 price)
    {
        _checkSubExists(productPassId, productId);
        _checkSubNotCancelled(productPassId, productId);
        _checkSubNotPaused(productPassId, productId);
        _checkSubPastDue(productPassId, productId);

        PricingUtils.Pricing memory pricing = IPricingRegistry(
            registry.pricingRegistry()
        ).getPricing(subs[productPassId][productId].pricingId);

        _advanceSub(subs[productPassId][productId]);

        orgId = pricing.orgId;
        passOwner = _passOwner(productPassId);
        token = pricing.token;

        if (pricing.chargeStyle == PricingUtils.ChargeStyle.FLAT_RATE) {
            price = pricing.flatPrice;
        } else if (pricing.isTiered()) {
            price = _getTieredCost(productPassId, productId, pricing);
            _syncMaxQuantity(productPassId, productId);
        } else if (pricing.isUsage()) {
            price = _getUsageBasedCost(productPassId, pricing);
        } else {
            revert InvalidChargeStyle(pricing.chargeStyle);
        }

        _emitCycleUpdated(productPassId, productId);
    }

    function _advanceSub(Subscription storage sub) internal {
        uint256 cycleDuration = IPricingRegistry(registry.pricingRegistry())
            .getCycleDuration(sub.pricingId);

        sub.startDate = block.timestamp;
        sub.endDate = Math.max(sub.endDate, block.timestamp) + cycleDuration;
    }

    function _getTieredCost(
        uint256 productPassId,
        uint256 productId,
        PricingUtils.Pricing memory pricing
    ) internal view returns (uint256) {
        UnitQuantity memory unitQuantity = unitQuantities[productPassId][
            productId
        ];

        if (unitQuantity.quantity == 0) {
            revert InvalidUnitQuantity(pricing.orgId, productPassId, productId);
        }

        return
            IPricingCalculator(registry.pricingCalculator()).getTotalCost(
                pricing.chargeStyle,
                pricing.tiers,
                pricing.flatPrice,
                unitQuantity.quantity
            );
    }

    function _getUsageBasedCost(
        uint256 productPassId,
        PricingUtils.Pricing memory pricing
    ) internal returns (uint256) {
        uint256 usage = IUsageRecorder(registry.usageRecorder())
            .processMeterPayment(pricing.usageMeterId, productPassId);

        return
            IPricingCalculator(registry.pricingCalculator()).getTotalCost(
                pricing.chargeStyle,
                pricing.tiers,
                pricing.flatPrice,
                usage
            );
    }

    /**
     * Change Pricing
     */

    function changeSubscriptionPricing(
        uint256 productPassId,
        uint256 productId,
        uint256 newPricingId,
        bool isPassOwner
    )
        external
        onlyRegistry(registry.purchaseManager())
        returns (address token, uint256 amount)
    {
        _checkSubExists(productPassId, productId);
        _checkSubNotCancelled(productPassId, productId);
        _checkSubNotPaused(productPassId, productId);
        _checkSubNotPastDue(productPassId, productId);

        if (isPassOwner) {
            _checkCanPassOwnerChangePricing(productPassId, productId);
        }

        (token, amount) = _changeSubPricing(
            productPassId,
            productId,
            newPricingId,
            unitQuantities[productPassId][productId].quantity
        );

        _syncMaxQuantity(productPassId, productId);

        emit SubscriptionPricingChanged(
            subs[productPassId][productId].orgId,
            productPassId,
            productId,
            newPricingId
        );

        _emitCycleUpdated(productPassId, productId);
    }

    function _changeSubPricing(
        uint256 productPassId,
        uint256 productId,
        uint256 newPricingId,
        uint256 quantity
    ) internal returns (address, uint256) {
        (
            uint256 newEndDate,
            address token,
            uint256 amount
        ) = IPricingCalculator(registry.pricingCalculator())
                .getChangeSubscriptionCost(
                    subs[productPassId][productId].pricingId,
                    newPricingId,
                    subs[productPassId][productId].startDate,
                    subs[productPassId][productId].endDate,
                    quantity
                );

        subs[productPassId][productId].pricingId = newPricingId;
        subs[productPassId][productId].endDate = newEndDate;

        return (token, amount);
    }

    function setOwnerChangePricing(
        uint256 orgId,
        bool canChange
    ) external onlyOrgAdmin(orgId) {
        ownerChangePricing[orgId] = canChange;

        emit OwnerChangePricingSet(orgId, canChange);
    }

    /**
     * Activation
     */

    function pauseSubscription(
        uint256 productPassId,
        uint256 productId,
        bool pause
    ) external onlyRegistry(registry.purchaseManager()) returns (bool) {
        _checkSubExists(productPassId, productId);

        if (pause) {
            _checkSubNotCancelled(productPassId, productId);
            _checkPausableOrg(subs[productPassId][productId].orgId);
        }

        _pauseSub(subs[productPassId][productId], pause);

        _emitCycleUpdated(productPassId, productId);

        return _isPastDue(subs[productPassId][productId]);
    }

    function setSubscriptionsPausable(
        uint256 orgId,
        bool _pausable
    ) external onlyOrgAdmin(orgId) {
        subscriptionsPauseable[orgId] = _pausable;

        emit SubscriptionPausableSet(orgId, _pausable);
    }

    function _pauseSub(Subscription storage sub, bool pause) internal {
        if (sub.isPaused == pause) {
            revert InvalidPauseState();
        }

        if (pause) {
            sub.timeRemaining = sub.endDate > block.timestamp
                ? sub.endDate - block.timestamp
                : 0;
            sub.isPaused = true;
            sub.startDate = 0;
            sub.endDate = Math.min(sub.endDate, block.timestamp);
        } else if (sub.timeRemaining > 0) {
            sub.startDate = block.timestamp;
            sub.endDate = block.timestamp + sub.timeRemaining;
            sub.timeRemaining = 0;
            sub.isPaused = false;
        } else {
            sub.startDate = 0;
            sub.endDate = 0;
            sub.timeRemaining = 0;
            sub.isPaused = false;
        }
    }

    /**
     * Unit Quantities
     */

    function getUnitQuantity(
        uint256 productPassId,
        uint256 productId
    ) external view returns (uint256) {
        return unitQuantities[productPassId][productId].quantity;
    }

    function getUnitQuantityFull(
        uint256 productPassId,
        uint256 productId
    ) external view returns (UnitQuantity memory) {
        return unitQuantities[productPassId][productId];
    }

    function changeSubscriptionUnitQuantity(
        uint256 productPassId,
        uint256 productId,
        uint256 quantity
    )
        external
        onlyRegistry(registry.purchaseManager())
        returns (address token, uint256 amount)
    {
        _checkSubExists(productPassId, productId);
        _checkSubNotCancelled(productPassId, productId);
        _checkSubNotPaused(productPassId, productId);
        _checkSubNotPastDue(productPassId, productId);
        _checkUnitQuantityExists(productPassId, productId);

        (token, amount) = IPricingCalculator(registry.pricingCalculator())
            .getChangeUnitQuantityCost(
                subs[productPassId][productId].pricingId,
                subs[productPassId][productId].startDate,
                subs[productPassId][productId].endDate,
                unitQuantities[productPassId][productId].quantity,
                quantity
            );

        if (quantity <= unitQuantities[productPassId][productId].maxQuantity) {
            amount = 0;
        }

        _setUnitQuantity(productPassId, productId, quantity);

        emit UnitQuantitySet(
            productPassId,
            productId,
            quantity,
            unitQuantities[productPassId][productId].maxQuantity
        );
    }

    function _createUnitQuantity(
        uint256 orgId,
        uint256 productPassId,
        uint256 productId,
        uint256 quantity
    ) internal {
        unitQuantities[productPassId][productId].orgId = orgId;
        _setUnitQuantity(productPassId, productId, quantity);
    }

    function _setUnitQuantity(
        uint256 productPassId,
        uint256 productId,
        uint256 quantity
    ) internal {
        _checkMinUnitQuantity(quantity);

        UnitQuantity storage unitQuantity = unitQuantities[productPassId][
            productId
        ];

        unitQuantity.quantity = quantity;

        if (quantity > unitQuantity.maxQuantity) {
            unitQuantity.maxQuantity = quantity;
        }
    }

    function _syncMaxQuantity(
        uint256 productPassId,
        uint256 productId
    ) internal {
        UnitQuantity storage unitQuantity = unitQuantities[productPassId][
            productId
        ];

        unitQuantity.maxQuantity = unitQuantity.quantity;
    }

    /**
     * Cancellation
     */

    function cancelSubscription(
        uint256 productPassId,
        uint256 productId,
        bool cancel
    ) external onlyRegistry(registry.purchaseManager()) returns (bool) {
        _checkSubExists(productPassId, productId);
        _checkSubNotPaused(productPassId, productId);

        if (cancel) {
            _checkSubNotPastDue(productPassId, productId);
        }

        require(
            subs[productPassId][productId].isCancelled != cancel,
            "Subscription cancel status is already set"
        );

        subs[productPassId][productId].isCancelled = cancel;

        _emitCycleUpdated(productPassId, productId);

        return _isPastDue(subs[productPassId][productId]);
    }

    /**
     * Transferability
     */

    function isTransferable(
        uint256 productPassId,
        uint256[] calldata productIds
    ) external view returns (bool) {
        for (uint256 i = 0; i < productIds.length; i++) {
            if (
                _subExists(productPassId, productIds[i]) &&
                !subs[productPassId][productIds[i]].isPaused
            ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Helpers
     */

    function _isPastDue(Subscription memory sub) internal view returns (bool) {
        return sub.endDate < block.timestamp;
    }

    function _subExists(
        uint256 productPassId,
        uint256 productId
    ) internal view returns (bool) {
        return subs[productPassId][productId].pricingId > 0;
    }

    function _unitQuantityExists(
        uint256 productPassId,
        uint256 productId
    ) internal view returns (bool) {
        return unitQuantities[productPassId][productId].orgId > 0;
    }

    function _emitCycleUpdated(
        uint256 productPassId,
        uint256 productId
    ) internal {
        Subscription memory sub = subs[productPassId][productId];
        emit SubscriptionCycleUpdated(
            sub.orgId,
            productPassId,
            productId,
            _getSubStatus(sub),
            sub.startDate,
            sub.endDate
        );
    }

    /**
     * Checks
     */

    function _checkSubExists(
        uint256 productPassId,
        uint256 productId
    ) internal view {
        require(
            _subExists(productPassId, productId),
            "Subscription does not exist"
        );
    }

    function _checkSubNotPaused(
        uint256 productPassId,
        uint256 productId
    ) internal view {
        require(
            !subs[productPassId][productId].isPaused,
            "Subscription is paused"
        );
    }

    function _checkPausableOrg(uint256 orgId) internal view {
        require(
            subscriptionsPauseable[orgId],
            "Subscriptions are not pausable"
        );
    }

    function _checkSubNotCancelled(
        uint256 productPassId,
        uint256 productId
    ) internal view {
        require(
            !subs[productPassId][productId].isCancelled,
            "Subscription is cancelled"
        );
    }

    function _checkSubPastDue(
        uint256 productPassId,
        uint256 productId
    ) internal view {
        require(
            _isPastDue(subs[productPassId][productId]),
            "Subscription is not past due"
        );
    }

    function _checkSubNotPastDue(
        uint256 productPassId,
        uint256 productId
    ) internal view {
        require(
            !_isPastDue(subs[productPassId][productId]),
            "Subscription is past due"
        );
    }

    function _checkCanPassOwnerChangePricing(
        uint256 productPassId,
        uint256 productId
    ) internal view {
        require(
            ownerChangePricing[subs[productPassId][productId].orgId],
            "Organization does not allow pass owners to change pricing"
        );
    }

    function _checkMinUnitQuantity(uint256 quantity) internal pure {
        require(quantity > 0, "Unit quantity is 0");
    }

    function _checkUnitQuantityExists(
        uint256 productPassId,
        uint256 productId
    ) internal view {
        require(
            _unitQuantityExists(productPassId, productId),
            "Unit quantity does not exist"
        );
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(ISubscriptionEscrow).interfaceId ||
            interfaceId == type(ISubscriptionTransferOracle).interfaceId;
    }
}
