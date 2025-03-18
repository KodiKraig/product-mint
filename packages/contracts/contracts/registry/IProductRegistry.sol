// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {PricingUtils} from "../libs/PricingUtils.sol";

interface IProductRegistry {
    /**
     * @notice ProductInfo is the information about the product.
     * @param orgId The organization ID that the product belongs to.
     * @param name The name of the product.
     * @param description The description of the product.
     * @param imageUrl An image URL for the product.
     * @param externalUrl An external URL of the product. (e.g. a link to a product page on a website)
     * @param isTransferable True if the product is transferable, else False and the product is soulbound to the NFT owner.
     * @param isActive If true, then the product is purchasable, else it is not available for purchase.
     */
    struct Product {
        uint256 orgId;
        string name;
        string description;
        string imageUrl;
        string externalUrl;
        bool isTransferable;
        bool isActive;
    }

    /**
     * @notice CreateProductParams are the parameters for creating a new product.
     * @param orgId The organization ID that the product belongs to.
     * @param name The name of the product.
     * @param description The description of the product.
     * @param imageUrl An image URL for the product. (optional)
     * @param externalUrl An external URL of the product. (e.g. a link to a product page on a website) (optional)
     * @param isTransferable True if the product is transferable, else False and the product is soulbound to the NFT owner.
     */
    struct CreateProductParams {
        uint256 orgId;
        string name;
        string description;
        string imageUrl;
        string externalUrl;
        bool isTransferable;
    }

    /**
     * @notice Get the total number of products that have been created.
     * @return The total number of products.
     */
    function totalProductSupply() external view returns (uint256);

    /**
     * @notice ProductNotFoundForOrganization is an error that is reverted when a product is not found for an organization.
     */
    error ProductNotFoundForOrganization(
        uint256 organizationId,
        uint256 productId
    );

    /**
     * @notice PricingNotLinkedToProduct is an error that is reverted when a pricing is not linked to a product.
     */
    error PricingNotLinkedToProduct(uint256 productId, uint256 pricingId);

    /**
     * @notice ProductIsNotActive is an error that is reverted when a product is not active.
     */
    error ProductIsNotActive(uint256 productId);

    /**
     * @notice Check if a product can be purchased.
     * @dev Will revert if the product cannot be purchased.
     * @param organizationId The organization ID that the product belongs to.
     * @param productId The product ID to check if it can be purchased.
     * @param pricingId The pricing ID to check if it can be used with the product purchase.
     */
    function canPurchaseProduct(
        uint256 organizationId,
        uint256 productId,
        uint256 pricingId
    ) external view;

    /**
     * @notice Batch check if multiple products can be purchased.
     * @dev Will revert if any of the products cannot be purchased.
     * @param _organizationId The organization ID that the products belong to.
     * @param _productIds The product IDs to check if they can be purchased.
     * @param _pricingIds The pricing IDs to check if they can be used with the product purchases.
     */
    function canPurchaseProducts(
        uint256 _organizationId,
        uint256[] calldata _productIds,
        uint256[] calldata _pricingIds
    ) external view;

    /**
     * Get Product Details
     */

    /**
     * @notice Get the product info for a product.
     * @param productId The product ID to get the info for.
     * @return productInfo The info for the product.
     */
    function getProduct(
        uint256 productId
    ) external view returns (Product memory);

    /**
     * @notice Get the product info for a batch of products.
     * @param _productIds The product IDs to get the info for.
     * @return _products The info for the products.
     */
    function getProductsBatch(
        uint256[] memory _productIds
    ) external view returns (Product[] memory _products);

    /**
     * @notice Get the names for a batch of products.
     * @param _productIds The product IDs to get the names for.
     * @return _productNames The names for the products.
     */
    function getProductNames(
        uint256[] memory _productIds
    ) external view returns (string[] memory _productNames);

    /**
     * @notice Get the product IDs for an organization.
     * @param _organizationId The organization ID to get the product IDs for.
     * @return productIds The product IDs that belong to the organization.
     */
    function getOrgProductIds(
        uint256 _organizationId
    ) external view returns (uint256[] memory);

    /**
     * @notice Get the product info for all products for an organization.
     * @param _organizationId The organization ID to get the product info for.
     * @return productIds The product IDs that belong to the organization.
     * @return products The info for the products.
     */
    function getOrgProducts(
        uint256 _organizationId
    ) external view returns (uint256[] memory, Product[] memory);

    /**
     * @notice Check if a product belongs to an organization.
     * @param organizationId The organization ID that the product belongs to.
     * @param productId The product ID to check if it belongs to the organization.
     * @return isOrgProduct True if the product belongs to the organization, else False.
     */
    function isOrgProduct(
        uint256 organizationId,
        uint256 productId
    ) external view returns (bool);

    /**
     * Product Creation
     */

    /**
     * @notice ValueCannotBeEmpty is an error that is thrown when a value is found to be empty during validation.
     */
    error ValueCannotBeEmpty();

    /**
     * @notice ValueTooLong is an error that is thrown when a value is found to be too long during validation.
     */
    error ValueTooLong();

    /**
     * @notice ProductCreated is an event that is emitted when a product is created.
     * @param organizationId The organization ID that the product belongs to.
     * @param productId The product ID that was created.
     */
    event ProductCreated(
        uint256 indexed organizationId,
        uint256 indexed productId
    );

    /**
     * @notice Create a new product for an organization.
     * @dev Will revert if not an org admin.
     * @param params The parameters for creating a new product.
     */
    function createProduct(CreateProductParams calldata params) external;

    /**
     * Product Management
     */

    /**
     * @notice ProductUpdated is an event that is emitted when a product is updated.
     * @param organizationId The organization ID that the product belongs to.
     * @param productId The product ID that was updated.
     */
    event ProductUpdated(
        uint256 indexed organizationId,
        uint256 indexed productId
    );

    /**
     * @notice ProductStatusChanged is an event that is emitted when a product's status is changed.
     * @param organizationId The organization ID that the product belongs to.
     * @param productId The product ID that was updated.
     * @param isActive The new status of the product.
     */
    event ProductStatusChanged(
        uint256 indexed organizationId,
        uint256 indexed productId,
        bool isActive
    );

    /**
     * @notice Set a new name for the product.
     * @dev Will revert if not an org admin or product does not exist.
     * @param productId The product ID to set the name for.
     * @param name The new name for the product.
     */
    function setProductName(uint256 productId, string calldata name) external;

    /**
     * @notice Set a new description of a product.
     * @dev Will revert if not an org admin or product does not exist.
     * @param productId The product ID to set the description for.
     * @param description The new description for the product.
     */
    function setProductDescription(
        uint256 productId,
        string calldata description
    ) external;

    /**
     * @notice Set a new image URL of a product.
     * @dev Will revert if not an org admin or product does not exist.
     * @param productId The product ID to set the image URL for.
     * @param imageUrl The new image URL for the product. Can be empty.
     */
    function setProductImageUrl(
        uint256 productId,
        string calldata imageUrl
    ) external;

    /**
     * @notice Set a new external URL of a product.
     * @dev Will revert if not an org admin or product does not exist.
     * @param productId The product ID to set the external URL for.
     * @param externalUrl The new external URL for the product. Can be empty.
     */
    function setProductExternalUrl(
        uint256 productId,
        string calldata externalUrl
    ) external;

    /**
     * @notice Set a new transferable status for a product.
     * @dev Will revert if not an org admin or product does not exist.
     * @param productId The product ID to set the transferable status for.
     * @param _isTransferable The new transferable status for the product.
     */
    function setProductTransferable(
        uint256 productId,
        bool _isTransferable
    ) external;

    /**
     * @notice Set a new active status for a product. True if the product can be purchased during new checkouts, else it is not available for purchase.
     * @dev Will revert if not an org admin or product does not exist.
     * @param productId The product ID to set the active status for.
     * @param _isActive The new active status for the product.
     */
    function setProductActive(uint256 productId, bool _isActive) external;

    /**
     * Link Products with Pricing
     */

    /**
     * @notice ProductPricingLinkUpdate is an event that is emitted when a product's pricing is linked or unlinked.
     * @param organizationId The organization ID that the product belongs to.
     * @param productId The product ID that was updated.
     * @param pricingId The pricing ID that was linked or unlinked.
     * @param isLinked True if the pricing is linked, else False.
     */
    event ProductPricingLinkUpdate(
        uint256 indexed organizationId,
        uint256 indexed productId,
        uint256 pricingId,
        bool isLinked
    );

    /**
     * @notice Link a pricing to a product. When a pricing is linked to a product, it can be used in checkouts for the product.
     * @dev Will revert if not an org admin, product does not exist, or pricing is not authorized.
     * @param productId The product ID to link the pricing to.
     * @param pricingIds The pricing IDs to link to the product.
     */
    function linkPricing(
        uint256 productId,
        uint256[] calldata pricingIds
    ) external;

    /**
     * @notice Unlink a pricing from a product.
     * @dev Will revert if not an org admin, product does not exist, or pricing is not linked to the product.
     * NOTE: Even if a pricing is unlinked from a product, subscription renewals using the product and pricing model will still continue to renew.
     * @param productId The product ID to unlink the pricing from.
     * @param pricingIds The pricing IDs to unlink from the product.
     */
    function unlinkPricing(
        uint256 productId,
        uint256[] calldata pricingIds
    ) external;

    /**
     * @notice Get the pricing IDs linked to a product.
     * @param productId The product ID to get the pricing IDs for.
     * @return pricingIds The pricing IDs that are linked to the product.
     */
    function getProductPricingIds(
        uint256 productId
    ) external view returns (uint256[] memory);

    /**
     * @notice Get all the pricing options for a product.
     * @param productId The product ID to get the pricing options for.
     * @return pricingIds The pricing IDs that are linked to the product.
     * @return pricingOptions The pricing options for the product.
     */
    function getProductPricing(
        uint256 productId
    ) external view returns (uint256[] memory, PricingUtils.Pricing[] memory);

    /**
     * @notice Get all the pricing options for a batch of products.
     * @dev This will be expensive to call and should be used with view only.
     * @param _productIds The product IDs to get the pricing options for.
     * @return pricingIds The pricing IDs that are linked to the products.
     * @return pricingOptions The pricing options for the products.
     */
    function getProductPricingBatch(
        uint256[] memory _productIds
    )
        external
        view
        returns (
            uint256[][] memory pricingIds,
            PricingUtils.Pricing[][] memory pricingOptions
        );
}
