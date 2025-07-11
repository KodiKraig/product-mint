// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IDynamicPriceRegistry {
    /**
     * Roles
     */

    /**
     * @notice The role required to register a new dynamic token
     */
    function REGISTER_TOKEN_ROLE() external view returns (bytes32);

    /**
     * @notice The role required to unregister and remove a dynamic token
     */
    function UNREGISTER_TOKEN_ROLE() external view returns (bytes32);

    /**
     * View functions
     */

    /**
     * @notice Get the number of tokens registered in the registry
     * @return The number of tokens registered in the registry
     */
    function getTokenCount() external view returns (uint256);

    /**
     * @notice Get the list of tokens registered in the registry
     * @return The list of tokens registered in the registry
     */
    function getTokens() external view returns (address[] memory);

    /**
     * @notice Check if a token is registered in the registry
     * @param token The address of the token to check
     * @return True if the token is registered, false otherwise
     */
    function isTokenRegistered(address token) external view returns (bool);

    /**
     * @notice Check if a list of tokens are registered in the registry
     * @param tokens The list of tokens to check
     * @return True if all tokens are registered, false otherwise
     */
    function isTokenRegisteredBatch(
        address[] calldata tokens
    ) external view returns (bool);

    /**
     * Update the registry
     */

    /**
     * @notice Emitted when a token is registered or unregistered
     * @param token The address of the token that was registered or unregistered
     * @param registered True if the token was registered, false if it was unregistered
     */
    event DynamicTokenRegistrationUpdated(
        address indexed token,
        bool registered
    );

    /**
     * @notice Register a token in the registry
     * @param token The address of the token to register
     */
    function registerToken(address token) external;

    /**
     * @notice Unregister a token in the registry
     * @param token The address of the token to unregister
     */
    function unregisterToken(address token) external;
}
