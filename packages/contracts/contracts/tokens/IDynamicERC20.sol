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
     * @notice Get the path used to convert the base token to the quote token
     * @return The path used to pass through the dex
     */
    function getBaseToQuotePath() external view returns (address[] memory);

    /**
     * @notice Get the path used to convert the quote token to the base token
     * @return The path used to pass through the dex
     */
    function getQuoteToBasePath() external view returns (address[] memory);

    /**
     * @notice Get the current swap price of the base token in terms of the quote token
     * @return The amount of quote token per base token
     */
    function getBaseTokenPrice() external returns (uint256);

    /**
     * @notice Get the balance of the base token in terms of the quote token pricing
     * @param account The address to get the balance of
     * @return The balance of the base token
     */
    function balanceOfQuote(address account) external returns (uint256);

    /**
     * @notice Get the allowance of the base token in terms of the quote token pricing
     * @param owner The address to get the allowance of
     * @return The allowance of the base token
     */
    function allowanceQuote(
        address owner,
        address spender
    ) external returns (uint256);

    /**
     * @notice Get the amount of base tokens that would be received for a given amount of quote tokens
     * @param quoteTokenAmount The amount of quote tokens to convert to base tokens
     * @return baseToken The address of the base token
     * @return baseTokenAmount The amount of base tokens that would be received
     */
    function getBaseTokenAmount(
        uint256 quoteTokenAmount
    ) external returns (address baseToken, uint256 baseTokenAmount);

    /**
     * @notice Get the amount of quote tokens that would be received for a given amount of base tokens
     * @param baseTokenAmount The amount of base tokens to convert to quote tokens
     * @return quoteToken The address of the quote token
     * @return quoteTokenAmount The amount of quote tokens that would be received
     */
    function getQuoteTokenAmount(
        uint256 baseTokenAmount
    ) external returns (address quoteToken, uint256 quoteTokenAmount);
}
