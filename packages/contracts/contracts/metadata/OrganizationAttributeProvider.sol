// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {AttributeUtils} from "../libs/AttributeUtils.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {AttributeProvider} from "../abstract/AttributeProvider.sol";

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
 * @title OrganizationAttributeProvider
 * @notice Provides attributes for Organization NFTs
 *
 * Attributes include:
 * - Whitelist Only
 * - Max Mints
 * - Products Sold
 * - Product Pass Mints
 */
contract OrganizationAttributeProvider is AttributeProvider, RegistryEnabled {
    using AttributeUtils for bool;
    using AttributeUtils for uint256;

    constructor(address registry) RegistryEnabled(registry) {}

    function attributesForToken(
        uint256 tokenId
    ) external view returns (string memory) {
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
