// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {StringLengthUtils} from "./StringLengthUtils.sol";
import {AttributeUtils} from "./AttributeUtils.sol";

/**
 * @notice Utility library for managing Metadata that conforms to the ERC721 metadata standard set by OpenSea.
 */
library MetadataUtils {
    using StringLengthUtils for string;
    using AttributeUtils for string;

    /**
     * @notice Struct representing the metadata for an ERC721 token.
     *
     * Based on OpenSea's ERC721 metadata standard.
     *
     * @custom:field name The name of the token.
     * @custom:field description The description of the token.
     * @custom:field externalUrl The external URL of the token.
     * @custom:field image The image of the token.
     * @custom:field backgroundColor The background color of the token.
     * @custom:field animationUrl The animation URL of the token.
     */
    struct Metadata {
        string name;
        string description;
        string externalUrl;
        string image;
        string backgroundColor;
        string animationUrl;
    }

    /**
     * @notice Enum representing the fields of the metadata.
     *
     * @dev Can be used to set individual fields of the metadata using a single function.
     */
    enum Fields {
        NAME,
        DESCRIPTION,
        EXTERNAL_URL,
        IMAGE,
        BACKGROUND_COLOR,
        ANIMATION_URL
    }

    /**
     * @notice Set the name of the token.
     * @dev The name must be less than 64 characters and not empty.
     * @param metadata The metadata to set the name of.
     * @param name The name to set.
     */
    function setName(Metadata storage metadata, string memory name) internal {
        require(name.isNotEmpty(), "Name is required");
        require(
            bytes(name).length <= 64,
            "Name must be less than 64 characters"
        );

        metadata.name = name;
    }

    /**
     * @notice Set the description of the token.
     * @dev The description must be less than 512 characters and not empty.
     * @param metadata The metadata to set the description of.
     * @param description The description to set.
     */
    function setDescription(
        Metadata storage metadata,
        string memory description
    ) internal {
        require(description.isNotEmpty(), "Description is required");
        require(
            bytes(description).length <= 512,
            "Description must be less than 512 characters"
        );
        metadata.description = description;
    }

    /**
     * @notice Set the external URL of the token.
     * @dev The external URL must be less than 128 characters and not empty.
     * @param metadata The metadata to set the external URL of.
     * @param externalUrl The external URL to set.
     */
    function setExternalUrl(
        Metadata storage metadata,
        string memory externalUrl
    ) internal {
        require(
            bytes(externalUrl).length <= 128,
            "External URL must be less than 128 characters"
        );
        metadata.externalUrl = externalUrl;
    }

    /**
     * @notice Set the image of the token.
     * @dev The image must be less than 128 characters and not empty.
     * @param metadata The metadata to set the image of.
     * @param image The image to set.
     */
    function setImage(Metadata storage metadata, string memory image) internal {
        require(
            bytes(image).length <= 128,
            "Image must be less than 128 characters"
        );
        metadata.image = image;
    }

    /**
     * @notice Set the background color of the token. No leading # required. Should be 6 characters.
     * @dev The background color must be 6 characters and not empty.
     * @param metadata The metadata to set the background color of.
     * @param backgroundColor The background color to set.
     */
    function setBackgroundColor(
        Metadata storage metadata,
        string memory backgroundColor
    ) internal {
        require(
            backgroundColor.isEmpty() || bytes(backgroundColor).length == 6,
            "Background color must be 6 characters or empty to remove"
        );
        metadata.backgroundColor = backgroundColor;
    }

    /**
     * @notice Set the animation URL of the token.
     * @dev The animation URL must be less than 128 characters and not empty.
     * @param metadata The metadata to set the animation URL of.
     * @param animationUrl The animation URL to set.
     */
    function setAnimationUrl(
        Metadata storage metadata,
        string memory animationUrl
    ) internal {
        require(
            bytes(animationUrl).length <= 128,
            "Animation URL must be less than 128 characters"
        );
        metadata.animationUrl = animationUrl;
    }

    /**
     * @notice Set all fields of the metadata in one go.
     * @param metadata The metadata to set the fields of.
     * @param newMetadata The new metadata to set.
     */
    function setAll(
        Metadata storage metadata,
        Metadata memory newMetadata
    ) internal {
        setName(metadata, newMetadata.name);
        setDescription(metadata, newMetadata.description);
        setExternalUrl(metadata, newMetadata.externalUrl);
        setImage(metadata, newMetadata.image);
        setBackgroundColor(metadata, newMetadata.backgroundColor);
        setAnimationUrl(metadata, newMetadata.animationUrl);
    }

    /**
     * @notice Convert the metadata to a JSON string while filling in default values for empty fields.
     *  If any fields are empty, they will be set to "null" in the JSON string.
     *
     * @dev The JSON string will be formatted as follows:
     * {
     *     "name": "<NAME>",
     *     "description": "<DESCRIPTION>",
     *     "external_url": "<EXTERNAL_URL>",
     *     "image": "<IMAGE>",
     *     "background_color": "<BACKGROUND_COLOR>",
     *     "animation_url": "<ANIMATION_URL>"
     * }
     *
     * @param metadata The metadata to convert to a JSON string.
     * @param defaultMetadata The default metadata to use if a field is empty.
     * @return The metadata as a JSON string.
     */
    function toJSON(
        Metadata memory metadata,
        Metadata memory defaultMetadata
    ) internal pure returns (string memory) {
        return
            string.concat(
                metadata.name.or(defaultMetadata.name).keyValue("name"),
                ",",
                metadata.description.or(defaultMetadata.description).keyValue(
                    "description"
                ),
                ",",
                metadata.externalUrl.or(defaultMetadata.externalUrl).keyValue(
                    "external_url"
                ),
                ",",
                metadata.image.or(defaultMetadata.image).keyValue("image"),
                ",",
                metadata
                    .backgroundColor
                    .or(defaultMetadata.backgroundColor)
                    .keyValue("background_color"),
                ",",
                metadata.animationUrl.or(defaultMetadata.animationUrl).keyValue(
                    "animation_url"
                )
            );
    }
}
