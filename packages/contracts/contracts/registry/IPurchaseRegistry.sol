// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPurchaseRegistry {
    /**
     * @notice Get the organization ID that the pass token belongs to.
     * @param tokenId The Product Pass Token ID to get the organization ID for.
     * @return The organization ID for the pass.
     */
    function passOrganization(uint256 tokenId) external view returns (uint256);

    /**
     * @notice Get the the count for the number of products purchased.
     * @param productId The product ID to get the supply for.
     * @return The supply of the product across all passes.
     */
    function productSupply(uint256 productId) external view returns (uint256);

    /**
     * @notice Get the max supply for a product. Used to create scarcity.
     * @param productId The product ID to get the max supply for.
     * @return The max supply for the product. 0 if no limit.
     */
    function productMaxSupply(
        uint256 productId
    ) external view returns (uint256);

    /**
     * @notice Get the total number of products sold for an organization.
     * @param organizationId The organization ID to get the total products sold for.
     * @return The total products sold across all passes for the organization.
     */
    function totalProductsSold(
        uint256 organizationId
    ) external view returns (uint256);

    /**
     * @notice Get the total number of product passes minted for an organization.
     * @param organizationId The organization ID to get the total pass mints for.
     * @return The total pass mints for the organization.
     */
    function totalPassMints(
        uint256 organizationId
    ) external view returns (uint256);

    /**
     * @notice Get the product IDs that have been purchased for a pass.
     * @param tokenId The Product Pass Token ID to get the product IDs for.
     * @return The product IDs for the pass.
     */
    function getPassProductIds(
        uint256 tokenId
    ) external view returns (uint256[] memory);

    /**
     * @notice Check if a pass has purchased a list of products.
     * @param tokenId The Product Pass Token ID to check.
     * @param productIds The product IDs to check.
     * @return True if the pass has purchased all the products, false otherwise.
     */
    function hasPassPurchasedProducts(
        uint256 tokenId,
        uint256[] calldata productIds
    ) external view returns (bool);

    /**
     * @notice Get the number of mints for an organization by a single wallet.
     * @param organizationId The organization ID that the pass belongs to.
     * @param purchaser The wallet that is purchasing the products.
     * @return The number of mints by the wallet for the organization.
     */
    function passMintCount(
        uint256 organizationId,
        address purchaser
    ) external view returns (uint256);

    /**
     * @notice Get the max mints for an organization.
     * @param organizationId The organization ID to get the max mints for.
     * @return The max amount of product passes that can be minted by a single wallet for the organization.
     */
    function maxMints(uint256 organizationId) external view returns (uint256);

    /**
     * @notice Get the whitelist status for an organization.
     * @param organizationId The organization ID to get the whitelist status for.
     * @return True if the organization is whitelist only, false otherwise.
     */
    function isWhitelist(uint256 organizationId) external view returns (bool);

    /**
     * @notice Get the mint closed status for an organization.
     * @dev When the mint is closed, no passes can be purchased for the organization regardless of whitelist status.
     * @param organizationId The organization ID to get the mint closed status for.
     * @return True if the mint is closed, false otherwise.
     */
    function isMintClosed(uint256 organizationId) external view returns (bool);

    /**
     * Record Purchase
     */

    /**
     * @notice Revert for when a product is already added to the pass. Prevent duplicate purchases.
     */
    error ProductAlreadyAdded();

    /**
     * @notice Revert for when the max supply is reached.
     */
    error MaxSupplyReached();

    /**
     * @notice Revert for when the organization is invalid for the pass.
     */
    error InvalidOrganization();

    /**
     * @notice Revert for when the max mints are reached.
     */
    error MaxMintsReached();

    /**
     * @notice Revert for when the address is not whitelisted when attempting to purchase a pass in a whitelist only organization.
     */
    error AddressNotWhitelisted();

    /**
     * @notice Revert for when the mint is closed and no passes can be minted or additional products can be added to the pass.
     */
    error MintClosed();

    /**
     * @notice Revert for when the gifting is disabled for an organization.
     */
    error GiftingIsDisabled(uint256 organizationId);

    /**
     * @notice Record a product purchase and link the products to the pass.
     * @dev Only the purchase manager can record a product purchase.
     * @param _organizationId The organization ID that the product belongs to.
     * @param _passId The Product Pass ID to be used in the purchase.
     * @param _passOwner The owner of the pass.
     * @param _purchaser The wallet that is purchasing the products.
     * @param _productIds The product IDs to be used in the purchase.
     * @param _pricingIds The pricing IDs to be used in the purchase.
     */
    function recordProductPurchase(
        uint256 _organizationId,
        uint256 _passId,
        address _passOwner,
        address _purchaser,
        uint256[] calldata _productIds,
        uint256[] calldata _pricingIds
    ) external;

    /**
     * Max Supply
     */

    /**
     * @notice Emitted for when the max supply is updated.
     * @param organizationId The organization ID that the product belongs to.
     * @param productId The product ID to set the max supply for.
     * @param maxSupply The new max supply for the product. 0 if no limit.
     */
    event ProductMaxSupplyUpdated(
        uint256 indexed organizationId,
        uint256 indexed productId,
        uint256 maxSupply
    );

    /**
     * @notice Set a new max supply for a product.
     * @dev Will revert if not an org admin or product does not exist or max supply is less than current supply.
     * @param organizationId The organization ID that the product belongs to.
     * @param productId The product ID to set the max supply for.
     * @param _maxSupply The new max supply for the product. 0 if no limit.
     */
    function setProductMaxSupply(
        uint256 organizationId,
        uint256 productId,
        uint256 _maxSupply
    ) external;

    /**
     * Max Mints
     */

    /**
     * @notice Emitted when max mints are updated for an organization.
     * @param organizationId The organization ID to update the max mints for.
     * @param maxMints The new max mints for the organization. 0 if no limit.
     */
    event MaxMintsUpdated(uint256 indexed organizationId, uint256 maxMints);

    /**
     * @notice Set a new max mint amount for an organization.
     * @dev NOTE: When lowering the limit, it will not affect existing wallets that have already minted.
     * @param organizationId The organization ID to set the max mints for.
     * @param _maxMints The new max mints for the organization. 0 if no limit.
     */
    function setMaxMints(uint256 organizationId, uint256 _maxMints) external;

    /**
     * Whitelist
     */

    /**
     * @notice Emitted when the whitelist status for an organization is updated.
     * @param organizationId The organization ID to update the whitelist for.
     * @param isWhitelist True if the organization is whitelist only, false otherwise.
     */
    event WhitelistStatusChanged(
        uint256 indexed organizationId,
        bool isWhitelist
    );

    /**
     * @notice Set a new whitelist status for an organization.
     * @param organizationId The organization ID to set the whitelist for.
     * @param _isWhitelist True if the organization is whitelist only, false otherwise.
     */
    function setWhitelist(uint256 organizationId, bool _isWhitelist) external;

    /**
     * @notice Emitted when the whitelist is updated for an address.
     * @param organizationId The organization ID to update the whitelist for.
     * @param passOwner The address to update the whitelist for.
     * @param isWhitelisted The new whitelist status for the address.
     */
    event WhitelistPassOwnerUpdated(
        uint256 indexed organizationId,
        address indexed passOwner,
        bool isWhitelisted
    );

    /**
     * @notice Whitelist addresses for an organization.
     * @dev When an org level whitelist is enabled, only whitelisted addresses can purchase passes.
     * @param organizationId The organization ID to update the whitelist for.
     * @param _addresses The addresses to update the whitelist for.
     * @param _isWhitelisted The new whitelist status for the addresses.
     */
    function whitelistPassOwners(
        uint256 organizationId,
        address[] calldata _addresses,
        bool[] calldata _isWhitelisted
    ) external;

    /**
     * @notice Get the whitelist status for an organization and a purchaser.
     * @param orgId The organization ID to get the whitelist status for.
     * @param purchaser The purchaser to get the whitelist status for.
     * @return True if the purchaser is whitelisted, false otherwise.
     */
    function whitelisted(
        uint256 orgId,
        address purchaser
    ) external view returns (bool);

    /**
     * Mint Closed
     */

    /**
     * @notice Emitted when the mint closed status for an organization is updated.
     * @param organizationId The organization ID to update the mint closed status for.
     * @param isMintClosed True if the mint is closed, false otherwise.
     */
    event MintClosedStatusChanged(
        uint256 indexed organizationId,
        bool isMintClosed
    );

    /**
     * @notice Set a new mint closed status for an organization.
     * @param organizationId The organization ID to set the mint closed status for.
     * @param _isMintClosed True if the mint is closed, false otherwise.
     */
    function setMintClosed(uint256 organizationId, bool _isMintClosed) external;

    /**
     * Gifting
     */

    /**
     * @notice Emitted when the gifting status for an organization is updated.
     * @param organizationId The organization ID to update the gifting status for.
     * @param isGifting True if the organization allows product passes to be gifted to other addresses, false otherwise.
     */
    event GiftingStatusChanged(uint256 indexed organizationId, bool isGifting);

    /**
     * @notice Get the gifting status for an organization.
     * @param orgId The organization ID to get the gifting status for.
     * @return True if the organization allows product passes to be gifted to other addresses, false otherwise.
     */
    function isGiftingEnabled(uint256 orgId) external view returns (bool);

    /**
     * @notice Set a new gifting status for an organization.
     * @param organizationId The organization ID to set the gifting status for.
     * @param _isGifting True if the organization allows product passes to be gifted to other addresses, false otherwise.
     */
    function setGiftingEnabled(
        uint256 organizationId,
        bool _isGifting
    ) external;
}
