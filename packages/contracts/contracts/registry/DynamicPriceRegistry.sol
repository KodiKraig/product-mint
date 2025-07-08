// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";

import {IDynamicERC20} from "../tokens/IDynamicERC20.sol";
import {IDynamicPriceRegistry} from "./IDynamicPriceRegistry.sol";
import {IPaymentEscrow} from "../escrow/IPaymentEscrow.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";

/*
 ____                 _            _   __  __ _       _   
|  _ \ _ __ ___   __| |_   _  ___| |_|  \/  (_)_ __ | |_ 
| |_) | '__/ _ \ / _` | | | |/ __| __| |\/| | | '_ \| __|
|  __/| | | (_) | (_| | |_| | (__| |_| |  | | | | | | |_ 
|_|   |_|  \___/ \__,_|\__,_|\___|\__|_|  |_|_|_| |_|\__|
 
 NFT based payment system to mint products onchain with one-time payments and 
 recurring permissionless subscriptions.

 https://productmint.io
*/

/**
 * @title Dynamic Price Registry
 * @notice Manages the dynamic price tokens for the ProductMint system.
 * The registry is used to store the dynamic token contract addresses.
 */
contract DynamicPriceRegistry is
    AccessControl,
    RegistryEnabled,
    IDynamicPriceRegistry
{
    using EnumerableSet for EnumerableSet.AddressSet;

    // The set of all dynamic tokens
    EnumerableSet.AddressSet private tokens;

    // The role required to register a new dynamic token
    bytes32 public constant REGISTER_TOKEN_ROLE =
        keccak256("REGISTER_TOKEN_ROLE");

    // The role required to unregister and remove a dynamic token
    bytes32 public constant UNREGISTER_TOKEN_ROLE =
        keccak256("UNREGISTER_TOKEN_ROLE");

    constructor(
        address _contractRegistry
    ) AccessControl() RegistryEnabled(_contractRegistry) {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(REGISTER_TOKEN_ROLE, _msgSender());
        _grantRole(UNREGISTER_TOKEN_ROLE, _msgSender());
    }

    /**
     * View functions
     */

    function getTokenCount() external view returns (uint256) {
        return tokens.length();
    }

    function getTokens() external view returns (address[] memory) {
        return tokens.values();
    }

    function isTokenRegistered(address _token) external view returns (bool) {
        return tokens.contains(_token);
    }

    function isTokenRegisteredBatch(
        address[] calldata _tokens
    ) external view returns (bool) {
        require(_tokens.length > 0, "No tokens provided");

        for (uint256 i = 0; i < _tokens.length; i++) {
            if (!tokens.contains(_tokens[i])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Update the registry
     */

    function registerToken(
        address _token
    ) external onlyRole(REGISTER_TOKEN_ROLE) {
        require(!tokens.contains(_token), "Token already registered");
        require(
            IERC165(_token).supportsInterface(type(IDynamicERC20).interfaceId),
            "Token does not support IDynamicERC20"
        );
        require(
            IPaymentEscrow(registry.paymentEscrow()).whitelistedTokens(_token),
            "Dynamic token is not whitelisted"
        );
        require(
            IPaymentEscrow(registry.paymentEscrow()).whitelistedTokens(
                IDynamicERC20(_token).baseToken()
            ),
            "Base token is not whitelisted"
        );

        tokens.add(_token);

        emit DynamicTokenRegistrationUpdated(_token, true);
    }

    function unregisterToken(
        address _token
    ) external onlyRole(UNREGISTER_TOKEN_ROLE) {
        require(tokens.contains(_token), "Token not registered");

        tokens.remove(_token);

        emit DynamicTokenRegistrationUpdated(_token, false);
    }

    /**
     * IERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IDynamicPriceRegistry).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
