// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IDynamicPriceRouter} from "./IDynamicPriceRouter.sol";

/**
 * @title IUniswapV3DynamicPriceRouter
 * @notice Interface for a dynamic price router that uses Uniswap V3.
 */
interface IUniswapV3DynamicPriceRouter is IDynamicPriceRouter {
    /**
     * Pricing
     */

    /**
     * @notice Get the swap price for the final token in the given path with Uniswap fees included.
     * @param amountIn The amount of token to convert.
     * @param path The path to use for the conversion.
     * @return The amount of token at the end of the path received.
     */
    function getPrice(
        uint256 amountIn,
        bytes calldata path
    ) external returns (uint256);

    /**
     * @notice Get the swap price for the final token in the given path with Uniswap fees excluded.
     * @dev We do a best approximation of the price without fees.
     * @param amountIn The amount of token to convert.
     * @param path The path to use for the conversion.
     * @param fees The fees for each pool in the path. Used to calculate the fee-free price.
     * @return The amount of token at the end of the path received.
     */
    function getPriceFeesRemoved(
        uint256 amountIn,
        bytes calldata path,
        Fee[] calldata fees
    ) external returns (uint256);

    /**
     * Fees
     */

    /**
     * @notice The Uniswap V3 fee options.
     */
    enum Fee {
        LOWEST_001, // 0.01%
        LOW_005, // 0.05%
        MEDIUM_03, // 0.3%
        HIGH_1 // 1%
    }

    /**
     * @notice Get the Uniswap V3 fee for a given fee option.
     * @param fee The fee option.
     * @return The fee as a percentage of the amount out.
     * @dev 0.01% = 100, 0.05% = 500, 0.3% = 3000, 1% = 10000.
     */
    function getFee(Fee fee) external pure returns (uint256);
}
