// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPurchaseRegistry} from "./IPurchaseRegistry.sol";
import {IProductRegistry} from "./IProductRegistry.sol";

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
 * @title PurchaseRegistry
 * @notice A contract used by the purchase manager to record purchases of products on a product pass.
 *
 * A product pass is a token that represents a collection of products that have been purchased.
 *
 * Organization admins can do the following:
 * - Set whether mints are whitelist only and the addresses that are whitelisted. Default is false.
 * - Set the maximum number of product pass mints for an organization. Default is 0 (unlimited).
 * - Set the maximum supply for a product creating market scarcity. Default is 0 (unlimited).
 * - Set whether mints are closed for an organization and no products can be purchased. Default is false.
 */
contract PurchaseRegistry is RegistryEnabled, IPurchaseRegistry, IERC165 {
    using EnumerableSet for EnumerableSet.UintSet;

    // Product Pass Token ID => Organization ID
    mapping(uint256 => uint256) public passOrganization;

    // Product Pass Token ID => Purchased Product IDs
    mapping(uint256 => EnumerableSet.UintSet) private purchasedProducts;

    // Product ID => Supply
    mapping(uint256 => uint256) public productSupply;

    // Product ID => Max Supply
    mapping(uint256 => uint256) public productMaxSupply;

    // Organization ID => Total products sold
    mapping(uint256 => uint256) public totalProductsSold;

    // Organization ID => Total pass mints
    mapping(uint256 => uint256) public totalPassMints;

    // Organization ID -> Product Pass Purchaser -> Number of total mints
    mapping(uint256 => mapping(address => uint256)) public passMintCount;

    // Organization ID -> Maximum number of pass mints by a single wallet
    mapping(uint256 => uint256) public maxMints;

    // Organization ID => Is organization whitelist only mint?
    mapping(uint256 => bool) public isWhitelist;

    // Organization ID => Product Pass Purchaser => Is whitelisted?
    mapping(uint256 => mapping(address => bool)) public whitelisted;

    // Organization ID => Is mint closed?
    mapping(uint256 => bool) public isMintClosed;

    // Organization ID => Is gifting enabled to mint passes to other addresses?
    mapping(uint256 => bool) public isGiftingEnabled;

    constructor(address _contractRegistry) RegistryEnabled(_contractRegistry) {}

    function getPassProductIds(
        uint256 tokenId
    ) external view returns (uint256[] memory) {
        return purchasedProducts[tokenId].values();
    }

    function hasPassPurchasedProducts(
        uint256 tokenId,
        uint256[] calldata productIds
    ) external view returns (bool) {
        for (uint256 i = 0; i < productIds.length; i++) {
            if (!purchasedProducts[tokenId].contains(productIds[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * Record Purchase
     */

    function recordProductPurchase(
        uint256 _organizationId,
        uint256 _passId,
        address _passOwner,
        address _purchaser,
        uint256[] calldata _productIds,
        uint256[] calldata _pricingIds
    ) external onlyRegistry(registry.purchaseManager()) {
        require(
            _productIds.length > 0,
            "At least one product must be purchased"
        );
        require(
            _productIds.length == _pricingIds.length,
            "Product and pricing IDs must be the same length"
        );

        if (isMintClosed[_organizationId]) {
            revert MintClosed();
        }

        if (
            _passOwner != _purchaser &&
            !isGiftingEnabled[_organizationId] &&
            !_isOrgAdminAddress(_organizationId, _purchaser)
        ) {
            revert GiftingIsDisabled(_organizationId);
        }

        if (passOrganization[_passId] == 0) {
            // New pass
            passOrganization[_passId] = _organizationId;
            totalPassMints[_organizationId] += 1;
        } else if (passOrganization[_passId] != _organizationId) {
            revert InvalidOrganization();
        }

        if (
            maxMints[_organizationId] > 0 &&
            passMintCount[_organizationId][_purchaser] >=
            maxMints[_organizationId] &&
            !_isOrgAdminAddress(_organizationId, _purchaser)
        ) {
            revert MaxMintsReached();
        } else {
            passMintCount[_organizationId][_purchaser] += 1;
        }

        if (
            isWhitelist[_organizationId] &&
            !whitelisted[_organizationId][_purchaser] &&
            !_isOrgAdminAddress(_organizationId, _purchaser)
        ) {
            revert AddressNotWhitelisted();
        }

        for (uint256 i = 0; i < _productIds.length; i++) {
            if (purchasedProducts[_passId].contains(_productIds[i])) {
                revert ProductAlreadyAdded();
            }

            if (
                productMaxSupply[_productIds[i]] > 0 &&
                productSupply[_productIds[i]] >=
                productMaxSupply[_productIds[i]]
            ) {
                revert MaxSupplyReached();
            }

            productSupply[_productIds[i]] += 1;
            totalProductsSold[_organizationId] += 1;
            purchasedProducts[_passId].add(_productIds[i]);
        }
    }

    /**
     * Max Supply
     */

    function setProductMaxSupply(
        uint256 organizationId,
        uint256 productId,
        uint256 _maxSupply
    ) external onlyOrgAdmin(organizationId) {
        require(
            _maxSupply == 0 || _maxSupply > productSupply[productId],
            "Max supply must be greater than current supply"
        );
        require(
            IProductRegistry(registry.productRegistry()).isOrgProduct(
                organizationId,
                productId
            ),
            "Product not found"
        );

        productMaxSupply[productId] = _maxSupply;

        emit ProductMaxSupplyUpdated(organizationId, productId, _maxSupply);
    }

    /**
     * Max Mints
     */

    function setMaxMints(
        uint256 organizationId,
        uint256 _maxMints
    ) external onlyOrgAdmin(organizationId) {
        maxMints[organizationId] = _maxMints;

        emit MaxMintsUpdated(organizationId, _maxMints);
    }

    /**
     * Whitelist
     */

    function setWhitelist(
        uint256 organizationId,
        bool _isWhitelist
    ) external onlyOrgAdmin(organizationId) {
        isWhitelist[organizationId] = _isWhitelist;

        emit WhitelistStatusChanged(organizationId, _isWhitelist);
    }

    function whitelistPassOwners(
        uint256 organizationId,
        address[] calldata _addresses,
        bool[] calldata _isWhitelisted
    ) external onlyOrgAdmin(organizationId) {
        require(_addresses.length > 0, "At least one address must be provided");
        require(
            _addresses.length == _isWhitelisted.length,
            "Addresses and isWhitelisted must be the same length"
        );

        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelisted[organizationId][_addresses[i]] = _isWhitelisted[i];
            emit WhitelistPassOwnerUpdated(
                organizationId,
                _addresses[i],
                _isWhitelisted[i]
            );
        }
    }

    /**
     * Mint Closed
     */

    function setMintClosed(
        uint256 organizationId,
        bool _isMintClosed
    ) external onlyOrgAdmin(organizationId) {
        isMintClosed[organizationId] = _isMintClosed;

        emit MintClosedStatusChanged(organizationId, _isMintClosed);
    }

    /**
     * Gifting
     */

    function setGiftingEnabled(
        uint256 organizationId,
        bool _isGifting
    ) external onlyOrgAdmin(organizationId) {
        isGiftingEnabled[organizationId] = _isGifting;

        emit GiftingStatusChanged(organizationId, _isGifting);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        return
            interfaceId == type(IPurchaseRegistry).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
