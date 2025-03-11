// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @title ISubscriptionTransferOracle
 * @notice Interface for a subscription transfer oracle that determines if a subscription can be transferred from one owner to another.
 */
interface ISubscriptionTransferOracle {
    /**
     * @notice Determines if a subscription can be transferred from one owner to another.
     *  A subscription can only be transferred if the subscription is paused.
     * @dev An organization must enable pauseable subscriptions.
     * @param productPassId The ID of the product pass.
     * @param productIds The IDs of the products to check.
     * @return isTransferable True if the subscription can be transferred, false otherwise.
     */
    function isTransferable(
        uint256 productPassId,
        uint256[] calldata productIds
    ) external view returns (bool);
}
