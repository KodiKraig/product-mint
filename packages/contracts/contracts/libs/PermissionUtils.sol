// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

library PermissionUtils {
    // Core pass permissions
    string constant PASS_WALLET_SPEND = "pass.wallet.spend";
    string constant PASS_PURCHASE_ADDITIONAL = "pass.purchase.additional";
    string constant PASS_SUBSCRIPTION_RENEWAL = "pass.subscription.renewal";
    string constant PASS_SUBSCRIPTION_PRICING = "pass.subscription.pricing";
    string constant PASS_SUBSCRIPTION_QUANTITY = "pass.subscription.quantity";

    // Helper function to generate permission IDs
    function id(string memory name) internal pure returns (bytes32) {
        return keccak256(abi.encode(name));
    }

    function allCorePermissions() internal pure returns (bytes32[] memory) {
        bytes32[] memory permissions = new bytes32[](5);

        permissions[0] = id(PASS_WALLET_SPEND);
        permissions[1] = id(PASS_PURCHASE_ADDITIONAL);
        permissions[2] = id(PASS_SUBSCRIPTION_RENEWAL);
        permissions[3] = id(PASS_SUBSCRIPTION_PRICING);
        permissions[4] = id(PASS_SUBSCRIPTION_QUANTITY);

        return permissions;
    }
}
