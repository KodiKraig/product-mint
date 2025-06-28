// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {DynamicPriceRouter} from "../abstract/DynamicPriceRouter.sol";
import {ICustomUniswapV2Router} from "./ICustomUniswapV2Router.sol";

contract UniswapV2DynamicPriceRouter is DynamicPriceRouter {
    ICustomUniswapV2Router public uniswapRouter;

    constructor(address _uniswapRouter) DynamicPriceRouter() {
        _updateUniswapRouter(_uniswapRouter);
    }

    /**
     * IDynamicPriceRouter
     */

    function getBaseTokenPrice(
        address _baseToken,
        address _quoteToken
    ) external view override returns (uint256) {
        _checkTokenAddresses(_baseToken, _quoteToken);

        address[] memory path = new address[](2);
        path[0] = _baseToken;
        path[1] = _quoteToken;

        uint256 amountIn = 10 ** IERC20Metadata(_baseToken).decimals();
        uint256[] memory amounts = uniswapRouter.getAmountsOut(amountIn, path);

        _checkOutputAmount(amounts[1]);

        return amounts[1];
    }

    function getQuoteTokenPrice(
        address _baseToken,
        address _quoteToken
    ) external view override returns (uint256) {
        _checkTokenAddresses(_baseToken, _quoteToken);

        address[] memory path = new address[](2);
        path[0] = _quoteToken;
        path[1] = _baseToken;

        uint256 amountOut = 10 ** IERC20Metadata(_quoteToken).decimals();
        uint256[] memory amounts = uniswapRouter.getAmountsIn(amountOut, path);

        _checkOutputAmount(amounts[0]);

        return amounts[0];
    }

    function getBaseTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _quoteTokenAmount
    ) external view override returns (uint256) {
        _checkTokenAddressesAmount(_baseToken, _quoteToken, _quoteTokenAmount);

        address[] memory path = new address[](2);
        path[0] = _quoteToken;
        path[1] = _baseToken;

        uint256[] memory amounts = uniswapRouter.getAmountsOut(
            _quoteTokenAmount,
            path
        );

        _checkOutputAmount(amounts[1]);

        return amounts[1];
    }

    function getQuoteTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _baseTokenAmount
    ) external view override returns (uint256) {
        _checkTokenAddressesAmount(_baseToken, _quoteToken, _baseTokenAmount);

        address[] memory path = new address[](2);
        path[0] = _quoteToken;
        path[1] = _baseToken;

        uint256[] memory amounts = uniswapRouter.getAmountsIn(
            _baseTokenAmount,
            path
        );

        _checkOutputAmount(amounts[0]);

        return amounts[0];
    }

    /**
     * Checks
     */

    function _checkOutputAmount(uint256 _amount) internal pure {
        require(_amount > 0, "Invalid amount from Uniswap");
    }

    /**
     * Update the Uniswap V2 router address
     */

    event UniswapRouterUpdated(address indexed _uniswapRouter);

    function updateUniswapRouter(address _uniswapRouter) external onlyOwner {
        _updateUniswapRouter(_uniswapRouter);
    }

    function _updateUniswapRouter(address _uniswapRouter) internal {
        require(
            _uniswapRouter != address(0),
            "Uniswap router cannot be zero address"
        );

        uniswapRouter = ICustomUniswapV2Router(_uniswapRouter);

        emit UniswapRouterUpdated(_uniswapRouter);
    }
}
