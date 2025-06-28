// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {DynamicPriceRouter} from "../abstract/DynamicPriceRouter.sol";

contract UniswapV2DynamicPriceRouter is DynamicPriceRouter {
    function getBaseTokenPrice(
        address _baseToken,
        address _quoteToken
    ) external view override returns (uint256) {
        return 0;
    }

    function getQuoteTokenPrice(
        address _baseToken,
        address _quoteToken
    ) external view override returns (uint256) {
        return 0;
    }

    function getBaseTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _quoteTokenAmount
    ) external view override returns (uint256) {
        return 0;
    }

    function getQuoteTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _baseTokenAmount
    ) external view override returns (uint256) {
        return 0;
    }
}
