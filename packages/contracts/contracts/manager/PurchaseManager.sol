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
    IERC165
{
    // Total number of product pass tokens minted
    uint256 public passSupply;

    constructor(
        address _contractRegistry
    )
        Ownable(_msgSender())
        RegistryEnabled(_contractRegistry)
        ReentrancyGuard()
        Pausable()
    {}

    /**
     * Purchase Products
     */

    function purchaseProducts(
        InitialPurchaseParams calldata params
    ) external payable nonReentrant whenNotPaused {
        passSupply++;

        if (params.discountIds.length > 0) {
            IDiscountRegistry(registry.discountRegistry()).mintDiscountsToPass(
                params.organizationId,
                passSupply,
                params.to,
                params.discountIds
            );
        }

        _purchaseProducts(
            PurchaseProductsParams({
                passOwner: params.to,
                orgId: params.organizationId,
                productPassId: passSupply,
                productIds: params.productIds,
                pricingIds: params.pricingIds,
                quantities: params.quantities,
                couponCode: params.couponCode,
                airdrop: params.airdrop,
                pause: params.pause,
                isInitialPurchase: true
            })
        );

        IProductPassNFT(registry.productPassNFT()).mint(params.to, passSupply);
    }

    function purchaseAdditionalProducts(
        AdditionalPurchaseParams calldata params
    ) external payable onlyPassOwnerOrAdmin(params.productPassId) nonReentrant {
        _purchaseProducts(
            PurchaseProductsParams({
                passOwner: _passOwner(params.productPassId),
                orgId: IPurchaseRegistry(registry.purchaseRegistry())
                    .passOrganization(params.productPassId),
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
        if (
            !IProductRegistry(registry.productRegistry()).canPurchaseProducts(
                params.orgId,
                params.productIds,
                params.pricingIds
            )
        ) {
            revert ProductsNotAvailable();
        }

        (address token, uint256[] memory cycleDurations) = IPricingRegistry(
            registry.pricingRegistry()
        ).validateCheckoutBatch(
                params.orgId,
                params.passOwner,
                params.pricingIds,
                params.quantities
            );

        if (bytes(params.couponCode).length > 0) {
            _setCoupon(params.orgId, params.passOwner, params.couponCode);
        }

        IPurchaseRegistry(registry.purchaseRegistry()).recordProductPurchase(
            params.orgId,
            params.productPassId,
            params.passOwner,
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
                params.orgId,
                params.productPassId,
                params.passOwner,
                totalAmount,
                token,
                params.airdrop,
                params.isInitialPurchase,
                true
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
        if (
            !IProductRegistry(registry.productRegistry()).canPurchaseProduct(
                params.orgId,
                params.productId,
                params.newPricingId
            )
        ) {
            revert ProductsNotAvailable();
        }

        address passOwner = _passOwner(params.productPassId);

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
                params.orgId,
                params.productPassId,
                passOwner,
                amount,
                token,
                params.airdrop,
                false,
                false
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

        if (price > 0) {
            _performPurchase(
                orgId,
                productPassId,
                _passOwner(productPassId),
                price,
                token,
                airdrop,
                false,
                false
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

        if (amount > 0) {
            _performPurchase(
                orgId,
                productPassId,
                _passOwner(productPassId),
                amount,
                token,
                airdrop,
                false,
                false
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

    function _performPurchase(
        uint256 orgId,
        uint256 productPassId,
        address passOwner,
        uint256 totalAmount,
        address token,
        bool airdrop,
        bool isInitialPurchase,
        bool forceCoupon
    ) internal {
        if (airdrop) {
            _checkOrgAdmin(orgId);
            return;
        }

        // Apply coupon discount first
        if (
            ICouponRegistry(registry.couponRegistry()).hasPassCouponCode(
                orgId,
                passOwner
            )
        ) {
            totalAmount = _redeemCoupon(
                orgId,
                passOwner,
                totalAmount,
                isInitialPurchase,
                forceCoupon
            );
        }

        // Apply permanent pass discounts
        totalAmount = IDiscountRegistry(registry.discountRegistry())
            .calculateTotalPassDiscountedAmount(productPassId, totalAmount);

        // Transfer funds
        if (totalAmount > 0) {
            IPaymentEscrow(registry.paymentEscrow()).transferDirect{
                value: msg.value
            }(orgId, payable(passOwner), token, totalAmount);
        }

        emit PerformPurchase(orgId, passOwner, token, totalAmount);
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
