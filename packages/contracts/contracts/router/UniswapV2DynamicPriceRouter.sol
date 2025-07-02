// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {DynamicPriceRouter} from "../abstract/DynamicPriceRouter.sol";
import {ICustomUniswapV2Router} from "./ICustomUniswapV2Router.sol";

contract UniswapV2DynamicPriceRouter is DynamicPriceRouter {
    ICustomUniswapV2Router public uniswapV2Router;

    constructor(address _uniswapRouter) DynamicPriceRouter() {
        _updateUniswapRouter(_uniswapRouter);
    }

    /**
     * IDynamicPriceRouter
     */

    function routerName() external pure override returns (string memory) {
        return "uniswap-v2";
    }

    function getBaseTokenPrice(
        address _baseToken,
        address _quoteToken
    ) external view override returns (uint256) {
        _checkTokenAddresses(_baseToken, _quoteToken);

        // Returned in quote token decimals
        return
            _getAmountsOut(
                _baseToken,
                _quoteToken,
                10 ** IERC20Metadata(_baseToken).decimals()
            );
    }

    function getBaseTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _quoteTokenAmount
    ) external view override returns (uint256) {
        _checkTokenAddressesAmount(_baseToken, _quoteToken, _quoteTokenAmount);

        // Returned in base token decimals
        return _getAmountsOut(_quoteToken, _baseToken, _quoteTokenAmount);
    }

    function getQuoteTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _baseTokenAmount
    ) external view override returns (uint256) {
        _checkTokenAddressesAmount(_baseToken, _quoteToken, _baseTokenAmount);

        // Returned in quote token decimals
        return _getAmountsOut(_baseToken, _quoteToken, _baseTokenAmount);
    }

    function _getAmountsOut(
        address _path1,
        address _path2,
        uint256 _amountIn
    ) internal view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = _path1;
        path[1] = _path2;

        uint256[] memory amounts = uniswapV2Router.getAmountsOut(
            _amountIn,
            path
        );

        _checkOutputAmount(amounts[1]);

        return amounts[1];
    }

    /**
     * Checks
     */

    function _checkOutputAmount(uint256 _amount) internal pure {
        require(_amount > 0, "Invalid amount out from Uniswap");
    }

    /**
     * Update the Uniswap V2 router address
     */

    /**
     * @notice Emitted when the Uniswap V2 router address is updated.
     * @param _uniswapRouter The new Uniswap V2 router address
     */
    event UniswapRouterUpdated(address indexed _uniswapRouter);

    /**
     * @notice Update the Uniswap V2 router address
     * @param _uniswapRouter The new Uniswap V2 router address
     */
    function updateUniswapRouter(address _uniswapRouter) external onlyOwner {
        _updateUniswapRouter(_uniswapRouter);
    }

    function _updateUniswapRouter(address _uniswapRouter) internal {
        require(
            _uniswapRouter != address(0),
            "Uniswap router cannot be zero address"
        );

        uniswapV2Router = ICustomUniswapV2Router(_uniswapRouter);

        emit UniswapRouterUpdated(_uniswapRouter);
    }
}
