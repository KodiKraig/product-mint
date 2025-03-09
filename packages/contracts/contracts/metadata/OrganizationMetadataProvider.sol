// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {MetadataProvider} from "../abstract/MetadataProvider.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {MetadataUtils} from "../libs/MetadataUtils.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {AttributeUtils} from "../libs/AttributeUtils.sol";

contract OrganizationMetadataProvider is MetadataProvider {
    using MetadataUtils for MetadataUtils.Metadata;
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
