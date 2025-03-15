// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {MetadataProvider} from "../abstract/MetadataProvider.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {IProductRegistry} from "../registry/IProductRegistry.sol";
import {AttributeUtils} from "../libs/AttributeUtils.sol";
import {IDiscountRegistry} from "../registry/IDiscountRegistry.sol";

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
 * - <Product ID> -> <Product Name>
 *  EX: Product 1 -> Pro Plan, Product 2 -> Token Usage, etc.
 */
contract PassMetadataProvider is MetadataProvider {
    using Strings for uint256;
    using AttributeUtils for string;
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

        string memory attributes = string.concat(
            purchaseRegistry
                .passOrganization(tokenId)
                .toString()
                .attributeTraitType("Organization ID"),
            ",",
            _getOwnedProductAttributes(tokenId)
        );

        uint256[] memory discountIds = IDiscountRegistry(
            registry.discountRegistry()
        ).getPassDiscountIds(tokenId);

        if (discountIds.length > 0) {
            attributes = string.concat(
                attributes,
                ",",
                _getDiscountNameAttributes(discountIds),
                ",",
                _getTotalDiscountedAmount(tokenId)
            );
        }

        return attributes;
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

    /**
     * @dev Go through all the discount ids and generate the attributes for each discount.
     *
     * Format:
     * { 'trait_type': 'Discount <ID>', 'value': '<DISCOUNT NAME>' },
     */
    function _getDiscountNameAttributes(
        uint256[] memory discountIds
    ) internal view returns (string memory) {
        string memory discountAttributes = "";

        string[] memory discountNames = IDiscountRegistry(
            registry.discountRegistry()
        ).getDiscountNames(discountIds);

        for (uint256 i = 0; i < discountIds.length; i++) {
            discountAttributes = string.concat(
                discountAttributes,
                i == 0 ? "" : ", ",
                discountNames[i].attributeTraitType(
                    string.concat("Discount ", discountIds[i].toString())
                )
            );
        }

        return discountAttributes;
    }

    /**
     * @dev Get the total discounted amount for the pass.
     *
     * Format:
     * { 'trait_type': 'Total Discount Amount', 'value': '<DISCOUNT AMOUNT>' },
     */
    function _getTotalDiscountedAmount(
        uint256 tokenId
    ) internal view returns (string memory) {
        uint256 totalDiscountedAmount = IDiscountRegistry(
            registry.discountRegistry()
        ).getTotalPassDiscount(tokenId);

        return
            totalDiscountedAmount.percentage(100).attributeTraitType(
                "Total Discount Amount"
            );
    }
}
