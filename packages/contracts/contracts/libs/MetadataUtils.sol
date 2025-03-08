// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {StringLengthUtils} from "./StringLengthUtils.sol";

library MetadataUtils {
    using StringLengthUtils for string;

    // Based on OpenSea's ERC721 metadata standard.
    struct Metadata {
        string name;
        string description;
        string externalUrl;
        string image;
        string backgroundColor;
        string animationUrl;
    }

    enum Fields {
        NAME,
        DESCRIPTION,
        EXTERNAL_URL,
        IMAGE,
        BACKGROUND_COLOR,
        ANIMATION_URL
    }

    function setName(Metadata storage metadata, string memory name) internal {
        require(name.isNotEmpty(), "Name is required");
        require(
            bytes(name).length <= 64,
            "Name must be less than 64 characters"
        );

        metadata.name = name;
    }

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

    function setImage(Metadata storage metadata, string memory image) internal {
        require(
            bytes(image).length <= 128,
            "Image must be less than 128 characters"
        );
        metadata.image = image;
    }

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

    function toJSON(
        Metadata memory metadata,
        Metadata memory defaultMetadata
    ) internal pure returns (string memory) {
        return
            string.concat(
                '"name": "',
                metadata.name.or(defaultMetadata.name),
                '", "description": "',
                metadata.description.or(defaultMetadata.description),
                '", "external_url": "',
                metadata.externalUrl.or(defaultMetadata.externalUrl),
                '", "image": "',
                metadata.image.or(defaultMetadata.image),
                '", "background_color": "',
                metadata.backgroundColor.or(defaultMetadata.backgroundColor),
                '", "animation_url": "',
                metadata.animationUrl.or(defaultMetadata.animationUrl),
                '"'
            );
    }
}
