// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {AttributeProvider} from "../abstract/AttributeProvider.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {IDiscountRegistry} from "../registry/IDiscountRegistry.sol";
import {IProductRegistry} from "../registry/IProductRegistry.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {AttributeUtils} from "../libs/AttributeUtils.sol";
import {ISubscriptionEscrow} from "../escrow/ISubscriptionEscrow.sol";
import {AttributeDate} from "../libs/AttributeDate.sol";

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
 * @title PassAttributeProvider
 * @notice Provides attributes for Pass NFTs
 *
 * Attributes include:
 * - Organization -> <Organization ID>
 * - Product <Product ID> -> <Product Name>
 * - Subscription <Product ID> -> <Subscription Status>
 * - Discount <Discount ID> -> <Discount Name>
 * - Total Discount
 *
 * Example:
 * Organization -> 1
 * Product 1 -> Pro Plan
 * Product 2 -> Token Usage
 * Subscription 1 -> Active
 * Subscription 2 -> Active
 * Discount 1 -> OG
 * Discount 2 -> FOUNDER
 * Total Discount -> 8%
 */
contract PassAttributeProvider is AttributeProvider, RegistryEnabled {
    using Strings for uint256;
    using AttributeUtils for string;
    using AttributeUtils for string[];
    using AttributeUtils for uint256;
    using AttributeDate for uint256;

    constructor(address registry) RegistryEnabled(registry) {}

    function attributesForToken(
        uint256 tokenId
    ) external view override returns (string memory) {
        IPurchaseRegistry purchaseRegistry = IPurchaseRegistry(
            registry.purchaseRegistry()
        );

        // Organization ID and Product IDs
        string memory attributes = string.concat(
            purchaseRegistry
                .passOrganization(tokenId)
                .toString()
                .attributeTraitType("Organization"),
            ",",
            _getOwnedProductAttributes(tokenId)
        );

        // Subscriptions
        string memory subscriptions = _getPassSubAttributes(tokenId);
        if (bytes(subscriptions).length > 0) {
            attributes = string.concat(attributes, ",", subscriptions);
        }

        // Discount IDs and Total Discounted Amount
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

        string[] memory productAttributes = new string[](productIds.length);

        for (uint256 i = 0; i < productIds.length; i++) {
            productAttributes[i] = _productNameAttribute(
                productIds[i],
                productNames[i]
            );
        }

        return productAttributes.joinWithCommas();
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
        string[] memory discountNames = IDiscountRegistry(
            registry.discountRegistry()
        ).getDiscountNames(discountIds);

        string[] memory discountAttributes = new string[](discountIds.length);

        for (uint256 i = 0; i < discountIds.length; i++) {
            discountAttributes[i] = discountNames[i].attributeTraitType(
                string.concat("Discount ", discountIds[i].toString())
            );
        }

        return discountAttributes.joinWithCommas();
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
                "Total Discount"
            );
    }

    /**
     * @dev Get the attributes for the subscriptions for the pass.
     *
     * Format:
     * { 'trait_type': 'Subscription <Product ID>', 'value': '<SUBSCRIPTION STATUS>' },
     * { 'display_type': 'date', 'trait_type': 'Subscription <Product ID> Start', 'value': '<START DATE>' },
     * { 'display_type': 'date', 'trait_type': 'Subscription <Product ID> End', 'value': '<END DATE>' },
     */
    function _getPassSubAttributes(
        uint256 tokenId
    ) internal view returns (string memory) {
        uint256[] memory productIds = ISubscriptionEscrow(
            registry.subscriptionEscrow()
        ).getPassSubs(tokenId);

        if (productIds.length == 0) {
            return "";
        }

        (
            ISubscriptionEscrow.Subscription[] memory _subs,
            ISubscriptionEscrow.SubscriptionStatus[] memory _statuses
        ) = ISubscriptionEscrow(registry.subscriptionEscrow())
                .getSubscriptionBatch(tokenId, productIds);

        string[] memory subAttributes = new string[](_subs.length);

        for (uint256 i = 0; i < _subs.length; i++) {
            subAttributes[i] = string.concat(
                _getSubStatusAttribute(_statuses[i], productIds[i]),
                ",",
                _getSubStartDate(_subs[i].startDate, productIds[i]),
                ",",
                _getSubEndDate(_subs[i].endDate, productIds[i])
            );
        }

        return subAttributes.joinWithCommas();
    }

    /**
     * @dev Get the attribute for the status of a subscription.
     *
     * Active, Cancelled, Past Due, Paused
     */
    function _getSubStatusAttribute(
        ISubscriptionEscrow.SubscriptionStatus status,
        uint256 productId
    ) internal pure returns (string memory) {
        string memory statusString = "Active";

        if (status == ISubscriptionEscrow.SubscriptionStatus.CANCELLED) {
            statusString = "Cancelled";
        } else if (status == ISubscriptionEscrow.SubscriptionStatus.PAST_DUE) {
            statusString = "Past Due";
        } else if (status == ISubscriptionEscrow.SubscriptionStatus.PAUSED) {
            statusString = "Paused";
        }

        return
            statusString.attributeTraitType(
                string.concat("Subscription ", productId.toString())
            );
    }

    /**
     * @dev Get the attribute for the start date of a subscription.
     *
     * Format:
     * { 'display_type': 'date', 'trait_type': 'Subscription <Product ID> Start', 'value': '<START DATE>' },
     */
    function _getSubStartDate(
        uint256 startDate,
        uint256 productId
    ) internal pure returns (string memory) {
        return
            startDate.attributeTraitTypeDate(
                string.concat("Subscription ", productId.toString(), " Start")
            );
    }

    /**
     * @dev Get the attribute for the end date of a subscription.
     *
     * Format:
     * { 'display_type': 'date', 'trait_type': 'Subscription <Product ID> End', 'value': '<END DATE>' },
     */
    function _getSubEndDate(
        uint256 endDate,
        uint256 productId
    ) internal pure returns (string memory) {
        return
            endDate.attributeTraitTypeDate(
                string.concat("Subscription ", productId.toString(), " End")
            );
    }
}
