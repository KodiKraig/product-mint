// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @title IDynamicERC20View
 * @notice An optional view interface for a DynamicERC20 contract
 * @dev Used to allow for view function price calculations.
 * Not all swaps support view function price quotes such as Uniswap V2 vs. Uniswap V3.
 */
interface IDynamicERC20View {
    /**
     * @notice Get the current swap price of the base token in terms of the quote token
     * @return The amount of quote token per base token
     */
    function getBaseTokenPriceView() external view returns (uint256);

    /**
     * @notice Get the amount of base tokens that would be received for a given amount of quote tokens
     * @param _quoteTokenAmount The amount of quote tokens to convert to base tokens
     * @return _baseToken The address of the base token
     * @return _baseTokenAmount The amount of base tokens that would be received
     */
    function getBaseTokenAmountView(
        uint256 _quoteTokenAmount
    ) external view returns (address _baseToken, uint256 _baseTokenAmount);

    /**
     * @notice Get the amount of quote tokens that would be received for a given amount of base tokens
     * @param _baseTokenAmount The amount of base tokens to convert to quote tokens
     * @return _quoteToken The address of the quote token
     * @return _quoteTokenAmount The amount of quote tokens that would be received
     */
    function getQuoteTokenAmountView(
        uint256 _baseTokenAmount
    ) external view returns (address _quoteToken, uint256 _quoteTokenAmount);
}
