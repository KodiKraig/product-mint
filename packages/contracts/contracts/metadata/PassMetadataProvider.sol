// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {MetadataProvider} from "../abstract/MetadataProvider.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {IProductRegistry} from "../registry/IProductRegistry.sol";
import {AttributeUtils} from "../libs/AttributeUtils.sol";

/**
 * @title PassMetadataProvider
 * @notice A metadata provider for product passes.
 *
 * Organizations can update the metadata for the product passes that they sell.
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
 * - Organization ID
 * - <Dynamic Product List>
 *  EX: Product 1 -> Pro Plan, Product 2 -> Token Usage, etc.
 */
contract PassMetadataProvider is MetadataProvider {
    using Strings for uint256;
    using AttributeUtils for string;

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
                purchaseRegistry
                    .passOrganization(tokenId)
                    .toString()
                    .attributeTraitType("Organization ID"),
                ",",
                _getOwnedProductAttributes(tokenId)
            );
    }

    /**
     * @dev Go through all the owned products and generate the attributes for each product.
     *
     * Format:
     * { 'trait_type': 'Product <ID>', 'value': '<PRODUCT NAME>' },
     */
    function _getOwnedProductAttributes(
        uint256 tokenId
    ) internal view returns (string memory) {
        uint256[] memory productIds = IPurchaseRegistry(
            registry.purchaseRegistry()
        ).getPassProductIds(tokenId);

        string[] memory productNames = IProductRegistry(
            registry.productRegistry()
        ).getProductNames(productIds);

        string memory productNamesString = "";

        for (uint256 i = 0; i < productNames.length; i++) {
            productNamesString = string.concat(
                productNamesString,
                i == 0 ? "" : ", ",
                _productNameAttribute(productIds[i], productNames[i])
            );
        }

        return productNamesString;
    }

    /**
     * @dev Generate the attribute for a product.
     *
     * Format:
     * { 'trait_type': 'Product <ID>', 'value': '<PRODUCT NAME>' },
     */
    function _productNameAttribute(
        uint256 productId,
        string memory name
    ) internal pure returns (string memory) {
        return
            name.attributeTraitType(
                string.concat("Product ", productId.toString())
            );
    }
}
