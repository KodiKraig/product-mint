// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IDiscountRegistry {
    /**
     * Discount
     */

    /**
     * @notice Discount struct
     * @param orgId The organization ID
     * @param name The name of the discount
     * @param discount The discount amount
     * @param totalMints The total number of mints for the discount
     * @param maxMints The maximum number of times the discount can be minted
     * @param isActive Whether the discount is active
     * @param isRestricted Whether the discount is restricted
     */
    struct Discount {
        uint256 orgId;
        string name;
        uint256 discount;
        uint256 totalMints;
        uint256 maxMints;
        bool isActive;
        bool isRestricted;
    }

    /**
     * @notice Total number of discounts created
     * @return The total number of discounts created
     */
    function totalDiscounts() external view returns (uint256);

    /**
     * Get Discounts
     */

    /**
     * @notice Revert when discount does not exist
     * @param discountId The discount ID
     */
    error DiscountDoesNotExist(uint256 discountId);

    /**
     * @notice Get discount details
     * @param discountId The discount ID
     * @return The discount
     */
    function getDiscount(
        uint256 discountId
    ) external view returns (Discount memory);

    /**
     * @notice Get discount details for multiple discounts
     * @param discountIds The discount IDs
     * @return The discounts
     */
    function getDiscountBatch(
        uint256[] calldata discountIds
    ) external view returns (Discount[] memory);

    /**
     * @notice Get discount names
     * @param discountIds The discount IDs
     * @return The discount names
     */
    function getDiscountNames(
        uint256[] calldata discountIds
    ) external view returns (string[] memory);

    /**
     * @notice Get organization discount IDs for discounts created by the organization
     * @param orgId The organization ID
     * @return The discount IDs
     */
    function getOrgDiscountIds(
        uint256 orgId
    ) external view returns (uint256[] memory);

    /**
     * @notice Get all discount IDs minted onto a pass
     * @param passId The pass ID
     * @return The discount IDs
     */
    function getPassDiscountIds(
        uint256 passId
    ) external view returns (uint256[] memory);

    /**
     * @notice Check if a pass has a discount
     * @param passId The pass ID
     * @param discountId The discount ID
     * @return True if the pass has the discount, false otherwise
     */
    function hasPassDiscount(
        uint256 passId,
        uint256 discountId
    ) external view returns (bool);

    /**
     * @notice Get the total discount for a list of discounts
     * @param discountIds The discount IDs
     * @return The total discount
     */
    function getTotalDiscount(
        uint256[] memory discountIds
    ) external view returns (uint256);

    /**
     * @notice Get the total discount for a pass by summing all discounts minted onto the pass
     * @param passId The pass ID
     * @return The total discount
     */
    function getTotalPassDiscount(
        uint256 passId
    ) external view returns (uint256);

    /**
     * Mint Discounts
     */

    /**
     * @notice Emitted when a discount is minted onto a pass
     * @param orgId The organization ID
     * @param passId The pass ID
     * @param discountId The discount ID
     */
    event DiscountMinted(
        uint256 indexed orgId,
        uint256 indexed passId,
        uint256 indexed discountId
    );

    /**
     * @notice Revert when discount is not for organization during minting
     * @param orgId The organization ID
     * @param discountId The discount ID
     */
    error DiscountNotForOrg(uint256 orgId, uint256 discountId);

    /**
     * @notice Revert when discount is not active during minting and cannot be minted
     * @param discountId The discount ID
     */
    error DiscountNotActive(uint256 discountId);

    /**
     * @notice Revert when discount is restricted and access is not granted during minting
     * @param discountId The discount ID
     * @param passOwner The pass owner
     */
    error DiscountAccessRestricted(uint256 discountId, address passOwner);

    /**
     * @notice Revert when discount max mints is reached during minting
     * @param discountId The discount ID
     * @param maxMints The maximum number of mints
     */
    error DiscountMaxMintsReached(uint256 discountId, uint256 maxMints);

    /**
     * @notice Revert when discount is already minted onto a pass
     * @param discountId The discount ID
     * @param passId The pass ID
     */
    error DiscountAlreadyMinted(uint256 discountId, uint256 passId);

    /**
     * @notice Revert when pass is not a member of the organization
     * @param orgId The organization ID
     * @param passId The pass ID
     */
    error PassNotOrgMember(uint256 orgId, uint256 passId);

    /**
     * @notice Check if a discount can be minted by a pass owner
     * @dev will revert if any of the checks fail
     * @param orgId The organization ID
     * @param passId The pass ID
     * @param passOwner The pass owner
     * @param discountId The discount ID
     */
    function canMintDiscount(
        uint256 orgId,
        uint256 passId,
        address passOwner,
        uint256 discountId
    ) external view;

    /**
     * @notice Mint discounts onto a pass
     * @dev used by purchase manager
     * @param orgId The organization ID
     * @param passId The pass ID
     * @param passOwner The pass owner
     * @param discountIds The discount IDs
     */
    function mintDiscountsToPass(
        uint256 orgId,
        uint256 passId,
        address passOwner,
        uint256[] calldata discountIds
    ) external;

    /**
     * @notice Mint discounts onto a pass by a pass owner
     * @dev used by pass owner
     * @param passId The pass ID
     * @param discountIds The discount IDs
     */
    function mintDiscountsToPassByOwner(
        uint256 passId,
        uint256[] calldata discountIds
    ) external;

    /**
     * @notice Mint discounts onto a pass by an organization
     * @dev used by organization
     * @param orgId The organization ID
     * @param passIds The pass IDs
     * @param discountIds The discount IDs
     */
    function mintDiscountsToPassByOrg(
        uint256 orgId,
        uint256[] calldata passIds,
        uint256[] calldata discountIds
    ) external;

    /**
     * Calculations
     */

    /**
     * @notice Calculate the total discounted amount for a list of discounts
     * @param discountIds The discount IDs
     * @param amount The amount to be discounted
     * @return The total discounted amount
     */
    function calculateTotalDiscountedAmount(
        uint256[] memory discountIds,
        uint256 amount
    ) external view returns (uint256);

    /**
     * @notice Calculate the total discounted amount for a pass by summing all discounts minted onto the pass
     * @param passId The pass ID
     * @param amount The amount to be discounted
     * @return The total discounted amount
     */
    function calculateTotalPassDiscountedAmount(
        uint256 passId,
        uint256 amount
    ) external view returns (uint256);

    /**
     * Create Discount
     */

    /**
     * @notice Emitted when a discount is created
     * @param orgId The organization ID
     * @param discountId The discount ID
     * @param name The name of the discount
     * @param discount The discount in basis points up to 10000
     */
    event DiscountCreated(
        uint256 indexed orgId,
        uint256 indexed discountId,
        string name,
        uint256 discount
    );

    /**
     * @notice Create discount params
     * @param orgId The organization ID
     * @param name The name of the discount
     * @param discount The discount in basis points up to 10000
     * @param maxMints The maximum number of times the discount can be minted. 0 means unlimited.
     * @param isActive Whether the discount is active. Must be true to be minted.
     * @param isRestricted Whether the discount is restricted. If true, only specific pass owners can mint the discount.
     */
    struct CreateDiscountParams {
        uint256 orgId;
        string name;
        uint256 discount;
        uint256 maxMints;
        bool isActive;
        bool isRestricted;
    }

    /**
     * @notice Create a new discount
     * @param params The create discount params
     */
    function createDiscount(CreateDiscountParams calldata params) external;

    /**
     * Update Discount
     */

    /**
     * @notice Emitted when a discount is updated
     * @param orgId The organization ID
     * @param discountId The discount ID
     */
    event DiscountUpdated(uint256 indexed orgId, uint256 indexed discountId);

    /**
     * @notice Set discount name
     * @param discountId The discount ID
     * @param name The new name of the discount
     */
    function setDiscountName(uint256 discountId, string calldata name) external;

    /**
     * @notice Set discount
     * @param discountId The discount ID
     * @param discount The new discount in basis points up to 10000
     */
    function setDiscount(uint256 discountId, uint256 discount) external;

    /**
     * @notice Set discount max mints
     * @param discountId The discount ID
     * @param maxMints The new maximum number of times the discount can be minted. 0 means unlimited.
     */
    function setDiscountMaxMints(uint256 discountId, uint256 maxMints) external;

    /**
     * @notice Set discount active
     * @param discountId The discount ID
     * @param isActive Whether the discount is active and can be minted.
     */
    function setDiscountActive(uint256 discountId, bool isActive) external;

    /**
     * @notice Set discount restricted
     * @param discountId The discount ID
     * @param isRestricted Whether the discount is restricted. If true, only specific pass owners can mint the discount.
     */
    function setDiscountRestricted(
        uint256 discountId,
        bool isRestricted
    ) external;

    /**
     * Restricted Access
     */

    /**
     * @notice Set restricted access
     * @param discountId The discount ID
     * @param passOwners The pass owners
     * @param restricted Whether the pass owners can mint the discount.
     */
    function setRestrictedAccess(
        uint256 discountId,
        address[] calldata passOwners,
        bool[] calldata restricted
    ) external;
}
