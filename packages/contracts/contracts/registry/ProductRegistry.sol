// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {PricingUtils} from "../libs/PricingUtils.sol";
import {IProductRegistry} from "./IProductRegistry.sol";
import {IPricingRegistry} from "./IPricingRegistry.sol";
import {IProductTransferOracle} from "../oracle/IProductTransferOracle.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";

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
    ) public view returns (bool) {
        return (productIds[organizationId].contains(productId) &&
            linkedPrices[productId].contains(pricingId) &&
            products[productId].isActive);
    }

    function canPurchaseProducts(
        uint256 _organizationId,
        uint256[] calldata _productIds,
        uint256[] calldata _pricingIds
    ) external view returns (bool) {
        require(_productIds.length > 0, "No products provided");
        require(
            _productIds.length == _pricingIds.length,
            "Product and pricing IDs must be the same length"
        );

        for (uint256 i = 0; i < _productIds.length; i++) {
            if (
                !canPurchaseProduct(
                    _organizationId,
                    _productIds[i],
                    _pricingIds[i]
                )
            ) {
                return false;
            }
        }
        return true;
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

        products[totalProductSupply].orgId = params.orgId;
        _setProductName(totalProductSupply, params.name);
        _setProductDescription(totalProductSupply, params.description);
        _setProductImageUrl(totalProductSupply, params.imageUrl);
        _setProductExternalUrl(totalProductSupply, params.externalUrl);

        products[totalProductSupply].isTransferable = params.isTransferable;
        products[totalProductSupply].isActive = true;

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
        _setProductName(productId, name);

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function _setProductName(uint256 productId, string calldata name) internal {
        if (bytes(name).length == 0) {
            revert ValueCannotBeEmpty();
        }

        if (bytes(name).length > 64) {
            revert ValueTooLong();
        }

        products[productId].name = name;
    }

    function setProductDescription(
        uint256 productId,
        string calldata description
    ) external onlyOrgAdmin(products[productId].orgId) {
        _setProductDescription(productId, description);

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function _setProductDescription(
        uint256 productId,
        string calldata description
    ) internal {
        if (bytes(description).length == 0) {
            revert ValueCannotBeEmpty();
        }

        if (bytes(description).length > 512) {
            revert ValueTooLong();
        }

        products[productId].description = description;
    }

    function setProductImageUrl(
        uint256 productId,
        string calldata imageUrl
    ) external onlyOrgAdmin(products[productId].orgId) {
        _setProductImageUrl(productId, imageUrl);

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function _setProductImageUrl(
        uint256 productId,
        string calldata imageUrl
    ) internal {
        if (bytes(imageUrl).length > 128) {
            revert ValueTooLong();
        }

        products[productId].imageUrl = imageUrl;
    }

    function setProductExternalUrl(
        uint256 productId,
        string calldata externalUrl
    ) external onlyOrgAdmin(products[productId].orgId) {
        _setProductExternalUrl(productId, externalUrl);

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function _setProductExternalUrl(
        uint256 productId,
        string calldata externalUrl
    ) internal {
        if (bytes(externalUrl).length > 128) {
            revert ValueTooLong();
        }

        products[productId].externalUrl = externalUrl;
    }

    function setProductTransferable(
        uint256 productId,
        bool _isTransferable
    ) external onlyOrgAdmin(products[productId].orgId) {
        products[productId].isTransferable = _isTransferable;

        emit ProductUpdated(products[productId].orgId, productId);
    }

    function setProductActive(
        uint256 productId,
        bool _isActive
    ) external onlyOrgAdmin(products[productId].orgId) {
        products[productId].isActive = _isActive;

        emit ProductStatusChanged(
            products[productId].orgId,
            productId,
            _isActive
        );
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
                revert PricingNotLinkedToProduct();
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
    ) public view returns (PricingUtils.Pricing[] memory) {
        uint256[] memory pricingIds = linkedPrices[productId].values();
        return
            IPricingRegistry(registry.pricingRegistry()).getPricingBatch(
                pricingIds
            );
    }

    function getProductPricingBatch(
        uint256[] memory _productIds
    ) external view returns (PricingUtils.Pricing[][] memory pricingOptions) {
        pricingOptions = new PricingUtils.Pricing[][](_productIds.length);

        for (uint256 i = 0; i < _productIds.length; i++) {
            pricingOptions[i] = getProductPricing(_productIds[i]);
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
