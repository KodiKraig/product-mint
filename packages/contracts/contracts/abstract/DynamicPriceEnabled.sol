// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";

import {IDynamicERC20} from "../tokens/IDynamicERC20.sol";
import {IDynamicPriceRegistry} from "../registry/IDynamicPriceRegistry.sol";

/**
 * @title DynamicPriceEnabled
 * @author ProductMint
 * @notice Abstract contract that enables dynamic price functionality to translate purchase prices
 * for dynamic tokens to base tokens and quote tokens.
 */
abstract contract DynamicPriceEnabled {
    // The registry to check if a token is a DynamicERC20
    IDynamicPriceRegistry public dynamicPriceRegistry;

    /**
     * @notice Emitted when the dynamic price registry is updated
     * @param _dynamicPriceRegistry The address of the new dynamic price registry
     */
    event DynamicPriceRegistryUpdated(address indexed _dynamicPriceRegistry);

    constructor(address _dynamicPriceRegistry) {
        _setDynamicPriceRegistry(_dynamicPriceRegistry);
    }

    /**
     * @dev Translate the purchase price of a dynamic token to the base token
     */
    function _translateBaseTokenPurchasePrice(
        address token,
        uint256 amount
    ) internal virtual returns (address, uint256) {
        if (dynamicPriceRegistry.isTokenRegistered(token)) {
            return IDynamicERC20(token).getBaseTokenAmount(amount);
        }
        return (token, amount);
    }

    /**
     * @dev Set the dynamic price registry
     */
    function _setDynamicPriceRegistry(
        address _dynamicPriceRegistry
    ) internal virtual {
        require(
            IERC165(_dynamicPriceRegistry).supportsInterface(
                type(IDynamicPriceRegistry).interfaceId
            ),
            "IDynamicPriceRegistry not supported"
        );

        dynamicPriceRegistry = IDynamicPriceRegistry(_dynamicPriceRegistry);

        emit DynamicPriceRegistryUpdated(_dynamicPriceRegistry);
    }
}
