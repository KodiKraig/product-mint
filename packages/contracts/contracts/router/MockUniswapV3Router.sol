// SPDX-License-Identifier: BUSL-1.1

pragma solidity >=0.6.2;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {ICustomUniswapV3Router} from "./ICustomUniswapV3Router.sol";

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
 * @title MockUniswapV3Router
 * @notice A mock implementation of the custom Uniswap V3 router for testing with decimal handling.
 * @dev Simulates uniswap v3 router with a fixed price, adjusted for token decimals. Not for production use.
 *
 * Does not include any fees.
 */
contract MockUniswapV3Router is AccessControl, ICustomUniswapV3Router {
    // Token => Price
    mapping(address => uint256) public prices;

    // Can set prices for tokens
    bytes32 public constant PRICE_SETTER_ROLE = keccak256("PRICE_SETTER_ROLE");

    constructor() AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(PRICE_SETTER_ROLE, _msgSender());
    }

    /**
     * ICustomUniswapV3Router
     */

    /**
     * @notice Returns the amount out received for a given exact input swap without executing the swap
     * @param path The path of the swap, i.e. each token pair and the pool fee
     * @param amountIn The amount of the first token to swap
     * @return amountOut The amount of the last token that would be received
     * @return sqrtPriceX96AfterList List of the sqrt price after the swap for each pool in the path
     * @return initializedTicksCrossedList List of the initialized ticks that the swap crossed for each pool in the path
     * @return gasEstimate The estimate of the gas that the swap consumes
     */
    function quoteExactInput(
        bytes memory path,
        uint256 amountIn
    )
        external
        view
        override
        returns (
            uint256 amountOut,
            uint160[] memory sqrtPriceX96AfterList,
            uint32[] memory initializedTicksCrossedList,
            uint256 gasEstimate
        )
    {
        // Decode path bytes into token addresses and fees
        // Path is encoded as (token0, fee0, token1, fee1, token2, ...)
        require(path.length >= 43, "Path too short"); // Minimum 2 tokens (20 bytes each) + 1 fee (3 bytes)

        // Initialize arrays for return values
        sqrtPriceX96AfterList = new uint160[](0);
        initializedTicksCrossedList = new uint32[](0);
        gasEstimate = 0;

        // Get first token address
        address baseToken;
        assembly {
            baseToken := mload(add(path, 20))
        }

        // Get last token address
        address quoteToken;
        assembly {
            let len := mload(path)
            if lt(len, 43) {
                revert(0, 0)
            }
            let numTokens := add(div(sub(len, 23), 23), 2)
            let offset := add(20, mul(sub(numTokens, 1), 23))
            quoteToken := mload(add(path, offset))
        }

        // Calculate amount out based on token decimals
        uint8 baseDecimals = IERC20Metadata(baseToken).decimals();
        uint8 quoteDecimals = IERC20Metadata(quoteToken).decimals();

        // Simulate updating the path
        path = abi.encodePacked(
            baseToken,
            uint24(0),
            quoteToken,
            uint24(0),
            baseToken
        );

        if (baseDecimals > quoteDecimals) {
            amountOut =
                (amountIn * prices[baseToken]) /
                10 ** (baseDecimals - quoteDecimals);
        } else {
            amountOut =
                (amountIn * prices[baseToken]) *
                10 ** (quoteDecimals - baseDecimals);
        }

        return (
            amountOut,
            sqrtPriceX96AfterList,
            initializedTicksCrossedList,
            gasEstimate
        );
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
            interfaceId == type(ICustomUniswapV3Router).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
