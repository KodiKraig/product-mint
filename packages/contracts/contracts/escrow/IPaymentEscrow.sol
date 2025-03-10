// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPaymentEscrow {
    /**
     * Roles
     */

    /**
     * @notice Get the fee setter role for setting fees
     * @return Fee setter role
     */
    function FEE_SETTER_ROLE() external view returns (bytes32);

    /**
     * @notice Get the fee exempt role for setting fee exemptions for organizations
     * @return Fee exempt role
     */
    function FEE_EXEMPT_ROLE() external view returns (bytes32);

    /**
     * @notice Get the fee enabled role for setting if fees are enabled
     * @return Fee enabled role
     */
    function FEE_ENABLED_ROLE() external view returns (bytes32);

    /**
     * @notice Get the fee withdraw role for withdrawing fees required to withdraw fees
     * @return Fee withdraw role
     */
    function FEE_WITHDRAW_ROLE() external view returns (bytes32);

    /**
     * @notice Get the whitelist role for whitelisting ERC20 tokens
     * @return Whitelist role
     */
    function WHITELIST_ROLE() external view returns (bytes32);

    /**
     * Payment Processing
     */

    /**
     * @notice Emitted when a transfer is recorded that transfers funds to an org.
     * @param orgId Organization ID
     * @param from Payer (User wallet)
     * @param token Token address. Address(0) for native tokens.
     * @param totalAmount Total amount transferred to the escrow contract
     * @param orgAmount Amount transferred to the org minus fees
     */
    event TransferAmount(
        uint256 indexed orgId,
        address indexed from,
        address indexed token,
        uint256 totalAmount,
        uint256 orgAmount
    );

    /**
     * @notice Transfer directly from the user wallet to the contract and set the balance for the organization
     * @dev Only callable by the purchase manager
     * @param orgId Organization ID
     * @param from Payer (User wallet)
     * @param token Token address. Address(0) for native tokens.
     * @param amount Amount to transfer
     */
    function transferDirect(
        uint256 orgId,
        address payable from,
        address token,
        uint256 amount
    ) external payable;

    /**
     * Token Whitelisting
     */

    /**
     * @notice Emitted when a token is whitelisted.
     * @param token Token address
     * @param isWhitelisted True if the token is whitelisted, false otherwise
     */
    event WhitelistedTokenSet(address indexed token, bool isWhitelisted);

    /**
     * @notice Get if a token is whitelisted.
     * @param token Token address
     * @return True if the token is whitelisted, false otherwise
     */
    function whitelistedTokens(address token) external view returns (bool);

    /**
     * @notice Set if a token is whitelisted.
     * @dev Only whitelisted tokens can be used to purchase products
     * @param token Token address
     * @param isWhitelisted True if the token is whitelisted, false otherwise
     */
    function setWhitelistedToken(address token, bool isWhitelisted) external;

    /**
     * Balance Management
     */

    /**
     * @notice Emitted when an organization balance is withdrawn.
     * @param orgId Organization ID
     * @param token Token address. Address(0) for native tokens.
     * @param amount Amount withdrawn
     */
    event OrgBalanceWithdrawn(
        uint256 indexed orgId,
        address indexed token,
        uint256 amount
    );

    /**
     * @notice Get the balance for a specific token for an organization
     * @param orgId Organization ID
     * @param token Token address. Address(0) for native tokens.
     * @return Balance
     */
    function orgBalances(
        uint256 orgId,
        address token
    ) external view returns (uint256);

    /**
     * @notice Get the total balance for a specific token for all organizations combined
     * @param token Token address. Address(0) for native tokens.
     * @return Balance
     */
    function totalBalances(address token) external view returns (uint256);

    /**
     * @notice Withdraw an organization balance. Org balances are only available to the organization token owner.
     * @param orgId Organization ID
     * @param token Token address. Address(0) for native tokens.
     * @param amount Amount to withdraw
     */
    function withdrawOrgBalance(
        uint256 orgId,
        address token,
        uint256 amount
    ) external;

    /**
     * Fee Management
     */

    /**
     * @notice Emitted when fees are toggled on or off.
     * @param isEnabled True if fees are enabled, false otherwise
     */
    event FeeEnabled(bool isEnabled);

    /**
     * @notice Emitted when a fee is set for a specific token.
     * @param token Token address. Address(0) for native tokens.
     * @param newFee Fee amount in basis points (100 = 1%, 1000 = 10%, etc.)
     */
    event FeeSet(address indexed token, uint256 newFee);

    /**
     * @notice Emitted when the exotic fee is set.
     * @param fee Fee amount in basis points (100 = 1%, 1000 = 10%, etc.)
     */
    event ExoticFeeSet(uint256 fee);

    /**
     * @notice Emitted when a fee exemption is set for an organization.
     * @param orgId Organization ID
     * @param isExempt True if the organization is fee exempt, false otherwise
     */
    event FeeExemptSet(uint256 indexed orgId, bool isExempt);

    /**
     * @notice Emitted when a fee is withdrawn.
     * @param token Token address. Address(0) for native tokens.
     * @param amount Amount withdrawn
     */
    event FeeWithdraw(address indexed token, uint256 amount);

    /**
     * @notice Get the fee denominator
     * @return Fee denominator
     */
    function FEE_DENOMINATOR() external view returns (uint256);

    /**
     * @notice Check if fees are enabled
     * @return True if fees are enabled, false otherwise
     */
    function isFeeEnabled() external view returns (bool);

    /**
     * @notice Get the fee for a specific token
     * @param token Token address. Address(0) for native tokens.
     * @return Fee amount in basis points (100 = 1%, 1000 = 10%, etc.)
     */
    function fees(address token) external view returns (uint256);

    /**
     * @notice Get the exotic fee. This fee is applied to any ERC20 token that does not have a specific fee set.
     * @return Fee amount in basis points (100 = 1%, 1000 = 10%, etc.)
     */
    function exoticFee() external view returns (uint256);

    /**
     * @notice Set if fees are enabled
     * @param _isFeeEnabled True if fees are enabled, false otherwise
     */
    function setFeeEnabled(bool _isFeeEnabled) external;

    /**
     * @notice Set the exotic fee.
     * @param newFee Fee amount in basis points (100 = 1%, 1000 = 10%, etc.)
     */
    function setExoticFee(uint256 newFee) external;

    /**
     * @notice Check if an organization is fee exempt
     * @param orgId Organization token ID
     * @return True if the organization token ID is fee exempt, false otherwise
     */
    function feeExempt(uint256 orgId) external view returns (bool);

    /**
     * @notice Set if an organization is fee exempt
     * @param orgId Organization token ID
     * @param isExempt True if the organization token ID is fee exempt, false otherwise
     */
    function setFeeExempt(uint256 orgId, bool isExempt) external;

    /**
     * @notice Calculate the fee for a specific token
     * @param orgId The organization ID to calculate the fee for
     * @param token Token address. Address(0) for native tokens.
     * @param amount Amount to calculate the fee for
     * @return Fee amount in basis points (100 = 1%, 1000 = 10%, etc.)
     */
    function calculateFee(
        uint256 orgId,
        address token,
        uint256 amount
    ) external view returns (uint256);

    /**
     * @notice Withdraw the fee for a specific token
     * @param token Token address. Address(0) for native tokens.
     * @return balance Total amount of fees withdrawn
     */
    function withdrawFee(address token) external returns (uint256 balance);

    /**
     * @notice Get the fee balance for a specific token
     * @param token Token address. Address(0) for native tokens.
     * @return Fee balance
     */
    function getFeeBalance(address token) external view returns (uint256);

    /**
     * Fee Reducer
     */

    /**
     * @notice Get the fee reducer
     * @return Fee reducer contract address
     */
    function feeReducer() external view returns (address);

    /**
     * @notice Emitted when the fee reducer contract is set
     * @param feeReducer Fee reducer address
     */
    event FeeReducerSet(address feeReducer);

    /**
     * @notice Set the fee reducer
     * @dev Must implement the IFeeReducer interface
     * @param _feeReducer Fee reducer address
     */
    function setFeeReducer(address _feeReducer) external;
}
