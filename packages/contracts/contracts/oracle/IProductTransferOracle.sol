// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @title IProductTransferOracle
 * @notice Interface for a product transfer oracle that determines if a product can be transferred from one owner to another.
 */
interface IProductTransferOracle {
    /**
     * @notice Determines if a product can be transferred from one owner to another.
     * @dev An organization must enable products to be transferable by setting the `isTransferable` flag to true.
     * @param productIds The IDs of the products to check.
     * @return isTransferable True if the product can be transferred, false otherwise.
     */
    function isTransferable(
        uint256[] calldata productIds
    ) external view returns (bool);
}
