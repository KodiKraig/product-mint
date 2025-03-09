// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {MetadataUtils} from "../libs/MetadataUtils.sol";

/**
 * @title IMetadataProvider
 * @notice Interface for a metadata provider.
 *
 * Used to set custom metadata for an organization or default metadata for the contract.
 */
interface IMetadataProvider {
    /**
     * Custom Metadata
     */

    /**
     * @notice Emitted when custom metadata is updated for an organization.
     * @param organizationId The organization ID
     */
    event CustomMetadataUpdated(uint256 indexed organizationId);

    /**
     * @notice Get the custom metadata that has been set by an organization admin.
     * Orgs do not have to set custom metadata, and if they do not, the default metadata will be used.
     * If you only want to override a certain field, you can use the `setCustomMetadataField` function.
     * @param organizationId The organization ID
     * @return The custom metadata
     */
    function getCustomMetadata(
        uint256 organizationId
    ) external view returns (MetadataUtils.Metadata memory);

    /**
     * @notice Set all the custom metadata for an organization.
     * @param organizationId The organization ID
     * @param metadata The custom metadata
     */
    function setCustomMetadata(
        uint256 organizationId,
        MetadataUtils.Metadata memory metadata
    ) external;

    /**
     * @notice Set a specific field of the custom metadata for an organization.
     * @param organizationId The organization ID
     * @param field The field to set
     * @param value The value to set
     */
    function setCustomMetadataField(
        uint256 organizationId,
        MetadataUtils.Fields field,
        string memory value
    ) external;

    /**
     * Default Metadata
     */

    /**
     * @notice Emitted when default metadata is updated for the contract.
     */
    event DefaultMetadataUpdated();

    /**
     * @notice Get the default metadata that has been set by the contract owner.
     * @return The default metadata
     */
    function getDefaultMetadata()
        external
        view
        returns (MetadataUtils.Metadata memory);

    /**
     * @notice Set all the default metadata for the contract.
     * @dev This function is only callable by the contract owner.
     * @param metadata The default metadata
     */
    function setDefaultMetadata(
        MetadataUtils.Metadata memory metadata
    ) external;

    /**
     * @notice Set a specific field of the default metadata for the contract.
     * @dev This function is only callable by the contract owner.
     * @param field The field to set
     * @param value The value to set
     */
    function setDefaultMetadataField(
        MetadataUtils.Fields field,
        string memory value
    ) external;
}
