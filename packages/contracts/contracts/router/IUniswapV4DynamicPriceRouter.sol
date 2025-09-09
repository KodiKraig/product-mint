// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ICustomUniswapV4Router} from "./ICustomUniswapV4Router.sol";
import {IDynamicPriceRouter} from "./IDynamicPriceRouter.sol";

/**
 * @title IUniswapV4DynamicPriceRouter
 * @notice Interface for a dynamic price router that uses Uniswap V4.
 * @dev The router will calculate the price with fees included or excluded.
 */
interface IUniswapV4DynamicPriceRouter is IDynamicPriceRouter {
    /**
     * @return The max fee denominator used for fee removal.
     */
    function FEE_DENOMINATOR() external pure returns (uint256);

    /**
     * @notice Get the swap price with Uniswap fees included.
     * @param params The parameters for the price calculation.
     * @return The amount of token at the end of the path received.
     */
    function getPrice(
        ICustomUniswapV4Router.QuoteExactParams calldata params
    ) external returns (uint256);

    /**
     * @notice Get the swap price with Uniswap fees removed.
     * @param params The parameters for the price calculation.
     * @return The amount of token at the end of the path received.
     */
    function getPriceFeesRemoved(
        ICustomUniswapV4Router.QuoteExactParams calldata params
    ) external returns (uint256);
}
