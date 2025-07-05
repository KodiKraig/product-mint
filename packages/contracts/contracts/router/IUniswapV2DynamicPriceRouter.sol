// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IDynamicPriceRouter} from "./IDynamicPriceRouter.sol";

/**
 * @title IUniswapV2DynamicPriceRouter
 * @notice Interface for a dynamic price router that uses Uniswap V2.
 */
interface IUniswapV2DynamicPriceRouter is IDynamicPriceRouter {
    /**
     * @notice Get the direct swap price for the final token in the given path with Uniswap fees included.
     * @param _amountIn The amount of token to convert.
     * @param _path The path to use for the conversion.
     * @return The amount of token at the end of the path received.
     */
    function getPrice(
        uint256 _amountIn,
        address[] calldata _path
    ) external view returns (uint256);

    /**
     * @notice Get the direct swap price for the final token in the given path with Uniswap fees excluded.
     * @dev We do a best approximation of the price without fees.
     * @param _amountIn The amount of token to convert.
     * @param _path The path to use for the conversion.
     * @return The amount of token at the end of the path received.
     */
    function getPriceWithoutFees(
        uint256 _amountIn,
        address[] calldata _path
    ) external view returns (uint256);
}
