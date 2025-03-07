// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {PricingUtils} from "../libs/PricingUtils.sol";

interface IPricingRegistry {
    /**
     * Errors
     */

    /**
     * @notice Thrown when a pricing configuration is not owned by the organization.
     */
    error PricingNotAuthorized();

    /**
     * @notice Thrown when a pricing configuration is inactive.
     */
    error PricingInactive();

    /**
     * @notice Thrown during checkout validation when multiple pricing configurations have different tokens.
     */
    error PricingTokensMismatch();

    /**
     * @notice Thrown when a pricing configuration is restricted and the product pass owner does not have access.
     */
    error PricingRestrictedAccess();

    /**
     * @notice Thrown when a pricing configuration with usage based charge style required.
     */
    error RequiresUsageChargeStyle();

    /**
     * @notice Thrown when a pricing configuration is not a one time or flat rate charge style.
     */
    error RequiresOneTimeOrFlatRateChargeStyle();

    /**
     * @notice Thrown when a pricing configuration is not an ERC20 token.
     */
    error RequiresERC20Token();

    /**
     * @notice Thrown when a pricing configuration is not whitelisted.
     */
    error TokenNotWhitelisted();

    /**
     * @notice InvalidTiers is an error that is thrown when the tiers are found to be invalid during validation.
     */
    error InvalidTiers();

    /**
     * @notice Thrown when a pricing configuration is not found.
     */
    error PricingNotFound();

    /**
     * @notice Thrown during checkout validation when a pricing configuration has an invalid quantity for a non tiered pricing configuration.
     * @dev All pricing charge styles except TIERED_VOLUME and TIERED_GRADUATED must have a quantity of 0.
     */
    error InvalidQuantity();

    /**
     * Checkout
     */

    /**
     * Confirm that the pricing configuration can be used in a checkout.
     * @param _organizationId The organization ID to validate the pricing configuration for.
     * @param _productPassOwner The product pass owner to validate the pricing configuration for.
     * @param _pricingId The pricing ID to validate.
     * @param _quantity The quantity to validate. Must be 0 unless the pricing configuration is a TIERED_VOLUME or TIERED_GRADUATED charge style.
     * @return cycleDuration The cycle duration for the pricing configuration.
     */
    function validateCheckout(
        uint256 _organizationId,
        address _productPassOwner,
        uint256 _pricingId,
        uint256 _quantity
    ) external view returns (uint256 cycleDuration);

    /**
     * @notice Confirm that all the pricing configurations exist, are active, and have the same token for an organization.
     * @dev Reverts if the pricing configuration is not valid to be used in a checkout.
     * @param _organizationId The organization ID to validate the pricing configuration for.
     * @param _productPassOwner The product pass owner to validate the pricing configuration for.
     * @param _pricingIds The pricing IDs to validate.
     * @param _quantities The quantities to validate. Must be 0 unless the pricing configuration is a TIERED_VOLUME or TIERED_GRADUATED charge style.
     * @return token The token to use for the checkout.
     * @return cycleDurations The cycle durations for the pricing configurations.
     */
    function validateCheckoutBatch(
        uint256 _organizationId,
        address _productPassOwner,
        uint256[] calldata _pricingIds,
        uint256[] calldata _quantities
    ) external view returns (address token, uint256[] memory cycleDurations);

    /**
     * @notice Validate the pricing configurations exist for an organization.
     * @dev Reverts if any of the pricing configurations do not exist for the organization.
     * @param _organizationId The organization ID to validate the pricing configurations for.
     * @param _pricingIds The pricing IDs to validate.
     */
    function validateOrgPricing(
        uint256 _organizationId,
        uint256[] calldata _pricingIds
    ) external view;

    /**
     * Get Pricing Details
     */

    /**
     * @notice Get the pricing details for a pricing configuration.
     * @dev Reverts if the pricing configuration does not exist.
     * @param pricingId The pricing ID to get the pricing details for.
     * @return pricing The pricing details for the pricing configuration.
     */
    function getPricing(
        uint256 pricingId
    ) external view returns (PricingUtils.Pricing memory);

    /**
     * @notice Get the pricing details for a batch of pricing configurations.
     * @param _pricingIds The pricing IDs to get the pricing details for.
     * @return _pricing The pricing details for the pricing configurations.
     */
    function getPricingBatch(
        uint256[] memory _pricingIds
    ) external view returns (PricingUtils.Pricing[] memory _pricing);

    /**
     * @notice Get all pricing IDs for an organization.
     * @param organizationId The organization ID to get the pricing IDs for.
     * @return pricingIds The pricing IDs for the organization.
     */
    function getOrgPricingIds(
        uint256 organizationId
    ) external view returns (uint256[] memory);

    /**
     * @notice Get all pricing details for an organization.
     * @param organizationId The organization ID to get the pricing details for.
     * @return pricingIds The pricing IDs for the organization.
     * @return pricing The pricing details for the pricing configurations.
     */
    function getOrgPricing(
        uint256 organizationId
    ) external view returns (uint256[] memory, PricingUtils.Pricing[] memory);

    /**
     * Restricted Access
     */

    /**
     * @notice Get the restricted access for a pricing configuration.
     * @param pricingId The pricing ID to get the restricted access for.
     * @param productPassOwner The product pass owner to get the restricted access for.
     * @return isRestricted True if the address has restricted access, false otherwise.
     */
    function restrictedAccess(
        uint256 pricingId,
        address productPassOwner
    ) external view returns (bool);

    /**
     * @notice Grant restricted access to a pricing configuration.
     * @param pricingId The pricing ID to grant restricted access to.
     * @param productPassOwners The product pass owners to grant restricted access to.
     * @param isRestricted True if the address has restricted access, false otherwise.
     */
    function setRestrictedAccess(
        uint256 pricingId,
        address[] calldata productPassOwners,
        bool[] calldata isRestricted
    ) external;

    /**
     * Pricing Creation
     */

    /**
     * @notice Emitted when a pricing configuration is created.
     * @param organizationId The organization ID that the pricing configuration belongs to.
     * @param pricingId The pricing ID that was created.
     */
    event PricingCreated(
        uint256 indexed organizationId,
        uint256 indexed pricingId
    );

    /**
     * @notice Parameters for creating a one time pricing configuration.
     * @param organizationId The organization ID that the pricing configuration belongs to.
     * @param flatPrice The price for the one time purchase.
     * @param token The token to use for the one time purchase. address(0) to use the native token.
     * @param isRestricted Whether the pricing configuration is restricted to only addresses with restricted access.
     */
    struct CreateOneTimeParams {
        uint256 organizationId;
        uint256 flatPrice;
        address token;
        bool isRestricted;
    }

    /**
     * @notice Create a one time pricing configuration.
     * @param params The parameters for the one time pricing configuration.
     */
    function createOneTimePricing(CreateOneTimeParams calldata params) external;

    /**
     * @notice Parameters for creating a flat rate recurring subscription pricing configuration.
     * @param organizationId The organization ID that the pricing configuration belongs to.
     * @param flatPrice The price for the subscription.
     * @param token The token to use for the subscription. address(0) to use the native token.
     * @param chargeFrequency The frequency of the subscription that it is charged.
     * @param isRestricted Whether the pricing configuration is restricted to only addresses with restricted access.
     */
    struct CreateFlatRateSubscriptionParams {
        uint256 organizationId;
        uint256 flatPrice;
        address token;
        PricingUtils.ChargeFrequency chargeFrequency;
        bool isRestricted;
    }

    /**
     * @notice Create a flat rate recurring subscription pricing configuration.
     * @param params The parameters for the flat rate recurring subscription pricing configuration.
     */
    function createFlatRateSubscriptionPricing(
        CreateFlatRateSubscriptionParams calldata params
    ) external;

    /**
     * @notice Parameters for creating a tiered subscription pricing configuration.
     * @param organizationId The organization ID that the pricing configuration belongs to.
     * @param token The token to use for the subscription. address(0) to use the native token.
     * @param chargeFrequency The frequency of the subscription that it is charged.
     * @param tiers The tiers of the subscription.
     * @param isVolume Whether the tiers are volume tiers or graduated tiers.
     * @param isRestricted Whether the pricing configuration is restricted to only addresses with restricted access.
     */
    struct CreateTieredSubscriptionParams {
        uint256 organizationId;
        address token;
        PricingUtils.ChargeFrequency chargeFrequency;
        PricingUtils.PricingTier[] tiers;
        bool isVolume;
        bool isRestricted;
    }

    /**
     * @notice Create a tiered subscription pricing configuration.
     * @param params The parameters for the tiered subscription pricing configuration.
     */
    function createTieredSubscriptionPricing(
        CreateTieredSubscriptionParams calldata params
    ) external;

    /**
     * @notice Parameters for creating a usage based subscription pricing configuration.
     * @dev The usage meter ID is the ID of the usage meter that the subscription is based on.
     * @param organizationId The organization ID that the pricing configuration belongs to.
     * @param token The token to use for the subscription. address(0) to use the native token.
     * @param chargeFrequency The frequency of the subscription that it is charged.
     * @param tiers The tiers of the subscription.
     * @param usageMeterId The usage meter ID that the subscription is based on.
     * @param isVolume Whether the tiers are volume tiers or graduated tiers.
     * @param isRestricted Whether the pricing configuration is restricted to only addresses with restricted access.
     */
    struct CreateUsageBasedSubscriptionParams {
        uint256 organizationId;
        address token;
        PricingUtils.ChargeFrequency chargeFrequency;
        PricingUtils.PricingTier[] tiers;
        uint256 usageMeterId;
        bool isVolume;
        bool isRestricted;
    }

    /**
     * @notice Create a usage based subscription pricing configuration.
     * @param params The parameters for the usage based subscription pricing configuration.
     */
    function createUsageBasedSubscriptionPricing(
        CreateUsageBasedSubscriptionParams calldata params
    ) external;

    /**
     * Pricing Updates
     */

    /**
     * @notice Emitted when a pricing configuration is updated.
     * @param organizationId The organization ID that the pricing configuration belongs to.
     * @param pricingId The pricing ID that was updated.
     */
    event PricingUpdated(
        uint256 indexed organizationId,
        uint256 indexed pricingId
    );

    /**
     * @notice Emitted when a pricing status is changed.
     * @param organizationId The organization ID that the pricing configuration belongs to.
     * @param pricingId The pricing ID that was updated.
     * @param isActive The new status of the pricing configuration.
     */
    event PricingStatusChanged(
        uint256 indexed organizationId,
        uint256 indexed pricingId,
        bool isActive
    );

    /**
     * @notice Emitted when restricted access is granted or revoked to a pricing configuration.
     * @param organizationId The organization ID that the pricing configuration belongs to.
     * @param pricingId The pricing ID that the restricted access was granted to.
     * @param productPassOwner The product pass owner that the restricted access was granted to.
     * @param isRestricted True if the address has restricted access, false otherwise.
     */
    event RestrictedAccessGranted(
        uint256 indexed organizationId,
        uint256 indexed pricingId,
        address indexed productPassOwner,
        bool isRestricted
    );

    /**
     * @notice Set the tiers for TIERED or USAGE_BASED pricing configuration.
     * @dev Reverts if the pricing configuration is not a TIERED or USAGE_BASED charge style.
     * @param pricingId The pricing ID that the tiers are being set for.
     * @param tiers The tiers to set for the pricing configuration.
     */
    function setPricingTiers(
        uint256 pricingId,
        PricingUtils.PricingTier[] calldata tiers
    ) external;

    /**
     * @notice Validate the tiers for a pricing configuration.
     * @param tiers The tiers to validate.
     * @param chargeStyle The charge style of the pricing configuration.
     * @return isValid True if the tiers are valid, false otherwise.
     */
    function validateTiers(
        PricingUtils.PricingTier[] calldata tiers,
        PricingUtils.ChargeStyle chargeStyle
    ) external pure returns (bool);

    /**
     * @notice Set the token for a pricing configuration.
     * @param pricingId The pricing ID that the token is being set for.
     * @param token The token to set for the pricing configuration. address(0) to switch back to native token.
     */
    function setPricingToken(uint256 pricingId, address token) external;

    /**
     * @notice Set the flat price for a pricing configuration.
     * @dev Reverts if the pricing configuration is not a ONE_TIME or FLAT_RATE charge style.
     * @param pricingId The pricing ID that the flat price is being set for.
     * @param flatPrice The flat price to set for the pricing configuration.
     */
    function setPricingFlatPrice(uint256 pricingId, uint256 flatPrice) external;

    /**
     * @notice Set the usage meter ID for a pricing configuration.
     * @dev Reverts if the pricing configuration is not a USAGE_BASED_VOLUME or USAGE_BASED_GRADUATED charge style.
     * @param pricingId The pricing ID that the usage meter ID is being set for.
     * @param usageMeterId The usage meter ID to set for the pricing configuration.
     */
    function setPricingUsageMeterId(
        uint256 pricingId,
        uint256 usageMeterId
    ) external;

    /**
     * @notice Set the active status for a pricing configuration.
     * @dev Pricing must be active to be used in a checkout.
     * @param pricingId The pricing ID that the active status is being set for.
     * @param isActive The new active status of the pricing configuration.
     */
    function setPricingActive(uint256 pricingId, bool isActive) external;

    /**
     * @notice Set the restricted status for a pricing configuration.
     * @dev If pricing is restricted, then only addresses with restricted access can purchase using pricing configuration.
     * @param pricingId The pricing ID that the restricted status is being set for.
     * @param isRestricted True if the pricing configuration is restricted, false otherwise.
     */
    function setPricingRestricted(
        uint256 pricingId,
        bool isRestricted
    ) external;

    /**
     * Pricing Cycle Duration
     */

    /**
     * @notice Get the cycle duration for a pricing configuration.
     * @param pricingId The pricing ID to get the cycle duration for.
     * @return cycleDuration The cycle duration for the pricing configuration.
     */
    function getCycleDuration(
        uint256 pricingId
    ) external view returns (uint256);

    /**
     * @notice Get the cycle duration for a batch of pricing configurations.
     * @param _pricingIds The pricing IDs to get the cycle duration for.
     * @return cycleDurations The cycle durations for the pricing configurations.
     */
    function getCycleDurationBatch(
        uint256[] calldata _pricingIds
    ) external view returns (uint256[] memory cycleDurations);

    /**
     * @notice Get the cycle duration for a charge frequency.
     * @param chargeFrequency The charge frequency to get the cycle duration for.
     * @return cycleDuration The cycle duration for the charge frequency.
     */
    function getChargeFrequencyCycleDuration(
        PricingUtils.ChargeFrequency chargeFrequency
    ) external pure returns (uint256);
}
