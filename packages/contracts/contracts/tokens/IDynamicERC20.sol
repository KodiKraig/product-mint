// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @title IDynamicERC20
 * @notice An interface for a DynamicERC20 contract allowing for targeted pricing against a quote token.
 */
interface IDynamicERC20 {
    /**
     * @notice Get the name of the dynamic price router
     * @return The name of the dynamic price router
     */
    function routerName() external view returns (string memory);

    /**
     * @notice Get the address of the dynamic price router
     * @return The address of the dynamic price router
     */
    function dynamicPriceRouter() external view returns (address);

    /**
     * @notice The ERC20 token used to charge for payment
     * @return The contract address of the base token
     */
    function baseToken() external view returns (address);

    /**
     * @dev The ERC20 token used for price targeting
     * @return The contract address of the quote token
     */
    function quoteToken() external view returns (address);

    /**
     * @notice Get the current swap price of the base token in terms of the quote token
     * @return The amount of quote token per base token
     */
    function getBaseTokenPrice() external returns (uint256);

    /**
     * @notice Get the amount of base tokens that would be received for a given amount of quote tokens
     * @param _quoteTokenAmount The amount of quote tokens to convert to base tokens
     * @return _baseToken The address of the base token
     * @return _baseTokenAmount The amount of base tokens that would be received
     */
    function getBaseTokenAmount(
        uint256 _quoteTokenAmount
    ) external returns (address _baseToken, uint256 _baseTokenAmount);

    /**
     * @notice Get the amount of quote tokens that would be received for a given amount of base tokens
     * @param _baseTokenAmount The amount of base tokens to convert to quote tokens
     * @return _quoteToken The address of the quote token
     * @return _quoteTokenAmount The amount of quote tokens that would be received
     */
    function getQuoteTokenAmount(
        uint256 _baseTokenAmount
    ) external returns (address _quoteToken, uint256 _quoteTokenAmount);
}
