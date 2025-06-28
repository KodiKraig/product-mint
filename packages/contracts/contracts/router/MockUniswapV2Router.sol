// SPDX-License-Identifier: BUSL-1.1

pragma solidity >=0.6.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ICustomUniswapV2Router} from "./ICustomUniswapV2Router.sol";

/**
 * @title MockUniswapV2Router
 * @notice A mock implementation of the custom Uniswap V2 router for testing with decimal handling.
 * @dev Simulates getAmountsOut and getAmountsIn with a fixed price ratio, adjusted for token decimals. Not for production use.
 */
contract MockUniswapV2Router is ICustomUniswapV2Router {
    // Mapping to store the price ratio (quote token amount per base token amount) for each token pair
    mapping(address => mapping(address => uint256)) public priceRatios;

    // Default fee factor (e.g., 0.997 for 0.3% fee)
    uint256 public constant FEE_FACTOR = 997;
    uint256 public constant PRECISION = 1000;

    // Mapping to store decimals for each token (for testing purposes)
    mapping(address => uint8) public tokenDecimals;

    /**
     * @notice Returns the amounts for a swap along a path given an input amount.
     * @param amountIn The input amount of the first token.
     * @param path An array of token addresses representing the swap path.
     * @return amounts An array of amounts for each step of the path.
     */
    function getAmountsOut(
        uint amountIn,
        address[] calldata path
    ) external view override returns (uint[] memory amounts) {
        require(path.length == 2, "Path must have exactly 2 tokens");
        require(amountIn > 0, "Amount in must be greater than 0");

        amounts = new uint[](2);
        amounts[0] = amountIn;

        address baseToken = path[0];
        address quoteToken = path[1];
        uint256 priceRatio = priceRatios[baseToken][quoteToken];
        require(priceRatio > 0, "Price ratio not set for this pair");

        uint8 baseDecimals = tokenDecimals[baseToken];
        uint8 quoteDecimals = tokenDecimals[quoteToken];
        int256 decimalDifference = int256(uint256(quoteDecimals)) -
            int256(uint256(baseDecimals));

        // Adjust amountOut for decimal difference and fee
        uint256 scaleFactor = decimalDifference >= 0
            ? 10 ** uint256(decimalDifference)
            : 10 ** uint256(-decimalDifference);
        uint256 adjustedAmountIn = decimalDifference >= 0
            ? amountIn
            : amountIn * scaleFactor;
        uint256 amountOut = (adjustedAmountIn * priceRatio * FEE_FACTOR) /
            (PRECISION * (decimalDifference >= 0 ? 1 : scaleFactor));
        amounts[1] = amountOut > 0 ? amountOut : 0;

        return amounts;
    }

    /**
     * @notice Returns the amounts needed for a swap along a path given an output amount.
     * @param amountOut The desired output amount of the last token.
     * @param path An array of token addresses representing the swap path.
     * @return amounts An array of amounts for each step of the path.
     */
    function getAmountsIn(
        uint amountOut,
        address[] calldata path
    ) external view override returns (uint[] memory amounts) {
        require(path.length == 2, "Path must have exactly 2 tokens");
        require(amountOut > 0, "Amount out must be greater than 0");

        amounts = new uint[](2);

        address baseToken = path[0];
        address quoteToken = path[1];
        uint256 priceRatio = priceRatios[baseToken][quoteToken];
        require(priceRatio > 0, "Price ratio not set for this pair");

        uint8 baseDecimals = tokenDecimals[baseToken];
        uint8 quoteDecimals = tokenDecimals[quoteToken];
        int256 decimalDifference = int256(uint256(quoteDecimals)) -
            int256(uint256(baseDecimals));

        // Adjust amountIn for decimal difference and fee
        uint256 scaleFactor = decimalDifference >= 0
            ? 10 ** uint256(decimalDifference)
            : 10 ** uint256(-decimalDifference);
        uint256 adjustedAmountOut = decimalDifference >= 0
            ? amountOut
            : amountOut / scaleFactor;
        uint256 amountIn = (adjustedAmountOut *
            PRECISION *
            (decimalDifference >= 0 ? 1 : scaleFactor)) /
            (priceRatio * FEE_FACTOR);
        amounts[0] = amountIn > 0 ? amountIn : 0;
        amounts[1] = amountOut;

        return amounts;
    }

    /**
     * @notice Set or update the price ratio and decimals for a token pair (for testing purposes).
     * @param _baseToken The base token address
     * @param _quoteToken The quote token address
     * @param _ratio The price ratio (quote token amount per base token amount, unscaled)
     * @param _baseDecimals The decimal precision of the base token
     * @param _quoteDecimals The decimal precision of the quote token
     */
    function setPriceRatio(
        address _baseToken,
        address _quoteToken,
        uint256 _ratio,
        uint8 _baseDecimals,
        uint8 _quoteDecimals
    ) external {
        require(
            _baseToken != address(0) && _quoteToken != address(0),
            "Invalid token address"
        );
        require(_baseToken != _quoteToken, "Tokens must differ");
        require(_ratio > 0, "Ratio must be greater than 0");
        require(
            _baseDecimals <= 18 && _quoteDecimals <= 18,
            "Decimals must be <= 18"
        );
        priceRatios[_baseToken][_quoteToken] = _ratio;
        tokenDecimals[_baseToken] = _baseDecimals;
        tokenDecimals[_quoteToken] = _quoteDecimals;
    }
}
