// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.20;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IFeeReducer} from "./IFeeReducer.sol";

contract FeeReducer is IFeeReducer, IERC165 {
    function reduceFee(
        uint256 orgId,
        address token,
        uint256 fee
    ) external pure returns (uint256) {
        // In the future, we may implement a way to reduce fees for organizations. (;
        // For now, this is just a placeholder that will not be deployed

        if (orgId == 1 && token != address(0)) {
            return (fee * 5000) / 10000;
        }

        return fee;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IFeeReducer).interfaceId;
    }
}
