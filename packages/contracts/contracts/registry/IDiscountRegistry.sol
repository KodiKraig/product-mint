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

    error DiscountDoesNotExist(uint256 discountId);

    function getDiscount(
        uint256 discountId
    ) external view returns (Discount memory);

    function getDiscountBatch(
        uint256[] calldata discountIds
    ) external view returns (Discount[] memory);

    function getDiscountNames(
        uint256[] calldata discountIds
    ) external view returns (string[] memory);

    function getOrgDiscountIds(
        uint256 orgId
    ) external view returns (uint256[] memory);

    function getPassDiscountIds(
        uint256 passId
    ) external view returns (uint256[] memory);

    function hasPassDiscount(
        uint256 passId,
        uint256 discountId
    ) external view returns (bool);

    function getTotalDiscount(
        uint256[] memory discountIds
    ) external view returns (uint256);

    function getTotalPassDiscount(
        uint256 passId
    ) external view returns (uint256);

    /**
     * Mint Discounts
     */

    event DiscountMinted(
        uint256 indexed orgId,
        uint256 indexed passId,
        uint256 indexed discountId
    );

    error DiscountNotForOrg(uint256 orgId, uint256 discountId);
    error DiscountNotActive(uint256 discountId);
    error DiscountAccessRestricted(uint256 discountId, address passOwner);
    error DiscountMaxMintsReached(uint256 discountId, uint256 maxMints);
    error DiscountAlreadyMinted(uint256 discountId, uint256 passId);

    error PassNotOrgMember(uint256 orgId, uint256 passId);

    function canMintDiscount(
        uint256 orgId,
        uint256 passId,
        address passOwner,
        uint256 discountId
    ) external view;

    function mintDiscountsToPass(
        uint256 orgId,
        uint256 passId,
        address passOwner,
        uint256[] calldata discountIds
    ) external;

    function mintDiscountsToPassByOwner(
        uint256 passId,
        uint256[] calldata discountIds
    ) external;

    function mintDiscountsToPassByOrg(
        uint256 orgId,
        uint256[] calldata passIds,
        uint256[] calldata discountIds
    ) external;

    /**
     * Calculations
     */

    function calculateTotalDiscountedAmount(
        uint256[] memory discountIds,
        uint256 amount
    ) external view returns (uint256);

    function calculateTotalPassDiscountedAmount(
        uint256 passId,
        uint256 amount
    ) external view returns (uint256);

    /**
     * Create Discount
     */

    event DiscountCreated(
        uint256 indexed orgId,
        uint256 indexed discountId,
        string name,
        uint256 discount
    );

    struct CreateDiscountParams {
        uint256 orgId;
        string name;
        uint256 discount;
        uint256 maxMints;
        bool isActive;
        bool isRestricted;
    }

    function createDiscount(CreateDiscountParams calldata params) external;

    /**
     * Update Discount
     */

    event DiscountUpdated(uint256 indexed orgId, uint256 indexed discountId);

    function setDiscountName(uint256 discountId, string calldata name) external;

    function setDiscount(uint256 discountId, uint256 discount) external;

    function setDiscountMaxMints(uint256 discountId, uint256 maxMints) external;

    function setDiscountActive(uint256 discountId, bool isActive) external;

    function setDiscountRestricted(
        uint256 discountId,
        bool isRestricted
    ) external;

    /**
     * Restricted Access
     */

    function setRestrictedAccess(
        uint256 discountId,
        address[] calldata passOwners,
        bool[] calldata restricted
    ) external;
}
