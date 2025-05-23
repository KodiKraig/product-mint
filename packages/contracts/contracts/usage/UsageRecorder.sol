// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IUsageRecorder} from "./IUsageRecorder.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";

/*
 ____                 _            _   __  __ _       _   
|  _ \ _ __ ___   __| |_   _  ___| |_|  \/  (_)_ __ | |_ 
| |_) | '__/ _ \ / _` | | | |/ __| __| |\/| | | '_ \| __|
|  __/| | | (_) | (_| | |_| | (__| |_| |  | | | | | | |_ 
|_|   |_|  \___/ \__,_|\__,_|\___|\__|_|  |_|_|_| |_|\__|
 
 NFT based payment system to mint products onchain with one-time payments and 
 recurring permissionless subscriptions.

 https://productmint.io
*/

/**
 * @title UsageRecorder
 * @notice A contract for recording usage for product passes.
 * As an organization, you can create usage meters.
 * The usage meters can then be used to record usages to charge with usage based pricing models.
 *
 * The usages are processed and reset for you by our system during the subscription renewal process.
 */
contract UsageRecorder is RegistryEnabled, IUsageRecorder, IERC165 {
    using EnumerableSet for EnumerableSet.UintSet;

    // Organization token ID => Meter IDs
    // Meters owned by the organization based on the organization token ID.
    mapping(uint256 => EnumerableSet.UintSet) private organizations;

    // Meter ID => Usage Meter
    mapping(uint256 => UsageMeter) public usageMeters;

    // Meter ID => Product Pass Token ID => Usage Count
    mapping(uint256 => mapping(uint256 => uint256)) public passUsages;

    // Total meters created
    uint256 public totalMeterCount;

    constructor(address _contractRegistry) RegistryEnabled(_contractRegistry) {}

    function getOrganizationMeters(
        uint256 organizationId
    ) external view returns (uint256[] memory) {
        return organizations[organizationId].values();
    }

    function isActiveOrgMeter(uint256 meterId) external view returns (bool) {
        return
            organizations[usageMeters[meterId].orgId].contains(meterId) &&
            usageMeters[meterId].isActive;
    }

    /**
     * Create
     */

    function createMeter(
        uint256 organizationId,
        AggregationMethod aggregationMethod
    ) external onlyOrgAdmin(organizationId) {
        totalMeterCount++;

        usageMeters[totalMeterCount].orgId = organizationId;
        usageMeters[totalMeterCount].aggregationMethod = aggregationMethod;
        usageMeters[totalMeterCount].isActive = true;

        organizations[organizationId].add(totalMeterCount);

        emit MeterCreated(organizationId, totalMeterCount);
    }

    /**
     * Activate
     */

    function setMeterActive(
        uint256 meterId,
        bool isActive
    ) external onlyOrgAdminMeter(usageMeters[meterId].orgId, meterId) {
        usageMeters[meterId].isActive = isActive;

        emit MeterActiveSet(usageMeters[meterId].orgId, meterId, isActive);
    }

    /**
     * Count Meters
     */

    function incrementMeter(
        uint256 meterId,
        uint256 tokenId
    ) external onlyOrgAdminActiveMeter(usageMeters[meterId].orgId, meterId) {
        _checkCountMeter(meterId);

        _incrementMeter(meterId, tokenId);
    }

    function incrementMeterBatch(
        uint256 meterId,
        uint256[] memory tokenIds
    ) external onlyOrgAdminActiveMeter(usageMeters[meterId].orgId, meterId) {
        _checkCountMeter(meterId);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            _incrementMeter(meterId, tokenIds[i]);
        }
    }

    function _incrementMeter(uint256 meterId, uint256 tokenId) internal {
        passUsages[meterId][tokenId]++;

        emit MeterUsageSet(
            usageMeters[meterId].orgId,
            meterId,
            tokenId,
            passUsages[meterId][tokenId]
        );
    }

    /**
     * Sum Meters
     */

    function increaseMeter(
        uint256 meterId,
        uint256 tokenId,
        uint256 value
    ) external onlyOrgAdminActiveMeter(usageMeters[meterId].orgId, meterId) {
        _checkSumMeter(meterId);

        _increaseMeter(meterId, tokenId, value);
    }

    function increaseMeterBatch(
        uint256 meterId,
        uint256[] memory tokenIds,
        uint256[] memory values
    ) external onlyOrgAdminActiveMeter(usageMeters[meterId].orgId, meterId) {
        require(tokenIds.length > 0, "No token IDs provided");
        require(
            tokenIds.length == values.length,
            "Token IDs and values must be the same length"
        );

        _checkSumMeter(meterId);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            _increaseMeter(meterId, tokenIds[i], values[i]);
        }
    }

    function _increaseMeter(
        uint256 meterId,
        uint256 tokenId,
        uint256 value
    ) internal {
        passUsages[meterId][tokenId] += value;

        emit MeterUsageSet(
            usageMeters[meterId].orgId,
            meterId,
            tokenId,
            passUsages[meterId][tokenId]
        );
    }

    /**
     * Adjust
     */

    function adjustMeter(
        uint256 meterId,
        uint256 tokenId,
        uint256 value
    ) external onlyOrgAdminActiveMeter(usageMeters[meterId].orgId, meterId) {
        passUsages[meterId][tokenId] = value;

        emit MeterUsageSet(usageMeters[meterId].orgId, meterId, tokenId, value);
    }

    /**
     * Process payments
     */

    function processMeterPayment(
        uint256 meterId,
        uint256 tokenId
    )
        external
        onlyMeterProcessor(usageMeters[meterId].orgId, meterId)
        returns (uint256)
    {
        uint256 usage = passUsages[meterId][tokenId];
        passUsages[meterId][tokenId] = 0;

        emit MeterUsageSet(usageMeters[meterId].orgId, meterId, tokenId, 0);
        emit MeterPaymentProcessed(
            usageMeters[meterId].orgId,
            meterId,
            tokenId,
            usage
        );

        return usage;
    }

    /**
     * Meter Modifiers
     */

    function _checkOrgMeterExists(
        uint256 organizationId,
        uint256 meterId
    ) internal view {
        require(
            organizations[organizationId].contains(meterId),
            "Meter does not exist for the organization"
        );
    }

    modifier onlyOrgAdminActiveMeter(uint256 organizationId, uint256 meterId) {
        _checkOrgMeterExists(organizationId, meterId);
        _checkOrgAdmin(organizationId);
        require(usageMeters[meterId].isActive, "Meter is not active");
        _;
    }

    modifier onlyOrgAdminMeter(uint256 organizationId, uint256 meterId) {
        _checkOrgMeterExists(organizationId, meterId);
        _checkOrgAdmin(organizationId);
        _;
    }

    modifier onlyMeterProcessor(uint256 organizationId, uint256 meterId) {
        _checkOrgMeterExists(organizationId, meterId);
        _checkRegistry(registry.subscriptionEscrow());
        _;
    }

    /**
     * Checks
     */

    function _checkCountMeter(uint256 meterId) internal view {
        require(
            usageMeters[meterId].aggregationMethod == AggregationMethod.COUNT,
            "Meter is not a count meter"
        );
    }

    function _checkSumMeter(uint256 meterId) internal view {
        require(
            usageMeters[meterId].aggregationMethod == AggregationMethod.SUM,
            "Meter is not a sum meter"
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
            interfaceId == type(IUsageRecorder).interfaceId;
    }
}
