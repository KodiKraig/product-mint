// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IDynamicPriceRouter} from "./IDynamicPriceRouter.sol";

/**
 * @title IUniswapV3DynamicPriceRouter
 * @notice Interface for a dynamic price router that uses Uniswap V3.
 */
interface IUniswapV3DynamicPriceRouter is IDynamicPriceRouter {
    /**
     * @notice Get the swap price for the final token in the given path with Uniswap fees included.
     * @param _amountIn The amount of token to convert.
     * @param _path The path to use for the conversion.
     * @return The amount of token at the end of the path received.
     */
    function getPrice(
        uint256 _amountIn,
        bytes calldata _path
    ) external returns (uint256);

    /**
     * @notice Get the swap price for the final token in the given path with Uniswap fees excluded.
     * @dev We do a best approximation of the price without fees.
     * @param _amountIn The amount of token to convert.
     * @param _path The path to use for the conversion.
     * @param _fees The fees for each pool in the path. Used to calculate the fee-free price.
     * @return The amount of token at the end of the path received.
     */
    function getPriceWithoutFees(
        uint256 _amountIn,
        bytes calldata _path,
        uint256[] calldata _fees
    ) external returns (uint256);
}
