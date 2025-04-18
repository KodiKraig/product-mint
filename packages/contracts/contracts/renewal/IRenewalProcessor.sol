// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ISubscriptionEscrow} from "../escrow/ISubscriptionEscrow.sol";

interface IRenewalProcessor {
    /**
     * @notice The status of a subscription renewal.
     *
     * @dev SUCCESS: The renewal was successful.
     * @dev FAILED: The renewal failed.
     * @dev NOT_READY: The renewal is not ready to be processed.
     * @dev CANCELLED: The subscription was cancelled.
     * @dev PAUSED: The subscription was paused.
     * @dev READY: The renewal is ready to be processed.
     */
    enum RenewalStatus {
        SUCCESS,
        FAILED,
        NOT_READY,
        CANCELLED,
        PAUSED,
        READY
    }

    /**
     * @notice Emitted when a subscription renewal is processed.
     *
     * @param orgId The organization ID of the subscription.
     * @param productPassId The product pass ID of the subscription.
     * @param productId The product ID of the subscription.
     * @param status The status of the renewal process. (NOT_READY will not be emitted)
     */
    event RenewalProcessed(
        uint256 indexed orgId,
        uint256 indexed productPassId,
        uint256 indexed productId,
        RenewalStatus status
    );

    /**
     * @notice The status of a subscription renewal for a specific product.
     *
     * @param passId The product pass ID of the subscription.
     * @param productId The product ID of the subscription on the pass.
     * @param subscription The subscription details.
     * @param subStatus The status of the subscription.
     * @param renewalStatus The status of the renewal process.
     */
    struct PassRenewalStatus {
        uint256 passId;
        uint256 productId;
        ISubscriptionEscrow.Subscription subscription;
        ISubscriptionEscrow.SubscriptionStatus subStatus;
        RenewalStatus renewalStatus;
    }

    /**
     * View Renewal Status
     */

    /**
     * @notice Get the renewal status for all products on a pass.
     * @param _passId The product pass ID of the subscription.
     * @return The renewal status for all products on the pass.
     */
    function getAllPassRenewalStatus(
        uint256 _passId
    ) external view returns (PassRenewalStatus[] memory);

    /**
     * @notice Get the renewal status for all products on a batch of passes.
     * @param _passIds List of product pass IDs to get the renewal status for.
     * @return The renewal status for all products on each pass.
     */
    function getAllPassRenewalStatusBatch(
        uint256[] memory _passIds
    ) external view returns (PassRenewalStatus[][] memory);

    /**
     * @notice Get the renewal status for a specific product on a pass.
     * @param _passId The product pass ID of the subscription.
     * @param _productId The product ID of the subscription on the pass.
     * @return The renewal status for the product on the pass.
     */
    function getSingleProductRenewalStatus(
        uint256 _passId,
        uint256 _productId
    ) external view returns (PassRenewalStatus memory);

    /**
     * @notice Get the renewal status for a batch of products on a batch of passes.
     * @param _passIds List of product pass IDs to get the renewal status for.
     * @param _productIds List of product IDs to get the renewal status for.
     * @return The renewal status for the products on the passes.
     */
    function getSingleProductRenewalStatusBatch(
        uint256[] memory _passIds,
        uint256[] memory _productIds
    ) external view returns (PassRenewalStatus[] memory);

    /**
     * Renewal Processing
     */

    /**
     * @notice Processes subscription renewals for all products on a pass.
     * @param _passId The product pass ID of the subscription.
     */
    function processAllPassRenewal(uint256 _passId) external;

    /**
     * @notice Processes a batch of subscription renewals for all products on each pass.
     * @param _passIds List of product pass IDs to process the renewal for.
     */
    function processAllPassRenewalBatch(uint256[] memory _passIds) external;

    /**
     * @notice Processes a single subscription renewal for a specific product.
     * @param _passId The product pass ID of the subscription.
     * @param _productId The product ID of the subscription.
     */
    function processSingleProductRenewal(
        uint256 _passId,
        uint256 _productId
    ) external;

    /**
     * @notice Processes a batch of single subscription renewals for specific products.
     * @param _passIds List of product pass IDs to process the renewal for.
     * @param _productIds List of product IDs to process the renewal for.
     */
    function processSingleProductRenewalBatch(
        uint256[] memory _passIds,
        uint256[] memory _productIds
    ) external;
}
