// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IMetadataProvider} from "./IMetadataProvider.sol";
import {ITokenMetadataProvider} from "../metadata/ITokenMetadataProvider.sol";
import {MetadataUtils} from "../libs/MetadataUtils.sol";
import {RegistryEnabled} from "./RegistryEnabled.sol";

/**
 * @title MetadataProvider
 * @notice A base contract to manage custom and default metadata for tokens with custom attributes.
 *
 * This contract takes care of ensuring the token Metadata URI is properly formed for OpenSea and other platforms.
 *
 * An organization admin can set custom metadata for their organization.
 *
 * Only the contract owner can set default metadata for all tokens.
 */
abstract contract MetadataProvider is
    Ownable2Step,
    RegistryEnabled,
    ITokenMetadataProvider,
    IERC165,
    IMetadataProvider
{
    using MetadataUtils for MetadataUtils.Metadata;
    using Strings for string;

    // Organization ID => Metadata
    mapping(uint256 => MetadataUtils.Metadata) private customMetadata;

    // Default metadata for all tokens when no custom metadata is set by the org admin
    MetadataUtils.Metadata private defaultMetadata;

    uint256[50] private __gap;

    /**
     * Custom Metadata
     */

    function getCustomMetadata(
        uint256 organizationId
    ) public view virtual returns (MetadataUtils.Metadata memory) {
        return customMetadata[organizationId];
    }

    function setCustomMetadataField(
        uint256 organizationId,
        MetadataUtils.Fields field,
        string memory value
    ) public virtual onlyOrgAdmin(organizationId) {
        customMetadata[organizationId].setByField(field, value);

        emit CustomMetadataUpdated(organizationId);
    }

    function setCustomMetadata(
        uint256 organizationId,
        MetadataUtils.Metadata memory metadata
    ) public virtual onlyOrgAdmin(organizationId) {
        customMetadata[organizationId].setAll(metadata);

        emit CustomMetadataUpdated(organizationId);
    }

    /**
     * Default Metadata
     */

    function getDefaultMetadata()
        public
        view
        virtual
        returns (MetadataUtils.Metadata memory)
    {
        return defaultMetadata;
    }

    function setDefaultMetadataField(
        MetadataUtils.Fields field,
        string memory value
    ) public virtual onlyOwner {
        defaultMetadata.setByField(field, value);

        emit DefaultMetadataUpdated();
    }

    function setDefaultMetadata(
        MetadataUtils.Metadata memory metadata
    ) public virtual onlyOwner {
        defaultMetadata.setAll(metadata);

        emit DefaultMetadataUpdated();
    }

    /**
     * ITokenMetadataProvider
     */

    /**
     * @dev These are the main properties in the metadata JSON.
     */
    function metadataForToken(
        uint256 tokenId
    ) internal view virtual returns (string memory) {
        return customMetadata[tokenId].toJSON(defaultMetadata);
    }

    /**
     * @dev These are the attributes in the metadata JSON that are specific to the token.
     */
    function attributesForToken(
        uint256 tokenId
    ) internal view virtual returns (string memory);

    function getTokenMetadata(
        uint256 tokenId
    ) external view virtual returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
            metadataForToken(tokenId),
            ",",
            '"attributes": [',
            attributesForToken(tokenId),
            "]",
            "}"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    /**
     * IERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(ITokenMetadataProvider).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
