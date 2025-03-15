// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface ICouponRegistry {
    /**
     * @notice Coupon struct
     * @param orgId Organization ID that the coupon belongs to
     * @param code Coupon code
     * @param discount Discount percentage. 10 = 0.1%, 100 = 1%, 250 = 2.5%, 1000 = 10%, 10000 = 100%, etc.
     * @param expiration Expiration timestamp when the coupon will no longer be valid. 0 = never expires.
     * @param totalRedemptions Total number of redemptions for the coupon
     * @param maxTotalRedemptions Maximum total redemptions for the coupon. 0 = unlimited.
     * @param isInitialPurchaseOnly True then only initial product pass mint purchases should be able to use the coupon
     * @param isActive True then the coupon is currently active and can be redeemed, else it is inactive and cannot be redeemed
     * @param isRestricted True then the coupon is restricted to a specific group of users that have been granted access
     * @param isOneTimeUse True then the coupon can only be used once per customer
     */
    struct Coupon {
        uint256 orgId;
        string code;
        uint256 discount;
        uint256 expiration;
        uint256 totalRedemptions;
        uint256 maxTotalRedemptions;
        bool isInitialPurchaseOnly;
        bool isActive;
        bool isRestricted;
        bool isOneTimeUse;
    }

    /**
     * @notice Create coupon parameters
     * @param orgId Organization ID that the coupon belongs to
     * @param code Coupon code
     * @param discount Discount percentage. 10 = 0.1%, 100 = 1%, 250 = 2.5%, 1000 = 10%, 10000 = 100%, etc.
     * @param expiration Expiration timestamp when the coupon will no longer be valid. 0 = never expires.
     * @param maxTotalRedemptions Maximum total redemptions for the coupon. 0 = unlimited.
     * @param isInitialPurchaseOnly True then only initial product pass mint purchases should be able to use the coupon
     * @param isActive True then the coupon is currently active and can be redeemed
     * @param isRestricted True then the coupon is restricted to a specific group of users that have been granted access
     * @param isOneTimeUse True then the coupon can only be used once per customer
     */
    struct CreateCouponParams {
        uint256 orgId;
        string code;
        uint256 discount;
        uint256 expiration;
        uint256 maxTotalRedemptions;
        bool isInitialPurchaseOnly;
        bool isActive;
        bool isRestricted;
        bool isOneTimeUse;
    }

    /**
     * @notice Get the total number of coupons that have been created
     * @return The total number of coupons
     */
    function totalCoupons() external view returns (uint256);

    /**
     * Redemption
     */

    /**
     * @notice Invalid coupon code error when redeeming a coupon
     */
    error InvalidCouponCode();

    /**
     * @notice Emitted when a coupon is redeemed
     */
    event CouponRedeemed(
        uint256 indexed orgId,
        uint256 indexed couponId,
        address indexed passOwner
    );

    /**
     * @notice Attempt to redeem the current pass coupon code that is set by recording the redemption and return the discounted amount
     * @dev Will revert if the coupon is not redeemable
     * @param orgId Organization ID that the coupon belongs to
     * @param passOwner Pass owner address
     * @param isInitialPurchase True then the coupon is for an initial product pass mint purchase
     * @param amount Amount to redeem the coupon for
     * @return The discounted total amount
     */
    function redeemCoupon(
        uint256 orgId,
        address passOwner,
        bool isInitialPurchase,
        uint256 amount
    ) external returns (uint256);

    /**
     * Queries
     */

    /**
     * @notice Get a coupon by ID
     * @param couponId Coupon ID
     * @return The coupon
     */
    function getCoupon(uint256 couponId) external view returns (Coupon memory);

    /**
     * @notice Get all the coupon IDs for an organization
     * @param orgId Organization ID
     * @return The coupon IDs
     */
    function getOrgCouponIds(
        uint256 orgId
    ) external view returns (uint256[] memory);

    /**
     * @notice Get all the coupons for an organization
     * @param orgId Organization ID
     * @return The coupons
     */
    function getOrgCoupons(
        uint256 orgId
    ) external view returns (Coupon[] memory);

    /**
     * @notice Check if a coupon exists for an organization
     * @param orgId Organization ID
     * @param code Coupon code
     * @return True if the coupon exists, else false
     */
    function orgCouponExists(
        uint256 orgId,
        string calldata code
    ) external view returns (bool);

    /**
     * @notice Get the coupon ID for an organization and code
     * @param orgId Organization ID
     * @param code Coupon code
     * @return The coupon ID
     */
    function orgCouponCodes(
        uint256 orgId,
        string calldata code
    ) external view returns (uint256);

    /**
     * @notice Get the redeemed coupons for a pass owner
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     * @return The coupons that the pass owner has redeemed
     */
    function getRedeemedCoupons(
        uint256 orgId,
        address passOwner
    ) external view returns (uint256[] memory);

    /**
     * @notice Check if a pass owner has redeemed a coupon
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     * @param couponId Coupon ID
     * @return True if the pass owner has redeemed the coupon, else false
     */
    function hasRedeemedCoupon(
        uint256 orgId,
        address passOwner,
        uint256 couponId
    ) external view returns (bool);

    /**
     * @notice Get the discounted amount for a coupon
     * @param couponId Coupon ID
     * @param amount Amount to get the discounted amount for
     * @return The discounted amount
     */
    function discountedAmount(
        uint256 couponId,
        uint256 amount
    ) external view returns (uint256);

    /**
     * @notice Check if a coupon code is redeemable
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     * @param code Coupon code
     * @param isInitialPurchase True then the coupon is for an initial product pass mint purchase
     * @return True if the coupon is redeemable, else false
     */
    function isCodeRedeemable(
        uint256 orgId,
        address passOwner,
        string memory code,
        bool isInitialPurchase
    ) external view returns (bool);

    /**
     * Creation
     */

    /**
     * @notice Emitted when a coupon is created
     */
    event CouponCreated(uint256 indexed orgId, uint256 indexed couponId);

    /**
     * @notice Creates a new coupon for an organization
     * @param params Coupon parameters
     */
    function createCoupon(CreateCouponParams calldata params) external;

    /**
     * Management
     */

    /**
     * @notice Emitted when a coupon is updated
     */
    event CouponUpdated(uint256 indexed orgId, uint256 indexed couponId);

    /**
     * @notice Emitted when a coupon status is updated
     */
    event CouponStatusUpdated(
        uint256 indexed orgId,
        uint256 indexed couponId,
        bool isActive
    );

    /**
     * @notice Set the discount for a coupon
     * @param couponId Coupon ID
     * @param discount Discount percentage. 10 = 0.1%, 100 = 1%, 250 = 2.5%, 1000 = 10%, 10000 = 100%, etc.
     */
    function setCouponDiscount(uint256 couponId, uint256 discount) external;

    /**
     * @notice Set the expiration for a coupon
     * @dev Will revert if the expiration is in the past
     * @param couponId Coupon ID
     * @param expiration Expiration timestamp when the coupon will no longer be valid. 0 = never expires.
     */
    function setCouponExpiration(uint256 couponId, uint256 expiration) external;

    /**
     * @notice Set the maximum total redemptions for a coupon
     * @param couponId Coupon ID
     * @param maxTotalRedemptions Maximum total redemptions for the coupon. 0 = unlimited.
     */
    function setCouponMaxRedemptions(
        uint256 couponId,
        uint256 maxTotalRedemptions
    ) external;

    /**
     * @notice Set if a coupon is only for initial product pass mint purchases
     * @param couponId Coupon ID
     * @param isInitialPurchaseOnly True then only initial product pass mint purchases should be able to use the coupon
     */
    function setCouponNewCustomers(
        uint256 couponId,
        bool isInitialPurchaseOnly
    ) external;

    /**
     * @notice Set if a coupon is active
     * @param couponId Coupon ID
     * @param active True then the coupon is currently active and can be redeemed, else it is inactive and cannot be redeemed
     */
    function setCouponActive(uint256 couponId, bool active) external;

    /**
     * @notice Set if a coupon is restricted to a specific group of users that have been granted access
     * @param couponId Coupon ID
     * @param restricted True then the coupon is restricted to a specific group of users that have been granted access
     */
    function setCouponRestricted(uint256 couponId, bool restricted) external;

    /**
     * Restricted Access
     */

    /**
     * @notice Batch set the restricted access for a pass owners
     * @param couponId Coupon ID
     * @param passOwners Pass owners addresses
     * @param restricted True then the pass owner has restricted access to the coupon, else false
     */
    function setRestrictedAccess(
        uint256 couponId,
        address[] calldata passOwners,
        bool[] calldata restricted
    ) external;

    /**
     * Pass Owner Codes
     */

    /**
     * @notice Emitted when a pass owner coupon code is set or removed. If removed, the code will be an empty string.
     */
    event PassCouponCodeSet(
        uint256 indexed orgId,
        address indexed passOwner,
        string code
    );

    /**
     * @notice Get the coupon code for a pass owner
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     * @return The coupon code
     */
    function passOwnerCodes(
        uint256 orgId,
        address passOwner
    ) external view returns (string memory);

    /**
     * @notice Check if a pass owner has a coupon code
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     * @return True if the pass owner has a coupon code set, else false
     */
    function hasPassCouponCode(
        uint256 orgId,
        address passOwner
    ) external view returns (bool);

    /**
     * @notice Set the coupon code for a pass owner
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     * @param code Coupon code
     */
    function setPassCouponCode(
        uint256 orgId,
        address passOwner,
        string calldata code
    ) external;

    /**
     * @notice Batch set the coupon code for multiple pass owners
     * @dev Only org admins can call this function
     * @param orgId Organization ID
     * @param passOwners Pass owners addresses
     * @param codes Coupon codes
     */
    function setPassCouponCodeBatch(
        uint256 orgId,
        address[] calldata passOwners,
        string[] calldata codes
    ) external;

    /**
     * @notice Remove the coupon code for a pass owner
     * @param orgId Organization ID
     * @param passOwner Pass owner address
     */
    function removePassCouponCode(uint256 orgId, address passOwner) external;
}
