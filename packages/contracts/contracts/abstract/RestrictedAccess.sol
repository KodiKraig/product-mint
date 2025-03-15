// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IRestrictedAccess} from "./IRestrictedAccess.sol";

/**
 * @title RestrictedAccess
 * @notice Abstract contract for managing restricted access for organizations and product pass owners.
 */
abstract contract RestrictedAccess is IRestrictedAccess, IERC165 {
    using EnumerableSet for EnumerableSet.UintSet;

    // Organization ID => Pass Owner => Access IDs
    mapping(uint256 => mapping(address => EnumerableSet.UintSet))
        internal restrictedAccess;

    /**
     * Get Restricted Access
     */

    function getRestrictedAccess(
        uint256 orgId,
        address passOwner
    ) external view returns (uint256[] memory) {
        return restrictedAccess[orgId][passOwner].values();
    }

    function hasRestrictedAccess(
        uint256 orgId,
        address passOwner,
        uint256 accessId
    ) external view returns (bool) {
        return restrictedAccess[orgId][passOwner].contains(accessId);
    }

    /**
     * Set Restricted Access
     */

    function _setRestrictedAccess(
        uint256 orgId,
        uint256 accessId,
        address[] calldata passOwners,
        bool[] calldata restricted
    ) internal {
        if (passOwners.length == 0 || passOwners.length != restricted.length) {
            revert InvalidRestrictedAccessInput();
        }

        for (uint256 i = 0; i < passOwners.length; i++) {
            if (restricted[i]) {
                restrictedAccess[orgId][passOwners[i]].add(accessId);
            } else {
                restrictedAccess[orgId][passOwners[i]].remove(accessId);
            }

            emit RestrictedAccessUpdated(
                orgId,
                accessId,
                passOwners[i],
                restricted[i]
            );
        }
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IRestrictedAccess).interfaceId;
    }
}
