// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IDynamicPriceRouter} from "./IDynamicPriceRouter.sol";

/**
 * @title TestDynamicPriceRouter
 * @notice A test dynamic price router that returns a fixed price, accounting for token decimals.
 * @dev Will not be used in production. Assumes base and quote tokens have configurable decimals.
 */
contract TestDynamicPriceRouter is IDynamicPriceRouter {
    // The price of 1 base token in quote token units (e.g., micro-USDC if quote token has 6 decimals)
    uint256 public baseTokenPrice;

    // The amount of quote token per base token (scaled by decimals)
    uint256 public quoteTokenPerBaseToken;

    // Decimals for base token (e.g., 6 or 18 for ETH)
    uint8 public baseTokenDecimals;

    // Decimals for quote token (e.g., 6 for USDC)
    uint8 public quoteTokenDecimals;

    constructor(
        uint256 _baseTokenPrice,
        uint256 _quoteTokenPerBaseToken,
        uint8 _baseTokenDecimals,
        uint8 _quoteTokenDecimals
    ) {
        require(
            _baseTokenDecimals <= 18 && _quoteTokenDecimals <= 18,
            "Decimals must be <= 18"
        );
        baseTokenPrice = _baseTokenPrice;
        quoteTokenPerBaseToken = _quoteTokenPerBaseToken;
        baseTokenDecimals = _baseTokenDecimals;
        quoteTokenDecimals = _quoteTokenDecimals;
    }

    function getBaseTokenPrice(
        address,
        address
    ) external view returns (uint256) {
        // Return price scaled to quote token decimals
        return baseTokenPrice; // Already set with correct decimal scaling
    }

    function getQuoteTokenPrice(
        address,
        address
    ) external view returns (uint256) {
        return 10 ** (18 - baseTokenDecimals) / quoteTokenPerBaseToken;
    }

    function getBaseTokenAmount(
        address,
        address,
        uint256 _quoteTokenAmount
    ) external view returns (uint256) {
        // Convert quote token amount to base token amount
        // Scale based on decimal difference
        int256 decimalDifference = int8(baseTokenDecimals) -
            int8(quoteTokenDecimals);
        uint256 baseAmount;
        if (decimalDifference >= 0) {
            uint256 scaleFactor = 10 ** uint256(decimalDifference);
            baseAmount =
                (_quoteTokenAmount * scaleFactor) /
                quoteTokenPerBaseToken;
        } else {
            uint256 scaleFactor = 10 ** uint256(-decimalDifference);
            baseAmount =
                _quoteTokenAmount /
                (quoteTokenPerBaseToken * scaleFactor);
        }
        require(baseAmount > 0, "Invalid base token amount");
        return baseAmount;
    }

    function getQuoteTokenAmount(
        address,
        address,
        uint256 _baseTokenAmount
    ) external view returns (uint256) {
        // Convert base token amount to quote token amount
        // Scale based on decimal difference
        int256 decimalDifference = int8(quoteTokenDecimals) -
            int8(baseTokenDecimals);
        uint256 quoteAmount;
        if (decimalDifference >= 0) {
            uint256 scaleFactor = 10 ** uint256(decimalDifference);
            quoteAmount =
                (_baseTokenAmount * quoteTokenPerBaseToken * scaleFactor) /
                10 ** baseTokenDecimals;
        } else {
            uint256 scaleFactor = 10 ** uint256(-decimalDifference);
            quoteAmount =
                (_baseTokenAmount * quoteTokenPerBaseToken) /
                (10 ** baseTokenDecimals * scaleFactor);
        }
        require(quoteAmount > 0, "Invalid quote token amount");
        return quoteAmount;
    }
}
