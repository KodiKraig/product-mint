// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPurchaseManager {
    /**
     * @notice Get the total number of product pass tokens minted.
     * @return The total number of product pass tokens minted.
     */
    function passSupply() external view returns (uint256);

    /**
     * @notice Emitted when the funds are transferred from the user to the payment escrow.
     *  During the initial purchase, additional purchases, changing/renewing subscription pricing,
     *  the amount paid is recorded.
     * @param orgId The ID of the organization that the products are purchased for.
     * @param passOwner The address of the owner of the product pass that paid for the products.
     * @param purchaser The address of the purchaser of the products.
     * @param token The token used for the purchase.
     * @param amountPaid The total amount paid for the products including any discounts from coupons.
     */
    event PerformPurchase(
        uint256 indexed orgId,
        address indexed passOwner,
        address indexed purchaser,
        address token,
        uint256 amountPaid
    );

    /**
     * @notice Revert when the provided coupon code is invalid.
     */
    error InvalidCouponCode();

    /**
     * @notice Revert when no products are provided for a purchase or renewal during batch operations.
     */
    error NoProductsProvided();

    /**
     * @notice Revert when the number of product IDs and statuses do not match during batch operations.
     */
    error ProductIdsAndStatusesLengthMismatch();

    /**
     * @notice Revert when the caller is not authorized to perform the action.
     */
    error NotAuthorized();

    /**
     * Purchase Products
     */

    /**
     * @notice Emitted when products are purchased for a product pass.
     * @param orgId The ID of the organization that the products are purchased for.
     * @param productPassId The ID of the product pass that the products are purchased for.
     * @param passOwner The address of the owner of the product pass.
     * @param productIds The IDs of the products that are purchased.
     * @param pricingIds The IDs of the pricing options for the products.
     * @param quantities The quantities of the products that are purchased.
     * @param token The token that is used to purchase the products.
     * @param amountPaid The total amount paid for the products before any discounts.
     */
    event ProductsPurchased(
        uint256 indexed orgId,
        uint256 indexed productPassId,
        address indexed passOwner,
        uint256[] productIds,
        uint256[] pricingIds,
        uint256[] quantities,
        address token,
        uint256 amountPaid
    );

    /**
     * @notice The parameters for an initial purchase.
     *
     * @param to The address of the user to purchase the products for and mint the product pass to.
     * @param organizationId The ID of the organization to purchase the products for.
     * @param productIds The IDs of the products to purchase.
     * @param pricingIds The IDs of the pricing options for the products.
     * @param quantities The quantities of the products to purchase.
     *  Only relevant for products for tiered pricing. 0 must be provided for all other pricing models.
     * @param discountIds The IDs of the discounts to be minted onto the product pass.
     * @param couponCode The coupon code to apply to the purchase.
     * @param airdrop Whether to airdrop the products to the user.
     *  Can only be called by the org admin.
     * @param pause Whether to pause any subscriptions that are purchased during the purchase.
     *  The org must have this feature enabled to pause subscriptions.
     */
    struct InitialPurchaseParams {
        address to;
        uint256 organizationId;
        uint256[] productIds;
        uint256[] pricingIds;
        uint256[] quantities;
        uint256[] discountIds;
        string couponCode;
        bool airdrop;
        bool pause;
    }

    /**
     * @notice Purchase products by minting a new product pass.
     * @param params The parameters for the purchase.
     */
    function purchaseProducts(
        InitialPurchaseParams calldata params
    ) external payable;

    /**
     * @notice The parameters needed for an additional purchase to add products to an existing product pass.
     *
     * @param productPassId The ID of the product pass to add the products to.
     * @param productIds The IDs of the products to purchase.
     * @param pricingIds The IDs of the pricing options for the products.
     * @param quantities The quantities of the products to purchase.
     *  Only relevant for products for tiered pricing. 0 must be provided for all other pricing models.
     * @param couponCode The coupon code to apply to the purchase.
     * @param airdrop Whether to airdrop the products to the user.
     *  Can only be called by the pass owner.
     * @param pause Whether to pause any subscriptions that are purchased during the purchase.
     *  The org must have this feature enabled to pause subscriptions.
     */
    struct AdditionalPurchaseParams {
        uint256 productPassId;
        uint256[] productIds;
        uint256[] pricingIds;
        uint256[] quantities;
        string couponCode;
        bool airdrop;
        bool pause;
    }

    /**
     * @notice Purchase additional products by adding them to an existing product pass.
     * @param params The parameters for the purchase.
     */
    function purchaseAdditionalProducts(
        AdditionalPurchaseParams calldata params
    ) external payable;

    /**
     * @dev Used internally by the PurchaseManager during the product purchase.
     */
    struct PurchaseProductsParams {
        address passOwner;
        address purchaser;
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

    /**
     * @dev Used internally by the PurchaseManager during the product purchase.
     */
    struct PerformPurchaseParams {
        uint256 orgId;
        uint256 productPassId;
        address passOwner;
        address purchaser;
        uint256 totalAmount;
        address token;
        bool airdrop;
        bool isInitialPurchase;
        bool forceCoupon;
    }

    /**
     * Change subscription pricing
     */

    /**
     * @notice The parameters for changing the pricing for a subscription.
     *
     * @custom:field orgId The ID of the organization that the subscription is purchased for.
     * @custom:field productPassId The ID of the product pass that the subscription is purchased for.
     * @custom:field productId The ID of the product to change the pricing for.
     * @custom:field newPricingId The ID of the new pricing option for the product.
     * @custom:field airdrop Whether to airdrop the change to the user.
     */
    struct ChangeSubscriptionPricingParams {
        uint256 orgId;
        uint256 productPassId;
        uint256 productId;
        uint256 newPricingId;
        bool airdrop;
    }

    /**
     * @notice Change the pricing for an existing subscription.
     *  Can only change between pricing models that are the same charge style i.e. FLAT_RATE, TIERED, or USAGE
     * @dev Only the pass owner or an org admin can change the pricing model for a subscription.
     * @param params The parameters for the change.
     */
    function changeSubscriptionPricing(
        ChangeSubscriptionPricingParams calldata params
    ) external;

    /**
     * Renew subscription
     */

    /**
     * @notice Renew a subscription for a product.
     * @param productPassId The ID of the product pass to renew.
     * @param productId The ID of the product to renew.
     * @param airdrop Whether to airdrop the renewed subscription to the user. Can only be used by an org admin.
     */
    function renewSubscription(
        uint256 productPassId,
        uint256 productId,
        bool airdrop
    ) external;

    /**
     * @notice Batch renew multiple subscriptions on a product pass in a single transaction.
     * @param productPassId The ID of the product pass to renew.
     * @param productIds The IDs of the products to renew.
     * @param airdrop Whether to airdrop the products to the user. Can only be used by an org admin.
     */
    function renewSubscriptionBatch(
        uint256 productPassId,
        uint256[] calldata productIds,
        bool airdrop
    ) external;

    /**
     * Tiered Subscription Unit Quantity
     */

    /**
     * @notice Change the unit quantity for a tiered subscription.
     * @dev Subscription must be active to change the unit quantity and a TIERED pricing model must be set.
     * @param productPassId The ID of the product pass that the subscription is purchased for.
     * @param productId The ID of the product to change the unit quantity for.
     * @param quantity The new unit quantity for the subscription.
     * @param airdrop Whether to airdrop the change to the user. Can only be used by an org admin.
     */
    function changeTieredSubscriptionUnitQuantity(
        uint256 productPassId,
        uint256 productId,
        uint256 quantity,
        bool airdrop
    ) external;

    /**
     * Pause subscription
     */

    /**
     * @notice Pause a subscription for a product.
     * @dev The org must have this feature enabled to pause subscriptions.
     * @param productPassId The ID of the product pass that the subscription is purchased for.
     * @param productId The ID of the product to pause the subscription for.
     * @param _pause Whether to pause the subscription.
     */
    function pauseSubscription(
        uint256 productPassId,
        uint256 productId,
        bool _pause
    ) external;

    /**
     * @notice Batch pause multiple subscriptions on a product pass in a single transaction.
     * @param productPassId The ID of the product pass that the subscriptions are purchased for.
     * @param productIds The IDs of the products to pause the subscriptions for.
     * @param pause Whether to pause the subscriptions.
     */
    function pauseSubscriptionBatch(
        uint256 productPassId,
        uint256[] calldata productIds,
        bool[] calldata pause
    ) external;

    /**
     * Cancel subscription
     */

    /**
     * @notice Cancel a subscription for a product.
     *  When a subscription is cancelled it cannot be renewed.
     *  The subscription will automatically be renewed when un-cancelled.
     * @param productPassId The ID of the product pass that the subscription is purchased for.
     * @param productId The ID of the product to cancel the subscription for.
     * @param cancel Whether to cancel the subscription.
     */
    function cancelSubscription(
        uint256 productPassId,
        uint256 productId,
        bool cancel
    ) external;

    /**
     * @notice Batch cancel multiple subscriptions on a product pass in a single transaction.
     * @param productPassId The ID of the product pass that the subscriptions are purchased for.
     * @param productIds The IDs of the products to cancel the subscriptions for.
     * @param cancel Whether to cancel the subscriptions.
     */
    function cancelSubscriptionBatch(
        uint256 productPassId,
        uint256[] calldata productIds,
        bool[] calldata cancel
    ) external;

    /**
     * Purchase Pause
     */

    /**
     * @notice Pause all activity within the purchase manager.
     * @dev This will prevent any purchases, renewals, cancellations, or pausing of subscriptions.
     * Can be used by the owner when doing upgrades or maintenance.
     */
    function pausePurchases() external;

    /**
     * @notice Unpause activity within the purchase manager.
     * @dev This will resume any paused activity within the purchase manager.
     */
    function unpausePurchases() external;
}
