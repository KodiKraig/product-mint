// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {ITokenMetadataProvider} from "../metadata/ITokenMetadataProvider.sol";
import {MetadataUtils} from "../libs/MetadataUtils.sol";
import {RegistryEnabled} from "./RegistryEnabled.sol";

/**
 * @title MetadataProvider
 * @notice A base contract to manage custom and default metadata for tokens with custom attributes.
 *
 * This contract takes care of ensuring the token Metadata URI is properly formed for OpenSea and other platforms.
 *
 *
 */
abstract contract MetadataProvider is
    Ownable2Step,
    RegistryEnabled,
    ITokenMetadataProvider,
    IERC165
{
    using MetadataUtils for MetadataUtils.Metadata;
    using Strings for string;

    // Organization ID => Metadata
    mapping(uint256 => MetadataUtils.Metadata) public customMetadata;

    // Default metadata for all tokens when no custom metadata is set by the org admin
    MetadataUtils.Metadata public defaultMetadata;

    uint256[50] private __gap;

    /**
     * Custom Metadata
     */

    function setCustomMetadataField(
        uint256 organizationId,
        MetadataUtils.Fields field,
        string memory value
    ) public virtual onlyOrgAdmin(organizationId) {
        _setMetadataByField(customMetadata[organizationId], field, value);
    }

    function setCustomMetadata(
        uint256 organizationId,
        MetadataUtils.Metadata memory metadata
    ) public virtual onlyOrgAdmin(organizationId) {
        customMetadata[organizationId].setAll(metadata);
    }

    /**
     * Default Metadata
     */

    function setDefaultMetadataField(
        MetadataUtils.Fields field,
        string memory value
    ) public virtual onlyOwner {
        _setMetadataByField(defaultMetadata, field, value);
    }

    function setDefaultMetadata(
        MetadataUtils.Metadata memory metadata
    ) public virtual onlyOwner {
        defaultMetadata.setAll(metadata);
    }

    /**
     * @dev Set the metadata by field while performing basic validation.
     */
    function _setMetadataByField(
        MetadataUtils.Metadata storage metadata,
        MetadataUtils.Fields field,
        string memory value
    ) internal {
        if (field == MetadataUtils.Fields.NAME) {
            metadata.setName(value);
        } else if (field == MetadataUtils.Fields.DESCRIPTION) {
            metadata.setDescription(value);
        } else if (field == MetadataUtils.Fields.EXTERNAL_URL) {
            metadata.setExternalUrl(value);
        } else if (field == MetadataUtils.Fields.IMAGE) {
            metadata.setImage(value);
        } else if (field == MetadataUtils.Fields.BACKGROUND_COLOR) {
            metadata.setBackgroundColor(value);
        } else if (field == MetadataUtils.Fields.ANIMATION_URL) {
            metadata.setAnimationUrl(value);
        } else {
            revert("Invalid field");
        }
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
