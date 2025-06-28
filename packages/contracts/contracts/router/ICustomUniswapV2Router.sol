// SPDX-License-Identifier: BUSL-1.1

pragma solidity >=0.6.2;

/**
 * @title ICustomUniswapV2Router
 * @notice Interface for the custom Uniswap V2 router.
 */
interface ICustomUniswapV2Router {
    /**
     * @notice Returns the amounts for a swap along a path given an input amount.
     * @param amountIn The input amount of the first token.
     * @param path An array of token addresses representing the swap path.
     * @return amounts An array of amounts for each step of the path.
     */
    function getAmountsOut(
        uint amountIn,
        address[] calldata path
    ) external view returns (uint[] memory amounts);

    /**
     * @notice Returns the amounts needed for a swap along a path given an output amount.
     * @param amountOut The desired output amount of the last token.
     * @param path An array of token addresses representing the swap path.
     * @return amounts An array of amounts for each step of the path.
     */
    function getAmountsIn(
        uint amountOut,
        address[] calldata path
    ) external view returns (uint[] memory amounts);
}
