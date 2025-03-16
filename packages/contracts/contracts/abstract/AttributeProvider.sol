// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IAttributeProvider} from "../metadata/IAttributeProvider.sol";

/**
 * @title AttributeProvider
 * @notice A base contract to provide attributes for tokens.
 */
abstract contract AttributeProvider is IAttributeProvider, IERC165 {
    /**
     * IERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(IAttributeProvider).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
