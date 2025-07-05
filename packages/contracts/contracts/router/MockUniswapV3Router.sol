// SPDX-License-Identifier: BUSL-1.1

pragma solidity >=0.6.2;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {ICustomUniswapV3Router} from "./ICustomUniswapV3Router.sol";

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
        address firstToken;
        assembly {
            firstToken := mload(add(path, 20)) // Load first 20 bytes after length prefix
        }

        // Get last token address
        address lastToken;
        assembly {
            lastToken := mload(add(add(path, mload(path)), sub(0x20, 20))) // Load last 20 bytes
        }

        // Calculate amount out based on token decimals
        uint8 baseDecimals = IERC20Metadata(firstToken).decimals();
        uint8 quoteDecimals = IERC20Metadata(lastToken).decimals();

        if (baseDecimals > quoteDecimals) {
            amountOut =
                (amountIn * prices[firstToken]) /
                10 ** (baseDecimals - quoteDecimals);
        } else {
            amountOut =
                (amountIn * prices[firstToken]) *
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
        require(_token != address(0), "Invalid token address");

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
