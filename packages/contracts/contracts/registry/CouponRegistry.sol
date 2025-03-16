// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {ICouponRegistry} from "./ICouponRegistry.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {DiscountCalculator} from "../abstract/DiscountCalculator.sol";
import {RestrictedAccess} from "../abstract/RestrictedAccess.sol";

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
 * @title CouponRegistry
 * @notice A contract that manages coupons that can be applied during checkout or subscription renewals.
 *
 * Coupons can be created by the organization admin.
 *
 * Coupons can be redeemed by the pass owner.
 *
 * Coupons can be restricted to certain pass owners.
 *
 * Coupons can be one time use.
 *
 * Coupons can set to be initial purchase only.
 *
 * Coupons can be active or inactive.
 *
 * Coupons can have a maximum number of redemptions.
 *
 */
contract CouponRegistry is
    RegistryEnabled,
    DiscountCalculator,
    RestrictedAccess,
    ICouponRegistry
{
    using EnumerableSet for EnumerableSet.UintSet;

    // Coupon ID => Coupon
    mapping(uint256 => Coupon) private coupons;

    // Organization ID => Coupon IDs
    mapping(uint256 => EnumerableSet.UintSet) private orgCoupons;

    // Organization ID => Coupon Code => Coupon ID
    mapping(uint256 => mapping(string => uint256)) public orgCouponCodes;

    // Organization ID => Pass Owner => Coupon IDs
    mapping(uint256 => mapping(address => EnumerableSet.UintSet))
        private redeemedCoupons;

    // Organization ID => Pass Owner => Coupon Code
    mapping(uint256 => mapping(address => string)) public passOwnerCodes;

    // Total coupons created
    uint256 public totalCoupons;

    constructor(address _contractRegistry) RegistryEnabled(_contractRegistry) {}

    /**
     * Redemption
     */

    function redeemCoupon(
        uint256 orgId,
        address passOwner,
        bool isInitialPurchase,
        uint256 amount
    ) external onlyRegistry(registry.purchaseManager()) returns (uint256) {
        string memory code = passOwnerCodes[orgId][passOwner];

        isCodeRedeemable(orgId, passOwner, code, isInitialPurchase);

        uint256 couponId = orgCouponCodes[orgId][code];

        coupons[couponId].totalRedemptions++;
        redeemedCoupons[orgId][passOwner].add(couponId);

        emit CouponRedeemed(orgId, couponId, passOwner);

        return discountedAmount(couponId, amount);
    }

    /**
     * Queries
     */

    function getCoupon(uint256 couponId) external view returns (Coupon memory) {
        return coupons[couponId];
    }

    function getOrgCouponIds(
        uint256 orgId
    ) external view returns (uint256[] memory) {
        return orgCoupons[orgId].values();
    }

    function getOrgCoupons(
        uint256 orgId
    ) external view returns (Coupon[] memory _coupons) {
        uint256[] memory couponIds = orgCoupons[orgId].values();

        _coupons = new Coupon[](couponIds.length);

        for (uint256 i = 0; i < couponIds.length; i++) {
            _coupons[i] = coupons[couponIds[i]];
        }
    }

    function orgCouponExists(
        uint256 orgId,
        string calldata code
    ) external view returns (bool) {
        return orgCouponCodes[orgId][code] != 0;
    }

    function getRedeemedCoupons(
        uint256 orgId,
        address passOwner
    ) external view returns (uint256[] memory) {
        return redeemedCoupons[orgId][passOwner].values();
    }

    function hasRedeemedCoupon(
        uint256 orgId,
        address passOwner,
        uint256 couponId
    ) external view returns (bool) {
        return redeemedCoupons[orgId][passOwner].contains(couponId);
    }

    function isCodeRedeemable(
        uint256 orgId,
        address passOwner,
        string memory code,
        bool isInitialPurchase
    ) public view {
        uint256 couponId = orgCouponCodes[orgId][code];

        if (couponId == 0) {
            revert CouponCodeNotFound(code);
        }

        Coupon memory coupon = coupons[couponId];

        if (!coupon.isActive) {
            revert CouponNotActive(couponId);
        }

        if (coupon.expiration <= block.timestamp && coupon.expiration != 0) {
            revert CouponExpired(couponId);
        }

        if (
            coupon.maxTotalRedemptions != 0 &&
            coupon.totalRedemptions >= coupon.maxTotalRedemptions
        ) {
            revert CouponMaxRedemptionsReached(
                couponId,
                coupon.maxTotalRedemptions
            );
        }

        if (coupon.isInitialPurchaseOnly && !isInitialPurchase) {
            revert CouponInitialPurchaseOnly(couponId);
        }

        if (
            coupon.isOneTimeUse &&
            redeemedCoupons[orgId][passOwner].contains(couponId)
        ) {
            revert CouponAlreadyRedeemed(couponId, passOwner);
        }

        if (
            coupon.isRestricted &&
            !restrictedAccess[orgId][passOwner].contains(couponId)
        ) {
            revert CouponRestricted(couponId, passOwner);
        }
    }

    function discountedAmount(
        uint256 couponId,
        uint256 amount
    ) public view returns (uint256) {
        return _calculateDiscountAmount(coupons[couponId].discount, amount);
    }

    /**
     * Creation
     */

    function createCoupon(
        CreateCouponParams calldata params
    ) external onlyOrgAdmin(params.orgId) {
        require(
            bytes(params.code).length > 0 && bytes(params.code).length <= 32,
            "Invalid code length"
        );
        require(
            orgCouponCodes[params.orgId][params.code] == 0,
            "Coupon code already exists"
        );

        totalCoupons++;

        Coupon storage coupon = coupons[totalCoupons];

        coupon.orgId = params.orgId;
        coupon.code = params.code;
        coupon.isInitialPurchaseOnly = params.isInitialPurchaseOnly;
        coupon.isActive = params.isActive;
        coupon.isRestricted = params.isRestricted;
        coupon.isOneTimeUse = params.isOneTimeUse;

        _setCouponDiscount(coupon, params.discount);
        _setCouponExpiration(coupon, params.expiration);
        _setCouponMaxRedemptions(coupon, params.maxTotalRedemptions);

        orgCouponCodes[params.orgId][params.code] = totalCoupons;
        orgCoupons[params.orgId].add(totalCoupons);

        emit CouponCreated(params.orgId, totalCoupons);
    }

    /**
     * Management
     */

    function setCouponDiscount(
        uint256 couponId,
        uint256 discount
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        Coupon storage coupon = coupons[couponId];

        _setCouponDiscount(coupon, discount);

        emit CouponUpdated(coupon.orgId, couponId);
    }

    function _setCouponDiscount(
        Coupon storage coupon,
        uint256 discount
    ) internal {
        require(_isDiscountValid(discount), "Invalid discount");

        coupon.discount = discount;
    }

    function setCouponExpiration(
        uint256 couponId,
        uint256 expiration
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        Coupon storage coupon = coupons[couponId];

        _setCouponExpiration(coupon, expiration);

        emit CouponUpdated(coupon.orgId, couponId);
    }

    function _setCouponExpiration(
        Coupon storage coupon,
        uint256 expiration
    ) internal {
        require(
            expiration > block.timestamp || expiration == 0,
            "Invalid expiration"
        );

        coupon.expiration = expiration;
    }

    function setCouponMaxRedemptions(
        uint256 couponId,
        uint256 maxTotalRedemptions
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        Coupon storage coupon = coupons[couponId];

        _setCouponMaxRedemptions(coupon, maxTotalRedemptions);

        emit CouponUpdated(coupon.orgId, couponId);
    }

    function _setCouponMaxRedemptions(
        Coupon storage coupon,
        uint256 maxTotalRedemptions
    ) internal {
        require(
            maxTotalRedemptions == 0 ||
                maxTotalRedemptions >= coupon.totalRedemptions,
            "Invalid max total redemptions"
        );

        coupon.maxTotalRedemptions = maxTotalRedemptions;
    }

    function setCouponNewCustomers(
        uint256 couponId,
        bool isInitialPurchaseOnly
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        Coupon storage coupon = coupons[couponId];

        coupon.isInitialPurchaseOnly = isInitialPurchaseOnly;

        emit CouponUpdated(coupon.orgId, couponId);
    }

    function setCouponActive(
        uint256 couponId,
        bool active
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        Coupon storage coupon = coupons[couponId];

        coupon.isActive = active;

        emit CouponStatusUpdated(coupon.orgId, couponId, active);
        emit CouponUpdated(coupon.orgId, couponId);
    }

    function setCouponRestricted(
        uint256 couponId,
        bool restricted
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        Coupon storage coupon = coupons[couponId];

        coupon.isRestricted = restricted;

        emit CouponUpdated(coupon.orgId, couponId);
    }

    /**
     * Restricted Access
     */

    function setRestrictedAccess(
        uint256 couponId,
        address[] calldata passOwners,
        bool[] calldata restricted
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        _setRestrictedAccess(
            coupons[couponId].orgId,
            couponId,
            passOwners,
            restricted
        );
    }

    /**
     * Pass Owner Codes
     */

    function hasPassCouponCode(
        uint256 orgId,
        address passOwner
    ) public view returns (bool) {
        return bytes(passOwnerCodes[orgId][passOwner]).length > 0;
    }

    function setPassCouponCode(
        uint256 orgId,
        address passOwner,
        string calldata code
    ) external hasCouponCodeAccess(orgId, passOwner) {
        _orgOwner(orgId);
        require(orgCouponCodes[orgId][code] != 0, "Coupon code does not exist");

        passOwnerCodes[orgId][passOwner] = code;

        emit PassCouponCodeSet(orgId, passOwner, code);
    }

    function setPassCouponCodeBatch(
        uint256 orgId,
        address[] calldata passOwners,
        string[] calldata codes
    ) external onlyOrgAdmin(orgId) {
        require(
            passOwners.length > 0 && passOwners.length == codes.length,
            "Invalid input length"
        );

        for (uint256 i = 0; i < passOwners.length; i++) {
            passOwnerCodes[orgId][passOwners[i]] = codes[i];

            emit PassCouponCodeSet(orgId, passOwners[i], codes[i]);
        }
    }

    function removePassCouponCode(
        uint256 orgId,
        address passOwner
    ) external hasCouponCodeAccess(orgId, passOwner) {
        require(hasPassCouponCode(orgId, passOwner), "Coupon code is not set");

        delete passOwnerCodes[orgId][passOwner];

        emit PassCouponCodeSet(orgId, passOwner, "");
    }

    modifier hasCouponCodeAccess(uint256 orgId, address passOwner) {
        require(
            _msgSender() == passOwner ||
                _msgSender() == registry.purchaseManager() ||
                _isOrgAdmin(orgId),
            "Not authorized to update coupon code"
        );
        _;
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(ICouponRegistry).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
