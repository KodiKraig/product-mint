// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

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
     * @notice Get the product IDs that have been purchased for a pass.
     * @param tokenId The Product Pass Token ID to get the product IDs for.
     * @return The product IDs for the pass.
     */
    function getPassProductIds(
        uint256 tokenId
    ) external view returns (uint256[] memory);

    /**
     * @notice Get the number of mints for an organization by a single wallet.
     * @param organizationId The organization ID that the pass belongs to.
     * @param passOwner The owner of the passes.
     * @return The number of mints by the wallet for the organization.
     */
    function passMintCount(
        uint256 organizationId,
        address passOwner
    ) external view returns (uint256);

    /**
     * @notice Get the max mints for an organization.
     * @param organizationId The organization ID to get the max mints for.
     * @return The max amount of product passes that can be minted by a single wallet for the organization.
     */
    function maxMints(uint256 organizationId) external view returns (uint256);

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
     * @notice Record a product purchase and link the products to the pass.
     * @dev Only the purchase manager can record a product purchase.
     * @param _organizationId The organization ID that the product belongs to.
     * @param _passId The Product Pass ID to be used in the purchase.
     * @param _passOwner The owner of the pass.
     * @param _productIds The product IDs to be used in the purchase.
     * @param _pricingIds The pricing IDs to be used in the purchase.
     */
    function recordProductPurchase(
        uint256 _organizationId,
        uint256 _passId,
        address _passOwner,
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
}
