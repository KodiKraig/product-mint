// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPurchaseManager {
    struct InitialPurchaseParams {
        address to;
        uint256 organizationId;
        uint256[] productIds;
        uint256[] pricingIds;
        uint256[] quantities;
        string couponCode;
        bool airdrop;
        bool pause;
    }

    struct AdditionalPurchaseParams {
        uint256 productPassId;
        uint256[] productIds;
        uint256[] pricingIds;
        uint256[] quantities;
        string couponCode;
        bool airdrop;
        bool pause;
    }

    struct PurchaseProductsParams {
        address passOwner;
        uint256 orgId;
        uint256 productPassId;
        uint256[] productIds;
        uint256[] pricingIds;
        uint256[] quantities;
        string couponCode;
        bool airdrop;
        bool pause;
        bool isInitialPurchase;
    }

    struct ChangeSubscriptionPricingParams {
        uint256 orgId;
        uint256 productPassId;
        uint256 productId;
        uint256 newPricingId;
        bool airdrop;
    }

    error ProductsNotAvailable();

    error InvalidCouponCode();

    error CouponDoesNotExist();

    error NoProductsProvided();

    error ProductIdsAndStatusesLengthMismatch();

    error NotAuthorized();

    event CouponSet(
        uint256 indexed orgId,
        address indexed passOwner,
        string indexed couponCode
    );

    event ProductsPurchased(
        uint256 indexed orgId,
        uint256 indexed productPassId,
        address indexed passOwner,
        uint256[] productIds,
        uint256[] pricingIds,
        uint256[] quantities,
        uint256 amountPaid
    );
}
