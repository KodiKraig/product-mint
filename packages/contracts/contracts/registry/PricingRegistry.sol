// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {PricingUtils} from "../libs/PricingUtils.sol";
import {IUsageRecorder} from "../usage/IUsageRecorder.sol";
import {IPricingRegistry} from "./IPricingRegistry.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPaymentEscrow} from "../escrow/IPaymentEscrow.sol";

/**
 * @title PricingRegistry
 * @notice A contract that manages pricing models created by organizations.
 *
 * Once a new pricing model is created it can be linked to products to be used during checkouts and renewals.
 *
 * When pricing models are created they are active by default and ready for use.
 * You can deactivate pricing models that you don't want to be available for purchase but
 * keep in mind that if a pricing model is on a product that has an active subscription,
 * renewals will still continue to work.
 *
 * Pricing models can be restricted to certain product pass owners.
 *
 * _Charge Style_
 * Products can have multiple linked pricing models but keep in mind that
 * once a product is purchased, the model can only be changed to a different pricing model
 * if the new pricing model has the same charge style.
 *
 * Pricing models can be one time, recurring, or usage based charge styles.
 * There are 6 different pricing models:
 * - ONE_TIME
 *  Only available for a single purchase with no recurring subscription.
 * - FLAT_RATE
 *  Fixed price for a recurring subscription.
 * - TIERED_VOLUME
 *  Tiers with different prices for different quantities of units.
 *  Final tier reached is used for all units.
 *  Billed at the start of the period.
 * - TIERED_GRADUATED
 *  Tiers with different prices for different quantities of units.
 *  Tiers apply progressively.
 *  Billed at the start of the period.
 * - USAGE_BASED_VOLUME
 *  Tiers based on usage recorded within the billing period.
 *  Final tier reached is used for all units.
 *  Billed at the end of the period.
 * - USAGE_BASED_GRADUATED
 *  Tiers based on usage recorded within the billing period.
 *  Tiers apply progressively.
 *  Billed at the end of the period.
 *
 * _Charge Frequency_
 * The charge frequency is the frequency at which the pricing model is charged.
 * The charge frequency can be daily, weekly, monthly, quarterly, or yearly.
 *
 */
contract PricingRegistry is RegistryEnabled, IPricingRegistry, IERC165 {
    using EnumerableSet for EnumerableSet.UintSet;
    using PricingUtils for PricingUtils.Pricing;

    // Organization ID => Pricing IDs
    mapping(uint256 => EnumerableSet.UintSet) private pricingIds;

    // Pricing ID -> Pricing
    mapping(uint256 => PricingUtils.Pricing) private pricing;

    // Pricing ID -> Product Pass Owner -> Does the owner have restricted access?
    mapping(uint256 => mapping(address => bool)) public restrictedAccess;

    // Total pricing supply
    uint256 public pricingSupply;

    constructor(address _contractRegistry) RegistryEnabled(_contractRegistry) {}

    /**
     * Checkout
     */

    function validateCheckout(
        uint256 _organizationId,
        address _productPassOwner,
        uint256 _pricingId,
        uint256 _quantity
    ) public view returns (uint256 cycleDuration) {
        if (!pricingIds[_organizationId].contains(_pricingId)) {
            revert PricingNotAuthorized();
        }

        if (!pricing[_pricingId].isActive) {
            revert PricingInactive();
        }

        if (
            pricing[_pricingId].isRestricted &&
            !restrictedAccess[_pricingId][_productPassOwner]
        ) {
            revert PricingRestrictedAccess();
        }

        if (pricing[_pricingId].isTiered()) {
            if (_quantity == 0) {
                revert InvalidQuantity();
            }
        } else if (_quantity > 0) {
            revert InvalidQuantity();
        }

        cycleDuration = _getCycleDuration(pricing[_pricingId]);
    }

    function validateCheckoutBatch(
        uint256 _organizationId,
        address _productPassOwner,
        uint256[] calldata _pricingIds,
        uint256[] calldata _quantities
    ) external view returns (address token, uint256[] memory cycleDurations) {
        require(_pricingIds.length > 0, "No pricing IDs provided");
        require(
            _pricingIds.length == _quantities.length,
            "Pricing ID and quantity length mismatch"
        );

        token = pricing[_pricingIds[0]].token;
        cycleDurations = new uint256[](_pricingIds.length);

        for (uint256 i = 0; i < _pricingIds.length; i++) {
            cycleDurations[i] = validateCheckout(
                _organizationId,
                _productPassOwner,
                _pricingIds[i],
                _quantities[i]
            );

            if (pricing[_pricingIds[i]].token != token) {
                revert PricingTokensMismatch();
            }
        }
    }

    function validateOrgPricing(
        uint256 _organizationId,
        uint256[] calldata _pricingIds
    ) external view {
        for (uint256 i = 0; i < _pricingIds.length; i++) {
            if (!pricingIds[_organizationId].contains(_pricingIds[i])) {
                revert PricingNotAuthorized();
            }
        }
    }

    /**
     * Get Pricing Details
     */

    function getPricing(
        uint256 pricingId
    ) public view returns (PricingUtils.Pricing memory) {
        require(
            pricingId > 0 && pricingId <= pricingSupply,
            "Pricing not found"
        );
        return pricing[pricingId];
    }

    function getPricingBatch(
        uint256[] memory _pricingIds
    ) public view returns (PricingUtils.Pricing[] memory _pricing) {
        _pricing = new PricingUtils.Pricing[](_pricingIds.length);

        for (uint256 i = 0; i < _pricingIds.length; i++) {
            _pricing[i] = getPricing(_pricingIds[i]);
        }
    }

    function getOrgPricingIds(
        uint256 organizationId
    ) external view returns (uint256[] memory) {
        return pricingIds[organizationId].values();
    }

    function getOrgPricing(
        uint256 organizationId
    ) external view returns (uint256[] memory, PricingUtils.Pricing[] memory) {
        uint256[] memory _pricingIds = pricingIds[organizationId].values();
        return (_pricingIds, getPricingBatch(_pricingIds));
    }

    /**
     * Restricted Access
     */

    function setRestrictedAccess(
        uint256 pricingId,
        address[] calldata productPassOwners,
        bool[] calldata isRestricted
    ) external onlyOrgAdmin(pricing[pricingId].orgId) {
        require(
            productPassOwners.length > 0 &&
                productPassOwners.length == isRestricted.length,
            "Incorrect lengths"
        );

        for (uint256 i = 0; i < productPassOwners.length; i++) {
            restrictedAccess[pricingId][productPassOwners[i]] = isRestricted[i];

            emit RestrictedAccessGranted(
                pricing[pricingId].orgId,
                pricingId,
                productPassOwners[i],
                isRestricted[i]
            );
        }
    }

    /**
     * Pricing Creation
     */

    function createOneTimePricing(
        CreateOneTimeParams calldata params
    ) external onlyOrgAdmin(params.organizationId) {
        _createPricing(
            params.organizationId,
            params.token,
            PricingUtils.ChargeStyle.ONE_TIME,
            PricingUtils.ChargeFrequency.DAILY, // Ignored for one-time pricing
            params.isRestricted
        );

        pricing[pricingSupply].flatPrice = params.flatPrice;

        emit PricingCreated(params.organizationId, pricingSupply);
    }

    function createFlatRateSubscriptionPricing(
        CreateFlatRateSubscriptionParams calldata params
    ) external onlyOrgAdmin(params.organizationId) {
        _createPricing(
            params.organizationId,
            params.token,
            PricingUtils.ChargeStyle.FLAT_RATE,
            params.chargeFrequency,
            params.isRestricted
        );

        pricing[pricingSupply].flatPrice = params.flatPrice;

        emit PricingCreated(params.organizationId, pricingSupply);
    }

    function createTieredSubscriptionPricing(
        CreateTieredSubscriptionParams calldata params
    ) external onlyOrgAdmin(params.organizationId) {
        _createPricing(
            params.organizationId,
            params.token,
            params.isVolume
                ? PricingUtils.ChargeStyle.TIERED_VOLUME
                : PricingUtils.ChargeStyle.TIERED_GRADUATED,
            params.chargeFrequency,
            params.isRestricted
        );

        _setPricingTiers(pricingSupply, params.tiers);

        emit PricingCreated(params.organizationId, pricingSupply);
    }

    function createUsageBasedSubscriptionPricing(
        CreateUsageBasedSubscriptionParams calldata params
    ) external onlyOrgAdmin(params.organizationId) {
        _createPricing(
            params.organizationId,
            params.token,
            params.isVolume
                ? PricingUtils.ChargeStyle.USAGE_BASED_VOLUME
                : PricingUtils.ChargeStyle.USAGE_BASED_GRADUATED,
            params.chargeFrequency,
            params.isRestricted
        );

        _setPricingTiers(pricingSupply, params.tiers);

        _setPricingUsageMeterId(pricingSupply, params.usageMeterId);

        emit PricingCreated(params.organizationId, pricingSupply);
    }

    function _createPricing(
        uint256 organizationId,
        address token,
        PricingUtils.ChargeStyle chargeStyle,
        PricingUtils.ChargeFrequency chargeFrequency,
        bool isRestricted
    ) internal {
        pricingSupply++;

        pricing[pricingSupply].orgId = organizationId;
        pricing[pricingSupply].chargeStyle = chargeStyle;
        pricing[pricingSupply].chargeFrequency = chargeFrequency;
        pricing[pricingSupply].isRestricted = isRestricted;
        pricing[pricingSupply].isActive = true;

        _setPricingToken(pricingSupply, token);

        pricingIds[organizationId].add(pricingSupply);
    }

    /**
     * Pricing Updates
     */

    function setPricingTiers(
        uint256 pricingId,
        PricingUtils.PricingTier[] calldata tiers
    ) external onlyOrgAdmin(pricing[pricingId].orgId) {
        _setPricingTiers(pricingId, tiers);

        emit PricingUpdated(pricing[pricingId].orgId, pricingId);
    }

    function _setPricingTiers(
        uint256 pricingId,
        PricingUtils.PricingTier[] calldata tiers
    ) internal {
        if (!validateTiers(tiers, pricing[pricingId].chargeStyle)) {
            revert InvalidTiers();
        }

        delete pricing[pricingId].tiers;

        for (uint256 i = 0; i < tiers.length; i++) {
            pricing[pricingId].tiers.push(tiers[i]);
        }
    }

    function validateTiers(
        PricingUtils.PricingTier[] calldata tiers,
        PricingUtils.ChargeStyle chargeStyle
    ) public pure returns (bool) {
        if (tiers.length == 0) {
            return false;
        }

        if (
            chargeStyle == PricingUtils.ChargeStyle.TIERED_VOLUME ||
            chargeStyle == PricingUtils.ChargeStyle.USAGE_BASED_VOLUME
        ) {
            if (tiers[0].lowerBound != 1) {
                return false;
            }
        } else if (
            chargeStyle == PricingUtils.ChargeStyle.TIERED_GRADUATED ||
            chargeStyle == PricingUtils.ChargeStyle.USAGE_BASED_GRADUATED
        ) {
            if (tiers[0].lowerBound != 0) {
                return false;
            }
        } else {
            return false;
        }

        for (uint256 i = 0; i < tiers.length; i++) {
            if (i > 0 && tiers[i].lowerBound != tiers[i - 1].upperBound + 1) {
                return false;
            }

            if (i == tiers.length - 1) {
                if (tiers[i].upperBound != 0) {
                    // Last tier should be 0 and represent infinity
                    return false;
                }
                break;
            }

            if (tiers[i].lowerBound > tiers[i].upperBound) {
                return false;
            }
        }

        return true;
    }

    function setPricingToken(
        uint256 pricingId,
        address token
    ) external onlyOrgAdmin(pricing[pricingId].orgId) {
        _setPricingToken(pricingId, token);

        emit PricingUpdated(pricing[pricingId].orgId, pricingId);
    }

    function _setPricingToken(uint256 pricingId, address token) internal {
        if (
            token == address(0) &&
            pricing[pricingId].chargeStyle != PricingUtils.ChargeStyle.ONE_TIME
        ) {
            // We cannot do recurring charges with a native token
            // If you want to use a native token, consider using a wrapped ERC20 token
            revert RequiresERC20Token();
        }

        if (token != address(0)) {
            if (!IERC165(token).supportsInterface(type(IERC20).interfaceId)) {
                revert RequiresERC20Token();
            }

            if (
                !IPaymentEscrow(registry.paymentEscrow()).whitelistedTokens(
                    token
                )
            ) {
                revert TokenNotWhitelisted();
            }
        }

        pricing[pricingId].token = token;
    }

    function setPricingFlatPrice(
        uint256 pricingId,
        uint256 flatPrice
    ) external onlyOrgAdmin(pricing[pricingId].orgId) {
        if (
            pricing[pricingId].chargeStyle !=
            PricingUtils.ChargeStyle.ONE_TIME &&
            pricing[pricingId].chargeStyle != PricingUtils.ChargeStyle.FLAT_RATE
        ) {
            revert RequiresOneTimeOrFlatRateChargeStyle();
        }

        pricing[pricingId].flatPrice = flatPrice;

        emit PricingUpdated(pricing[pricingId].orgId, pricingId);
    }

    function setPricingUsageMeterId(
        uint256 pricingId,
        uint256 usageMeterId
    ) external onlyOrgAdmin(pricing[pricingId].orgId) {
        _setPricingUsageMeterId(pricingId, usageMeterId);

        emit PricingUpdated(pricing[pricingId].orgId, pricingId);
    }

    function _setPricingUsageMeterId(
        uint256 pricingId,
        uint256 usageMeterId
    ) internal {
        require(
            IUsageRecorder(registry.usageRecorder()).isActiveOrgMeter(
                usageMeterId
            ),
            "Usage meter not found"
        );

        if (!pricing[pricingId].isUsage()) {
            revert RequiresUsageChargeStyle();
        }

        pricing[pricingId].usageMeterId = usageMeterId;
    }

    function setPricingActive(
        uint256 pricingId,
        bool isActive
    ) external onlyOrgAdmin(pricing[pricingId].orgId) {
        pricing[pricingId].isActive = isActive;

        emit PricingStatusChanged(
            pricing[pricingId].orgId,
            pricingId,
            isActive
        );
    }

    function setPricingRestricted(
        uint256 pricingId,
        bool isRestricted
    ) external onlyOrgAdmin(pricing[pricingId].orgId) {
        pricing[pricingId].isRestricted = isRestricted;

        emit PricingUpdated(pricing[pricingId].orgId, pricingId);
    }

    /**
     * Pricing Cycle Duration
     */

    function getCycleDuration(
        uint256 pricingId
    ) external view returns (uint256) {
        return _getCycleDuration(getPricing(pricingId));
    }

    function getCycleDurationBatch(
        uint256[] calldata _pricingIds
    ) external view returns (uint256[] memory cycleDurations) {
        cycleDurations = new uint256[](_pricingIds.length);

        for (uint256 i = 0; i < _pricingIds.length; i++) {
            cycleDurations[i] = _getCycleDuration(getPricing(_pricingIds[i]));
        }

        return cycleDurations;
    }

    function _getCycleDuration(
        PricingUtils.Pricing memory _pricing
    ) internal pure returns (uint256) {
        if (_pricing.chargeStyle == PricingUtils.ChargeStyle.ONE_TIME) {
            return 0;
        }

        return getChargeFrequencyCycleDuration(_pricing.chargeFrequency);
    }

    function getChargeFrequencyCycleDuration(
        PricingUtils.ChargeFrequency chargeFrequency
    ) public pure returns (uint256) {
        if (chargeFrequency == PricingUtils.ChargeFrequency.DAILY) {
            return 1 days;
        }

        if (chargeFrequency == PricingUtils.ChargeFrequency.WEEKLY) {
            return 7 days;
        }

        if (chargeFrequency == PricingUtils.ChargeFrequency.MONTHLY) {
            return 30 days;
        }

        if (chargeFrequency == PricingUtils.ChargeFrequency.QUARTERLY) {
            return 90 days;
        }

        return 365 days; // Yearly
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IPricingRegistry).interfaceId;
    }
}
