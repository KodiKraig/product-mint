// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @title PermissionUtils
 * @notice Utility library for working with permissions
 */
library PermissionUtils {
    /**
     * @notice Generate a permission ID from a name
     * @param _name The name of the permission
     * @return The ID of the permission
     */
    function id(string memory _name) internal pure returns (bytes32) {
        return keccak256(abi.encode(_name));
    }

    /**
     * @dev Initial default pass permissions for each organization and pass owner
     * that were originally deployed with the permissions system.
     */

    /**
     * @notice Can the org spend tokens from the owner wallet
     */
    string constant PASS_WALLET_SPEND = "pass.wallet.spend";

    /**
     * @notice Purchase additional products for an existing product pass
     */
    string constant PASS_PURCHASE_ADDITIONAL = "pass.purchase.additional";

    /**
     * @notice Renew an existing expired subscription
     */
    string constant PASS_SUBSCRIPTION_RENEWAL = "pass.subscription.renewal";

    /**
     * @notice Change the pricing model for an existing subscription
     */
    string constant PASS_SUBSCRIPTION_PRICING = "pass.subscription.pricing";

    /**
     * @notice Change the unit quantity for an existing TIERED subscription
     */
    string constant PASS_SUBSCRIPTION_QUANTITY = "pass.subscription.quantity";
}
