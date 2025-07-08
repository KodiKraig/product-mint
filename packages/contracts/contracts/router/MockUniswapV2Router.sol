// SPDX-License-Identifier: BUSL-1.1

pragma solidity >=0.6.2;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {ICustomUniswapV2Router} from "./ICustomUniswapV2Router.sol";

/*
 ____                 _            _   __  __ _       _   
|  _ \ _ __ ___   __| |_   _  ___| |_|  \/  (_)_ __ | |_ 
| |_) | '__/ _ \ / _` | | | |/ __| __| |\/| | | '_ \| __|
|  __/| | | (_) | (_| | |_| | (__| |_| |  | | | | | | |_ 
|_|   |_|  \___/ \__,_|\__,_|\___|\__|_|  |_|_|_| |_|\__|
 
 NFT based payment system to mint products onchain with one-time payments and 
 recurring permissionless subscriptions.

 https://productmint.io
*/

/**
 * @title MockUniswapV2Router
 * @notice A mock implementation of the custom Uniswap V2 router for testing with decimal handling.
 * @dev Simulates uniswap v2 router with a fixed price, adjusted for token decimals. Not for production use.
 *
 * Does not include any fees.
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
        require(path.length > 1, "Path must have at least 2 tokens");
        require(amountIn > 0, "Amount in must be greater than 0");

        amounts = new uint[](path.length);
        amounts[0] = amountIn;

        address baseToken = path[0];
        address quoteToken = path[path.length - 1];

        uint8 baseDecimals = IERC20Metadata(baseToken).decimals();
        uint8 quoteDecimals = IERC20Metadata(quoteToken).decimals();

        if (baseDecimals > quoteDecimals) {
            amounts[path.length - 1] =
                (amountIn * prices[baseToken]) /
                10 ** (baseDecimals - quoteDecimals);
        } else {
            amounts[path.length - 1] =
                (amountIn * prices[baseToken]) *
                10 ** (quoteDecimals - baseDecimals);
        }

        return amounts;
    }

    /**
     * @notice Emitted when the price for a token is set or updated.
     * @param token The token address
     * @param price The price (quote token amount per base token amount, unscaled)
     */
    event MockTokenPriceSet(address indexed token, uint256 price);

    /**
     * @notice Set or update the price for a token (for testing purposes).
     * @param _token The token address
     * @param _price The price (quote token amount per base token amount, unscaled)
     */
    function setPrice(
        address _token,
        uint256 _price
    ) external onlyRole(PRICE_SETTER_ROLE) {
        require(_token != address(0), "Token address cannot be zero");

        prices[_token] = _price;

        emit MockTokenPriceSet(_token, _price);
    }

    /**
     * Supports Interface
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(ICustomUniswapV2Router).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
