// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IUsageRecorder {
    /**
     * Usage Meters
     */

    /**
     * @notice The method of aggregation for the meter.
     * @param SUM The meter is aggregated by summing the values
     * @param COUNT The meter is aggregated by counting how many times the meter is incremented.
     */
    enum AggregationMethod {
        SUM,
        COUNT
    }

    /**
     * @notice The usage meter that can be attached to a product used for usage based charge styles.
     * @param aggregationMethod The method of aggregation for the meter.
     * @param isActive True if the meter is active and can be used, else False.
     * @param meters User Token ID => Total Usage.
     */
    struct UsageMeter {
        uint256 orgId;
        AggregationMethod aggregationMethod;
        bool isActive;
    }

    /**
     * Emitted when a new meter is created by an organization.
     * @param organizationId The ID of the organization.
     * @param meterId The ID of the meter.
     */
    event MeterCreated(uint256 indexed organizationId, uint256 indexed meterId);

    /**
     * Emitted when a meter is set to active or inactive.
     * @param organizationId The ID of the organization.
     * @param meterId The ID of the meter.
     * @param isActive The new active status of the meter.
     */
    event MeterActiveSet(
        uint256 indexed organizationId,
        uint256 indexed meterId,
        bool isActive
    );

    /**
     * Emitted when a meter usage is updated for a product pass token ID.
     * @param organizationId The ID of the organization.
     * @param meterId The ID of the meter.
     * @param tokenId The ID of the product pass token.
     * @param usage The new usage for the product pass token.
     */
    event MeterUsageSet(
        uint256 indexed organizationId,
        uint256 indexed meterId,
        uint256 indexed tokenId,
        uint256 usage
    );

    /**
     * Emitted when a meter payment is processed for a product pass token ID.
     * @notice Once the payment is processed, the usage is set to 0 which also emits a MeterUsageSet event.
     * @param organizationId The ID of the organization.
     * @param meterId The ID of the meter.
     * @param tokenId The ID of the product pass token.
     * @param usage The processed usage for the product pass token.
     */
    event MeterPaymentProcessed(
        uint256 indexed organizationId,
        uint256 indexed meterId,
        uint256 indexed tokenId,
        uint256 usage
    );

    /**
     * @notice Returns the meter for an organization.
     * @param meterId The ID of the meter.
     * @return orgId The ID of the organization.
     * @return aggregationMethod The method of aggregation for the meter.
     * @return isActive The active status of the meter.
     */
    function usageMeters(
        uint256 meterId
    )
        external
        view
        returns (
            uint256 orgId,
            AggregationMethod aggregationMethod,
            bool isActive
        );

    /**
     * @notice The usage for a product pass token ID.
     * @param meterId The ID of the meter.
     * @param tokenId The ID of the product pass token.
     * @return usage The current usage recorded for the product pass token.
     */
    function passUsages(
        uint256 meterId,
        uint256 tokenId
    ) external view returns (uint256);

    /**
     * @notice The total number of meters created.
     * @return totalMeterCount The total number of meters created.
     */
    function totalMeterCount() external view returns (uint256);

    /**
     * @notice Creates a new meter for an organization.
     * @param organizationId The ID of the organization.
     * @param aggregationMethod The method of aggregation for the meter.
     */
    function createMeter(
        uint256 organizationId,
        AggregationMethod aggregationMethod
    ) external;

    /**
     * @notice Sets the active status of a meter.
     * @dev Meters must be active in order to record usage.
     * @param meterId The ID of the meter.
     * @param isActive The new active status of the meter.
     */
    function setMeterActive(uint256 meterId, bool isActive) external;

    /**
     * @notice Increments a COUNT meter for a product pass token ID.
     * @param meterId The ID of the meter.
     * @param tokenId The ID of the product pass token.
     */
    function incrementMeter(uint256 meterId, uint256 tokenId) external;

    /**
     * @notice Increments a COUNT meter for a batch of product pass token IDs.
     * @param meterId The ID of the meter.
     * @param tokenIds The IDs of the product pass tokens.
     */
    function incrementMeterBatch(
        uint256 meterId,
        uint256[] memory tokenIds
    ) external;

    /**
     * @notice Increases a SUM meter for a product pass token ID.
     * @param meterId The ID of the meter.
     * @param tokenId The ID of the product pass token.
     * @param value The value to increment the meter by.
     */
    function increaseMeter(
        uint256 meterId,
        uint256 tokenId,
        uint256 value
    ) external;

    /**
     * @notice Increases a SUM meter for a batch of product pass token IDs.
     * @param meterId The ID of the meter.
     * @param tokenIds The IDs of the product pass tokens.
     * @param values The values to increment the meter by.
     */
    function increaseMeterBatch(
        uint256 meterId,
        uint256[] memory tokenIds,
        uint256[] memory values
    ) external;

    /**
     * @notice Adjusts a meter for a product pass token ID by setting a specific value. Useful for adjusting a meter if incorrect usage was recorded.
     * @param meterId The ID of the meter.
     * @param tokenId The ID of the product pass token.
     * @param value The new value for the meter.
     */
    function adjustMeter(
        uint256 meterId,
        uint256 tokenId,
        uint256 value
    ) external;

    /**
     * @notice Processes a meter payment for a product pass token ID by setting the usage back to 0.
     * @param meterId The ID of the meter.
     * @param tokenId The ID of the product pass token.
     * @return usage The previous usage for the product pass token.
     */
    function processMeterPayment(
        uint256 meterId,
        uint256 tokenId
    ) external returns (uint256);

    /**
     * @notice Returns all meters for an organization.
     * @param organizationId The ID of the organization.
     * @return meters The IDs of the meters under the organization's control.
     */
    function getOrganizationMeters(
        uint256 organizationId
    ) external view returns (uint256[] memory);

    /**
     * @notice Returns true if a meter is active for an organization.
     * @param meterId The ID of the meter.
     * @return isActive True if the meter is active, else False.
     */
    function isActiveOrgMeter(uint256 meterId) external view returns (bool);
}
