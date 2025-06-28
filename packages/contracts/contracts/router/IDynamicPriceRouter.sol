// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IDynamicPriceRouter {
    /**
     * @notice Get the current price of the base token in terms of the quote token.
     * @param _baseToken The base token of the dynamic ERC20 token
     * @param _quoteToken The quote token of the dynamic ERC20 token
     * @return The amount of quote token per base token
     */
    function getBaseTokenPrice(
        address _baseToken,
        address _quoteToken
    ) external view returns (uint256);

    /**
     * @notice Get the amount of base token received for a given amount of quote token.
     * @param _baseToken The base token of the dynamic ERC20 token
     * @param _quoteToken The quote token of the dynamic ERC20 token
     * @param _quoteTokenAmount The amount of quote token to swap
     * @return The amount of base token received
     */
    function getBaseTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _quoteTokenAmount
    ) external view returns (uint256);

    /**
     * @notice Get the amount of quote token received for a given amount of base token.
     * @param _baseToken The base token of the dynamic ERC20 token
     * @param _quoteToken The quote token of the dynamic ERC20 token
     * @param _baseTokenAmount The amount of base token to buy
     * @return The amount of quote token received
     */
    function getQuoteTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _baseTokenAmount
    ) external view returns (uint256);
}
