// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IRenewalProcessor {
    /**
     * @notice The status of a subscription renewal.
     *
     * @dev SUCCESS: The renewal was successful.
     * @dev FAILED: The renewal failed.
     * @dev NOT_READY: The renewal is not ready to be processed.
     * @dev CANCELLED: The subscription was cancelled.
     * @dev PAUSED: The subscription was paused.
     */
    enum RenewalStatus {
        SUCCESS,
        FAILED,
        NOT_READY,
        CANCELLED,
        PAUSED
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
     * @notice Processes a single subscription renewal for all products on a pass.
     * @param _passId The product pass ID of the subscription.
     */
    function processAllPassRenewal(uint256 _passId) external;

    /**
     * @notice Processes a batch of subscription renewals for all products on each pass.
     * @param _startPassId The start product pass ID of the batch.
     * @param _endPassId The end product pass ID of the batch.
     */
    function processAllPassRenewalBatch(
        uint256 _startPassId,
        uint256 _endPassId
    ) external;

    /**
     * @notice Processes a single subscription renewal for a specific product.
     * @param _passId The product pass ID of the subscription.
     * @param _productId The product ID of the subscription.
     */
    function processSingleProductRenewal(
        uint256 _passId,
        uint256 _productId
    ) external;
}
