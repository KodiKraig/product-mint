// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

import {IPurchaseManager} from "./IPurchaseManager.sol";
import {IProductPassNFT} from "../tokens/IProductPassNFT.sol";
import {IProductRegistry} from "../registry/IProductRegistry.sol";
import {IPricingRegistry} from "../registry/IPricingRegistry.sol";
import {IPaymentEscrow} from "../escrow/IPaymentEscrow.sol";
import {ISubscriptionEscrow} from "../escrow/ISubscriptionEscrow.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";
import {IPricingCalculator} from "../calculator/IPricingCalculator.sol";
import {ICouponRegistry} from "../registry/ICouponRegistry.sol";
import {IDiscountRegistry} from "../registry/IDiscountRegistry.sol";
import {PermissionChecker} from "../abstract/PermissionChecker.sol";
import {PermissionUtils} from "../libs/PermissionUtils.sol";

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
 * @title PurchaseManager
 * @notice The PurchaseManager is responsible for purchasing products and managing subscriptions for a user.
 * When a product is purchased, a Product Pass NFT is minted to the user.
 *
 * The PurchaseManager is also responsible for renewing subscriptions, pausing and cancelling subscriptions, and
 * changing the pricing model for an existing subscription.
 */
contract PurchaseManager is
    Ownable2Step,
    RegistryEnabled,
    ReentrancyGuard,
    Pausable,
    IPurchaseManager,
    IERC165,
    PermissionChecker
{
    // Total number of product pass tokens minted
    uint256 public passSupply;

    constructor(
        address _contractRegistry,
        address _permissionRegistry
    )
        Ownable(_msgSender())
        RegistryEnabled(_contractRegistry)
        ReentrancyGuard()
        Pausable()
        PermissionChecker(_permissionRegistry)
    {}

    /**
     * Purchase Products
     */

    function purchaseProducts(
        InitialPurchaseParams calldata params
    ) external payable nonReentrant whenNotPaused {
        passSupply++;

        address purchaser = _msgSender();

        permissionRegistry.setOwnerInitialPermissions(
            params.organizationId,
            purchaser
        );

        if (params.discountIds.length > 0) {
            IDiscountRegistry(registry.discountRegistry()).mintDiscountsToPass(
                params.organizationId,
                passSupply,
                purchaser,
                params.discountIds
            );
        }

        _purchaseProducts(
            PurchaseProductsParams({
                passOwner: params.to,
                purchaser: purchaser,
                orgId: params.organizationId,
                productPassId: passSupply,
                productIds: params.productIds,
                pricingIds: params.pricingIds,
                quantities: params.quantities,
                couponCode: params.couponCode,
                airdrop: params.airdrop,
                pause: params.pause ||
                    (purchaser != params.to &&
                        !_isOrgAdmin(params.organizationId)),
                isInitialPurchase: true
            })
        );

        IProductPassNFT(registry.productPassNFT()).mint(params.to, passSupply);
    }

    function purchaseAdditionalProducts(
        AdditionalPurchaseParams calldata params
    ) external payable onlyPassOwnerOrAdmin(params.productPassId) nonReentrant {
        address passOwner = _passOwner(params.productPassId);

        uint256 orgId = IPurchaseRegistry(registry.purchaseRegistry())
            .passOrganization(params.productPassId);

        _checkPermissionName(
            PermissionUtils.PASS_PURCHASE_ADDITIONAL,
            orgId,
            passOwner
        );

        _purchaseProducts(
            PurchaseProductsParams({
                passOwner: passOwner,
                purchaser: passOwner,
                orgId: orgId,
                productPassId: params.productPassId,
                productIds: params.productIds,
                pricingIds: params.pricingIds,
                quantities: params.quantities,
                couponCode: params.couponCode,
                airdrop: params.airdrop,
                pause: params.pause,
                isInitialPurchase: false
            })
        );
    }

    function _purchaseProducts(PurchaseProductsParams memory params) internal {
        IProductRegistry(registry.productRegistry()).canPurchaseProducts(
            params.orgId,
            params.productIds,
            params.pricingIds
        );

        (address token, uint256[] memory cycleDurations) = IPricingRegistry(
            registry.pricingRegistry()
        ).validateCheckoutBatch(
                params.orgId,
                params.passOwner,
                params.pricingIds,
                params.quantities
            );

        if (bytes(params.couponCode).length > 0) {
            _setCoupon(params.orgId, params.purchaser, params.couponCode);
        }

        IPurchaseRegistry(registry.purchaseRegistry()).recordProductPurchase(
            params.orgId,
            params.productPassId,
            params.passOwner,
            params.purchaser,
            params.productIds,
            params.pricingIds
        );

        ISubscriptionEscrow(registry.subscriptionEscrow()).createSubscriptions(
            params.orgId,
            params.productPassId,
            params.productIds,
            params.pricingIds,
            cycleDurations,
            params.quantities,
            params.pause
        );

        uint256 totalAmount = IPricingCalculator(registry.pricingCalculator())
            .getInitialPurchaseCost(params.pricingIds, params.quantities);

        if (totalAmount > 0) {
            _performPurchase(
                PerformPurchaseParams({
                    orgId: params.orgId,
                    productPassId: params.productPassId,
                    purchaser: params.purchaser,
                    passOwner: params.passOwner,
                    totalAmount: totalAmount,
                    token: token,
                    airdrop: params.airdrop,
                    isInitialPurchase: params.isInitialPurchase,
                    forceCoupon: true
                })
            );
        }

        emit ProductsPurchased(
            params.orgId,
            params.productPassId,
            params.passOwner,
            params.productIds,
            params.pricingIds,
            params.quantities,
            token,
            totalAmount
        );
    }

    /**
     * Change subscription pricing
     */

    function changeSubscriptionPricing(
        ChangeSubscriptionPricingParams calldata params
    ) external onlyPassOwnerOrAdmin(params.productPassId) nonReentrant {
        IProductRegistry(registry.productRegistry()).canPurchaseProduct(
            params.orgId,
            params.productId,
            params.newPricingId
        );

        address passOwner = _passOwner(params.productPassId);

        _checkPermissionName(
            PermissionUtils.PASS_SUBSCRIPTION_PRICING,
            params.orgId,
            passOwner
        );

        IPricingRegistry(registry.pricingRegistry()).validateCheckout(
            params.orgId,
            passOwner,
            params.newPricingId,
            ISubscriptionEscrow(registry.subscriptionEscrow()).getUnitQuantity(
                params.productPassId,
                params.productId
            )
        );

        (address token, uint256 amount) = ISubscriptionEscrow(
            registry.subscriptionEscrow()
        ).changeSubscriptionPricing(
                params.productPassId,
                params.productId,
                params.newPricingId,
                _isPassOwner(params.productPassId)
            );

        if (amount > 0) {
            _performPurchase(
                PerformPurchaseParams({
                    orgId: params.orgId,
                    productPassId: params.productPassId,
                    passOwner: passOwner,
                    purchaser: passOwner,
                    totalAmount: amount,
                    token: token,
                    airdrop: params.airdrop,
                    isInitialPurchase: false,
                    forceCoupon: false
                })
            );
        }
    }

    /**
     * Renew subscription
     */

    function renewSubscription(
        uint256 productPassId,
        uint256 productId,
        bool airdrop
    ) external nonReentrant whenNotPaused {
        _renewSubscription(productPassId, productId, airdrop);
    }

    function renewSubscriptionBatch(
        uint256 productPassId,
        uint256[] calldata productIds,
        bool airdrop
    ) external nonReentrant whenNotPaused {
        if (productIds.length == 0) {
            revert NoProductsProvided();
        }

        for (uint256 i = 0; i < productIds.length; i++) {
            _renewSubscription(productPassId, productIds[i], airdrop);
        }
    }

    function _renewSubscription(
        uint256 productPassId,
        uint256 productId,
        bool airdrop
    ) internal {
        (uint256 orgId, address token, uint256 price) = ISubscriptionEscrow(
            registry.subscriptionEscrow()
        ).renewSubscription(productPassId, productId);

        address passOwner = _passOwner(productPassId);

        _checkPermissionName(
            PermissionUtils.PASS_SUBSCRIPTION_RENEWAL,
            orgId,
            passOwner
        );

        if (price > 0) {
            _performPurchase(
                PerformPurchaseParams({
                    orgId: orgId,
                    productPassId: productPassId,
                    passOwner: passOwner,
                    purchaser: passOwner,
                    totalAmount: price,
                    token: token,
                    airdrop: airdrop,
                    isInitialPurchase: false,
                    forceCoupon: false
                })
            );
        }
    }

    /**
     * Tiered Subscription Unit Quantity
     */

    function changeTieredSubscriptionUnitQuantity(
        uint256 productPassId,
        uint256 productId,
        uint256 quantity,
        bool airdrop
    ) external onlyPassOwnerOrAdmin(productPassId) nonReentrant {
        (uint256 orgId, address token, uint256 amount) = ISubscriptionEscrow(
            registry.subscriptionEscrow()
        ).changeSubscriptionUnitQuantity(productPassId, productId, quantity);

        address passOwner = _passOwner(productPassId);

        _checkPermissionName(
            PermissionUtils.PASS_SUBSCRIPTION_QUANTITY,
            orgId,
            passOwner
        );

        if (amount > 0) {
            _performPurchase(
                PerformPurchaseParams({
                    orgId: orgId,
                    productPassId: productPassId,
                    passOwner: passOwner,
                    purchaser: passOwner,
                    totalAmount: amount,
                    token: token,
                    airdrop: airdrop,
                    isInitialPurchase: false,
                    forceCoupon: false
                })
            );
        }
    }

    /**
     * Pause subscription
     */

    function pauseSubscription(
        uint256 productPassId,
        uint256 productId,
        bool _pause
    ) external onlyPassOwnerOrAdmin(productPassId) nonReentrant {
        _pauseSubscription(productPassId, productId, _pause);
    }

    function pauseSubscriptionBatch(
        uint256 productPassId,
        uint256[] calldata productIds,
        bool[] calldata pause
    ) external onlyPassOwnerOrAdmin(productPassId) nonReentrant {
        _checkProductStatuses(productIds, pause);

        for (uint256 i = 0; i < productIds.length; i++) {
            _pauseSubscription(productPassId, productIds[i], pause[i]);
        }
    }

    function _pauseSubscription(
        uint256 productPassId,
        uint256 productId,
        bool _pause
    ) internal {
        bool needsRenewal = ISubscriptionEscrow(registry.subscriptionEscrow())
            .pauseSubscription(productPassId, productId, _pause);

        if (!_pause && needsRenewal) {
            _renewSubscription(productPassId, productId, false);
        }
    }

    /**
     * Cancel subscription
     */

    function cancelSubscription(
        uint256 productPassId,
        uint256 productId,
        bool cancel
    ) external onlyPassOwnerOrAdmin(productPassId) nonReentrant {
        _cancelSubscription(productPassId, productId, cancel);
    }

    function cancelSubscriptionBatch(
        uint256 productPassId,
        uint256[] calldata productIds,
        bool[] calldata cancel
    ) external onlyPassOwnerOrAdmin(productPassId) nonReentrant {
        _checkProductStatuses(productIds, cancel);

        for (uint256 i = 0; i < productIds.length; i++) {
            _cancelSubscription(productPassId, productIds[i], cancel[i]);
        }
    }

    function _cancelSubscription(
        uint256 productPassId,
        uint256 productId,
        bool cancel
    ) internal {
        bool needsRenewal = ISubscriptionEscrow(registry.subscriptionEscrow())
            .cancelSubscription(productPassId, productId, cancel);

        if (!cancel && needsRenewal) {
            _renewSubscription(productPassId, productId, false);
        }
    }

    /**
     * Payment Processing
     */

    function _performPurchase(PerformPurchaseParams memory params) internal {
        if (params.airdrop) {
            _checkOrgAdmin(params.orgId);
            return;
        }

        // Apply coupon discount first
        if (
            ICouponRegistry(registry.couponRegistry()).hasPassCouponCode(
                params.orgId,
                params.purchaser
            )
        ) {
            params.totalAmount = _redeemCoupon(
                params.orgId,
                params.purchaser,
                params.totalAmount,
                params.isInitialPurchase,
                params.forceCoupon
            );
        }

        // Apply permanent pass discounts
        params.totalAmount = IDiscountRegistry(registry.discountRegistry())
            .calculateTotalPassDiscountedAmount(
                params.productPassId,
                params.totalAmount
            );

        // Transfer funds
        if (params.totalAmount > 0) {
            _checkPermissionName(
                PermissionUtils.PASS_WALLET_SPEND,
                params.orgId,
                params.purchaser
            );

            IPaymentEscrow(registry.paymentEscrow()).transferDirect{
                value: msg.value
            }(
                params.orgId,
                payable(params.purchaser),
                params.token,
                params.totalAmount
            );
        }

        emit PerformPurchase(
            params.orgId,
            params.passOwner,
            params.purchaser,
            params.token,
            params.totalAmount
        );
    }

    receive() external payable {}

    /**
     * Coupons
     */

    function _redeemCoupon(
        uint256 orgId,
        address passOwner,
        uint256 totalAmount,
        bool isInitialPurchase,
        bool forceCoupon
    ) internal returns (uint256) {
        uint256 amount = totalAmount;

        try
            ICouponRegistry(registry.couponRegistry()).redeemCoupon(
                orgId,
                passOwner,
                isInitialPurchase,
                totalAmount
            )
        returns (uint256 discountedAmount) {
            amount = discountedAmount;
        } catch {
            if (forceCoupon) {
                revert InvalidCouponCode();
            } else {
                ICouponRegistry(registry.couponRegistry()).removePassCouponCode(
                        orgId,
                        passOwner
                    );
            }
        }

        return amount;
    }

    function _setCoupon(
        uint256 orgId,
        address passOwner,
        string memory code
    ) internal {
        ICouponRegistry(registry.couponRegistry()).setPassCouponCode(
            orgId,
            passOwner,
            code
        );
    }

    /**
     * Purchase Pause
     */

    function pausePurchases() external onlyOwner {
        _pause();
    }

    function unpausePurchases() external onlyOwner {
        _unpause();
    }

    /**
     * Permission Registry
     */

    function setPermissionRegistry(
        address _permissionRegistry
    ) external onlyOwner {
        _setPermissionRegistry(_permissionRegistry);
    }

    /**
     * Checks
     */

    function _checkProductStatuses(
        uint256[] calldata productIds,
        bool[] calldata statuses
    ) internal pure {
        if (productIds.length == 0) {
            revert NoProductsProvided();
        }

        if (productIds.length != statuses.length) {
            revert ProductIdsAndStatusesLengthMismatch();
        }
    }

    function _checkPassOwnerOrAdmin(uint256 productPassId) internal view {
        if (
            !_isPassOwner(productPassId) &&
            !_isOrgAdmin(
                IPurchaseRegistry(registry.purchaseRegistry()).passOrganization(
                    productPassId
                )
            )
        ) {
            revert NotAuthorized();
        }
    }

    /**
     * Modifiers
     */

    modifier onlyPassOwnerOrAdmin(uint256 productPassId) {
        _requireNotPaused();
        _checkPassOwnerOrAdmin(productPassId);
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
            interfaceId == type(IPurchaseManager).interfaceId;
    }
}
