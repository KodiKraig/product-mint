// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {PricingUtils} from "../libs/PricingUtils.sol";
import {IProductRegistry} from "./IProductRegistry.sol";
import {IPricingRegistry} from "./IPricingRegistry.sol";
import {IProductTransferOracle} from "../oracle/IProductTransferOracle.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";

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
 * @title ProductRegistry
 * @notice A contract that allows organizations to create products and link them to pricing models.
 *
 * Products can only be created by organization admins.
 *
 * Products can be linked to pricing models that are owned by the organization to be allowed in checkouts.
 *
 * Products can only be transferred between wallets if the product is transferable. By default, products are not transferable.
 *
 * Products can be deactivated by organization admins. When a product is deactivated, it cannot be used in checkouts.
 * NOTE: Even if a product is deactivated or the pricing model is unlinked, subscription renewals using the
 * product and pricing model will still continue to renew.
 */
contract ProductRegistry is
    RegistryEnabled,
    IProductRegistry,
    IProductTransferOracle,
    IERC165
{
    using EnumerableSet for EnumerableSet.UintSet;

    // Organization ID => Product IDs
    mapping(uint256 => EnumerableSet.UintSet) private productIds;

    // Product ID => Product
    mapping(uint256 => Product) private products;

    // Product ID => Linked Pricing IDs
    mapping(uint256 => EnumerableSet.UintSet) private linkedPrices;

    // Total number of products created
    uint256 public totalProductSupply;

    constructor(address _contractRegistry) RegistryEnabled(_contractRegistry) {}

    /**
     * Purchase Product
     */

    function canPurchaseProduct(
        uint256 organizationId,
        uint256 productId,
        uint256 pricingId
    ) public view {
        if (!productIds[organizationId].contains(productId)) {
            revert ProductNotFoundForOrganization(organizationId, productId);
        }

        if (!linkedPrices[productId].contains(pricingId)) {
            revert PricingNotLinkedToProduct(productId, pricingId);
        }

        if (!products[productId].isActive) {
            revert ProductIsNotActive(productId);
        }
    }

    function canPurchaseProducts(
        uint256 _organizationId,
        uint256[] calldata _productIds,
        uint256[] calldata _pricingIds
    ) external view {
        require(_productIds.length > 0, "No products provided");
        require(
            _productIds.length == _pricingIds.length,
            "Product and pricing IDs must be the same length"
        );

        for (uint256 i = 0; i < _productIds.length; i++) {
            canPurchaseProduct(_organizationId, _productIds[i], _pricingIds[i]);
        }
    }

    /**
     * Get Product Details
     */

    function getProduct(
        uint256 productId
    ) public view returns (Product memory) {
        require(
            productId > 0 && productId <= totalProductSupply,
            "Product not found"
        );
        return products[productId];
    }

    function getProductsBatch(
        uint256[] memory _productIds
    ) public view returns (Product[] memory _products) {
        _products = new Product[](_productIds.length);

        for (uint256 i = 0; i < _productIds.length; i++) {
            _products[i] = getProduct(_productIds[i]);
        }
    }

    function getProductNames(
        uint256[] memory _productIds
    ) external view returns (string[] memory _productNames) {
        _productNames = new string[](_productIds.length);

        for (uint256 i = 0; i < _productIds.length; i++) {
            _productNames[i] = products[_productIds[i]].name;
        }
    }

    function getOrgProductIds(
        uint256 _organizationId
    ) external view returns (uint256[] memory) {
        return productIds[_organizationId].values();
    }

    function getOrgProducts(
        uint256 _organizationId
    ) external view returns (uint256[] memory, Product[] memory) {
        uint256[] memory _productIds = productIds[_organizationId].values();
        return (_productIds, getProductsBatch(_productIds));
    }

    function isOrgProduct(
        uint256 organizationId,
        uint256 productId
    ) external view returns (bool) {
        return productIds[organizationId].contains(productId);
    }

    /**
     * Product Creation
     */

    function createProduct(
        CreateProductParams calldata params
    ) external onlyOrgAdmin(params.orgId) {
        totalProductSupply++;

        Product storage product = products[totalProductSupply];

        product.orgId = params.orgId;
        _setProductName(product, params.name);
        _setProductDescription(product, params.description);
        _setProductImageUrl(product, params.imageUrl);
        _setProductExternalUrl(product, params.externalUrl);

        product.isTransferable = params.isTransferable;
        product.isActive = true;

        productIds[params.orgId].add(totalProductSupply);

        emit ProductCreated(params.orgId, totalProductSupply);
    }

    /**
     * Product Management
     */

    function setProductName(
        uint256 productId,
        string calldata name
    ) external onlyOrgAdmin(products[productId].orgId) {
        Product storage product = products[productId];

        _setProductName(product, name);

        emit ProductUpdated(product.orgId, productId);
    }

    function _setProductName(
        Product storage product,
        string calldata name
    ) internal {
        if (bytes(name).length == 0) {
            revert ValueCannotBeEmpty();
        }

        if (bytes(name).length > 64) {
            revert ValueTooLong();
        }

        product.name = name;
    }

    function setProductDescription(
        uint256 productId,
        string calldata description
    ) external onlyOrgAdmin(products[productId].orgId) {
        Product storage product = products[productId];

        _setProductDescription(product, description);

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function _setProductDescription(
        Product storage product,
        string calldata description
    ) internal {
        if (bytes(description).length == 0) {
            revert ValueCannotBeEmpty();
        }

        if (bytes(description).length > 512) {
            revert ValueTooLong();
        }

        product.description = description;
    }

    function setProductImageUrl(
        uint256 productId,
        string calldata imageUrl
    ) external onlyOrgAdmin(products[productId].orgId) {
        Product storage product = products[productId];

        _setProductImageUrl(product, imageUrl);

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function _setProductImageUrl(
        Product storage product,
        string calldata imageUrl
    ) internal {
        if (bytes(imageUrl).length > 128) {
            revert ValueTooLong();
        }

        product.imageUrl = imageUrl;
    }

    function setProductExternalUrl(
        uint256 productId,
        string calldata externalUrl
    ) external onlyOrgAdmin(products[productId].orgId) {
        Product storage product = products[productId];

        _setProductExternalUrl(product, externalUrl);

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function _setProductExternalUrl(
        Product storage product,
        string calldata externalUrl
    ) internal {
        if (bytes(externalUrl).length > 128) {
            revert ValueTooLong();
        }

        product.externalUrl = externalUrl;
    }

    function setProductTransferable(
        uint256 productId,
        bool _isTransferable
    ) external onlyOrgAdmin(products[productId].orgId) {
        Product storage product = products[productId];

        product.isTransferable = _isTransferable;

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function setProductActive(
        uint256 productId,
        bool _isActive
    ) external onlyOrgAdmin(products[productId].orgId) {
        Product storage product = products[productId];

        product.isActive = _isActive;

        emit ProductStatusChanged(product.orgId, productId, _isActive);
    }

    /**
     * Link Products with Pricing
     */

    function linkPricing(
        uint256 productId,
        uint256[] calldata pricingIds
    ) external onlyOrgAdmin(products[productId].orgId) {
        IPricingRegistry(registry.pricingRegistry()).validateOrgPricing(
            products[productId].orgId,
            pricingIds
        );

        for (uint256 i = 0; i < pricingIds.length; i++) {
            linkedPrices[productId].add(pricingIds[i]);

            emit ProductPricingLinkUpdate(
                products[productId].orgId,
                productId,
                pricingIds[i],
                true
            );
        }
    }

    function unlinkPricing(
        uint256 productId,
        uint256[] calldata pricingIds
    ) external onlyOrgAdmin(products[productId].orgId) {
        for (uint256 i = 0; i < pricingIds.length; i++) {
            if (!linkedPrices[productId].contains(pricingIds[i])) {
                revert PricingNotLinkedToProduct(productId, pricingIds[i]);
            }

            linkedPrices[productId].remove(pricingIds[i]);

            emit ProductPricingLinkUpdate(
                products[productId].orgId,
                productId,
                pricingIds[i],
                false
            );
        }
    }

    function getProductPricingIds(
        uint256 productId
    ) external view returns (uint256[] memory) {
        return linkedPrices[productId].values();
    }

    function getProductPricing(
        uint256 productId
    ) public view returns (uint256[] memory, PricingUtils.Pricing[] memory) {
        uint256[] memory pricingIds = linkedPrices[productId].values();
        return (
            pricingIds,
            IPricingRegistry(registry.pricingRegistry()).getPricingBatch(
                pricingIds
            )
        );
    }

    function getProductPricingBatch(
        uint256[] memory _productIds
    )
        external
        view
        returns (
            uint256[][] memory pricingIds,
            PricingUtils.Pricing[][] memory pricingOptions
        )
    {
        pricingIds = new uint256[][](_productIds.length);
        pricingOptions = new PricingUtils.Pricing[][](_productIds.length);

        for (uint256 i = 0; i < _productIds.length; i++) {
            (pricingIds[i], pricingOptions[i]) = getProductPricing(
                _productIds[i]
            );
        }
    }

    /**
     * Product Transferability
     */

    function isTransferable(
        uint256[] calldata _productIds
    ) external view returns (bool) {
        for (uint256 i = 0; i < _productIds.length; i++) {
            if (!products[_productIds[i]].isTransferable) {
                return false;
            }
        }
        return true;
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IProductRegistry).interfaceId ||
            interfaceId == type(IProductTransferOracle).interfaceId;
    }
}
