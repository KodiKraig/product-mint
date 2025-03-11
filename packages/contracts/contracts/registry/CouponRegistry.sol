// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {ICouponRegistry} from "./ICouponRegistry.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";

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
 * Coupons can be active or inactive.
 *
 * Coupons can have a maximum number of redemptions.
 *
 */
contract CouponRegistry is RegistryEnabled, ICouponRegistry, IERC165 {
    using EnumerableSet for EnumerableSet.UintSet;

    // Coupon ID => Coupon
    mapping(uint256 => Coupon) private coupons;

    // Organization ID => Coupon IDs
    mapping(uint256 => EnumerableSet.UintSet) private orgCoupons;

    // Organization ID => Coupon Code => Coupon ID
    mapping(uint256 => mapping(string => uint256)) public orgCouponCodes;

    // Organization ID => Pass Owner => Coupon IDs
    mapping(uint256 => mapping(address => EnumerableSet.UintSet))
        private restrictedAccess;

    // Organization ID => Pass Owner => Coupon IDs
    mapping(uint256 => mapping(address => EnumerableSet.UintSet))
        private redeemedCoupons;

    // Organization ID => Pass Owner => Coupon Code
    mapping(uint256 => mapping(address => string)) public passOwnerCodes;

    // Total coupons created
    uint256 public totalCoupons;

    // The denominator for the discount calculation
    uint256 public constant DISCOUNT_DENOMINATOR = 10000;

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

        if (!isCodeRedeemable(orgId, passOwner, code, isInitialPurchase)) {
            revert InvalidCouponCode();
        }

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

    function getRestrictedAccess(
        uint256 orgId,
        address passOwner
    ) external view returns (uint256[] memory) {
        return restrictedAccess[orgId][passOwner].values();
    }

    function hasRestrictedAccess(
        uint256 orgId,
        address passOwner,
        uint256 couponId
    ) external view returns (bool) {
        return restrictedAccess[orgId][passOwner].contains(couponId);
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
    ) public view returns (bool) {
        uint256 couponId = orgCouponCodes[orgId][code];

        if (couponId == 0) {
            return false;
        }

        if (!coupons[couponId].isActive) {
            return false;
        }

        if (
            coupons[couponId].expiration <= block.timestamp &&
            coupons[couponId].expiration != 0
        ) {
            return false;
        }

        if (
            coupons[couponId].maxTotalRedemptions != 0 &&
            coupons[couponId].totalRedemptions >=
            coupons[couponId].maxTotalRedemptions
        ) {
            return false;
        }

        if (coupons[couponId].isInitialPurchaseOnly && !isInitialPurchase) {
            return false;
        }

        if (
            coupons[couponId].isOneTimeUse &&
            redeemedCoupons[orgId][passOwner].contains(couponId)
        ) {
            return false;
        }

        if (
            coupons[couponId].isRestricted &&
            !restrictedAccess[orgId][passOwner].contains(couponId)
        ) {
            return false;
        }

        return true;
    }

    function discountedAmount(
        uint256 couponId,
        uint256 amount
    ) public view returns (uint256) {
        return
            amount -
            (amount * coupons[couponId].discount) /
            DISCOUNT_DENOMINATOR;
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

        coupons[totalCoupons].orgId = params.orgId;
        coupons[totalCoupons].code = params.code;
        coupons[totalCoupons].isInitialPurchaseOnly = params
            .isInitialPurchaseOnly;
        coupons[totalCoupons].isActive = params.isActive;
        coupons[totalCoupons].isRestricted = params.isRestricted;
        coupons[totalCoupons].isOneTimeUse = params.isOneTimeUse;

        _setCouponDiscount(totalCoupons, params.discount);
        _setCouponExpiration(totalCoupons, params.expiration);
        _setCouponMaxRedemptions(totalCoupons, params.maxTotalRedemptions);

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
        _setCouponDiscount(couponId, discount);

        emit CouponUpdated(coupons[couponId].orgId, couponId);
    }

    function _setCouponDiscount(uint256 couponId, uint256 discount) internal {
        require(
            discount > 0 && discount <= DISCOUNT_DENOMINATOR,
            "Invalid discount"
        );

        coupons[couponId].discount = discount;
    }

    function setCouponExpiration(
        uint256 couponId,
        uint256 expiration
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        _setCouponExpiration(couponId, expiration);

        emit CouponUpdated(coupons[couponId].orgId, couponId);
    }

    function _setCouponExpiration(
        uint256 couponId,
        uint256 expiration
    ) internal {
        require(
            expiration > block.timestamp || expiration == 0,
            "Invalid expiration"
        );

        coupons[couponId].expiration = expiration;
    }

    function setCouponMaxRedemptions(
        uint256 couponId,
        uint256 maxTotalRedemptions
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        _setCouponMaxRedemptions(couponId, maxTotalRedemptions);

        emit CouponUpdated(coupons[couponId].orgId, couponId);
    }

    function _setCouponMaxRedemptions(
        uint256 couponId,
        uint256 maxTotalRedemptions
    ) internal {
        require(
            maxTotalRedemptions == 0 ||
                maxTotalRedemptions >= coupons[couponId].totalRedemptions,
            "Invalid max total redemptions"
        );

        coupons[couponId].maxTotalRedemptions = maxTotalRedemptions;
    }

    function setCouponNewCustomers(
        uint256 couponId,
        bool isInitialPurchaseOnly
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        coupons[couponId].isInitialPurchaseOnly = isInitialPurchaseOnly;

        emit CouponUpdated(coupons[couponId].orgId, couponId);
    }

    function setCouponActive(
        uint256 couponId,
        bool active
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        coupons[couponId].isActive = active;

        emit CouponStatusUpdated(coupons[couponId].orgId, couponId, active);
        emit CouponUpdated(coupons[couponId].orgId, couponId);
    }

    function setCouponRestricted(
        uint256 couponId,
        bool restricted
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        coupons[couponId].isRestricted = restricted;

        emit CouponUpdated(coupons[couponId].orgId, couponId);
    }

    /**
     * Restricted Access
     */

    function setRestrictedAccess(
        uint256 couponId,
        address[] calldata passOwners,
        bool[] calldata restricted
    ) external onlyOrgAdmin(coupons[couponId].orgId) {
        require(
            passOwners.length > 0 && passOwners.length == restricted.length,
            "Invalid input length"
        );

        for (uint256 i = 0; i < passOwners.length; i++) {
            if (restricted[i]) {
                restrictedAccess[coupons[couponId].orgId][passOwners[i]].add(
                    couponId
                );
            } else {
                restrictedAccess[coupons[couponId].orgId][passOwners[i]].remove(
                        couponId
                    );
            }

            emit RestrictedAccessUpdated(
                coupons[couponId].orgId,
                couponId,
                passOwners[i],
                restricted[i]
            );
        }
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
    ) external pure returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(ICouponRegistry).interfaceId;
    }
}
