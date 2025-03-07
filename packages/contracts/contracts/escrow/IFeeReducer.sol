// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.20;

interface IFeeReducer {
    /**
     * @notice Reduce the fee for a specific organization
     * @param orgId The organization ID
     * @param token The token address that the fee is being calculated for
     * @param fee The fee to reduce
     * @return The reduced fee
     */
    function reduceFee(
        uint256 orgId,
        address token,
        uint256 fee
    ) external view returns (uint256);
}
