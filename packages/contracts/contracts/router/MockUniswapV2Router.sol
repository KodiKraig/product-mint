// SPDX-License-Identifier: BUSL-1.1

pragma solidity >=0.6.2;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {ICustomUniswapV2Router} from "./ICustomUniswapV2Router.sol";

/**
 * @title MockUniswapV2Router
 * @notice A mock implementation of the custom Uniswap V2 router for testing with decimal handling.
 * @dev Simulates getAmountsOut and getAmountsIn with a fixed price ratio, adjusted for token decimals. Not for production use.
 */
contract MockUniswapV2Router is AccessControl, ICustomUniswapV2Router {
    // Token => Price
    mapping(address => uint256) public prices;

    // Can set prices for tokens
    bytes32 public constant PRICE_SETTER_ROLE = keccak256("PRICE_SETTER_ROLE");

    constructor() AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(PRICE_SETTER_ROLE, _msgSender());
    }

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

        uint8 baseDecimals = IERC20Metadata(baseToken).decimals();
        uint8 quoteDecimals = IERC20Metadata(quoteToken).decimals();

        if (baseDecimals > quoteDecimals) {
            amounts[1] =
                (amountIn * prices[baseToken]) /
                10 ** (baseDecimals - quoteDecimals);
        } else {
            amounts[1] =
                (amountIn * prices[baseToken]) *
                10 ** (quoteDecimals - baseDecimals);
        }

        return amounts;
    }

    /**
     * @notice Set or update the price for a token (for testing purposes).
     * @param _token The token address
     * @param _price The price (quote token amount per base token amount, unscaled)
     */
    function setPrice(
        address _token,
        uint256 _price
    ) external onlyRole(PRICE_SETTER_ROLE) {
        require(_token != address(0), "Invalid token address");
        prices[_token] = _price;
    }
}
