// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {MetadataProvider} from "../abstract/MetadataProvider.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {AttributeUtils} from "../libs/AttributeUtils.sol";

/**
 * @title OrganizationMetadataProvider
 * @notice A metadata provider for organizations within the ProductMint ecosystem.
 *
 * Organizations can update the metadata for their organization NFT.
 *
 * Attributes are dynamically derived from onchain data.
 *
 * We implement the following OpenSea Metadata standard primary metadata properties:
 * - Name
 * - Description
 * - External URL
 * - Image
 * - Background Color
 * - Animation URL
 *
 * Attributes include:
 * - Whitelist Only
 * - Max Mints
 * - Products Sold
 * - Product Pass Mints
 */
contract OrganizationMetadataProvider is MetadataProvider {
    using AttributeUtils for bool;
    using AttributeUtils for uint256;

    constructor(
        address _registry
    ) Ownable(_msgSender()) RegistryEnabled(_registry) {}

    function attributesForToken(
        uint256 tokenId
    ) internal view override returns (string memory) {
        IPurchaseRegistry purchaseRegistry = IPurchaseRegistry(
            registry.purchaseRegistry()
        );

        return
            string.concat(
                purchaseRegistry.isWhitelist(tokenId).attributeTraitType(
                    "Whitelist Only"
                ),
                ",",
                purchaseRegistry.maxMints(tokenId).noLimitAttributeTraitType(
                    "Max Mints"
                ),
                ",",
                purchaseRegistry.totalProductsSold(tokenId).attributeTraitType(
                    "Products Sold"
                ),
                ",",
                purchaseRegistry.totalPassMints(tokenId).attributeTraitType(
                    "Product Pass Mints"
                )
            );
    }
}
