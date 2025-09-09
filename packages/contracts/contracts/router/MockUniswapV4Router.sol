// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {ICustomUniswapV4Router} from "./ICustomUniswapV4Router.sol";

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
 * @title MockUniswapV4Router
 * @notice A mock implementation of the custom Uniswap V4 router for testing with decimal handling.
 * @dev Simulates uniswap v4 router with a fixed price, adjusted for token decimals. Not for production use.
 *
 * Does not include any fees.
 */
contract MockUniswapV4Router is AccessControl, ICustomUniswapV4Router {
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
     * @param params The parameters for the quote, encoded as 'QuoteExactParams'
     * @return amountOut The output quote for the exactIn swap
     * @return gasEstimate Estimated gas units used for the swap
     */
    function quoteExactInput(
        ICustomUniswapV4Router.QuoteExactParams memory params
    ) external view returns (uint256 amountOut, uint256 gasEstimate) {
        require(params.path.length >= 1, "Path must have at least 1 token");
        require(params.exactAmount > 0, "Amount in must be greater than 0");

        gasEstimate = 0;

        address baseToken = ICustomUniswapV4Router.Currency.unwrap(
            params.exactCurrency
        );
        address quoteToken = ICustomUniswapV4Router.Currency.unwrap(
            params.path[params.path.length - 1].intermediateCurrency
        );

        uint8 baseDecimals = IERC20Metadata(baseToken).decimals();
        uint8 quoteDecimals = IERC20Metadata(quoteToken).decimals();

        if (baseDecimals > quoteDecimals) {
            amountOut =
                (params.exactAmount * prices[baseToken]) /
                10 ** (baseDecimals - quoteDecimals);
        } else {
            amountOut =
                (params.exactAmount * prices[baseToken]) *
                10 ** (quoteDecimals - baseDecimals);
        }
    }

    /**
     * @notice Emitted when the price for a token is set or updated.
     * @param token The token address
     * @param price The price (quote token amount per base token amount, unscaled)
     */
    event MockUniswapV4TokenPriceSet(address indexed token, uint256 price);

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

        emit MockUniswapV4TokenPriceSet(_token, _price);
    }

    /**
     * Supports Interface
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(ICustomUniswapV4Router).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
