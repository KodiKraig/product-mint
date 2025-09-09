// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IHooks {
    // Placeholder; actual is interface with Uniswap V4 hooks
    // For now, we will not support dynamic fees with hooks
}

/**
 * @title ICustomUniswapV4Router
 * @notice Supports the Uniswap V4 quote function to get dynamic token prices
 */
interface ICustomUniswapV4Router {
    type Currency is address;

    struct PathKey {
        Currency intermediateCurrency;
        uint24 fee;
        int24 tickSpacing;
        IHooks hooks;
        bytes hookData;
    }

    struct QuoteExactParams {
        Currency exactCurrency;
        PathKey[] path;
        uint128 exactAmount;
    }

    /// @notice Returns the delta amounts along the swap path for a given exact input swap
    /// @param params the params for the quote, encoded as 'QuoteExactParams'
    /// currencyIn The input currency of the swap
    /// path The path of the swap encoded as PathKeys that contains currency, fee, tickSpacing, and hook info
    /// exactAmount The desired input amount
    /// @return amountOut The output quote for the exactIn swap
    /// @return gasEstimate Estimated gas units used for the swap
    function quoteExactInput(
        QuoteExactParams memory params
    ) external returns (uint256 amountOut, uint256 gasEstimate);
}
