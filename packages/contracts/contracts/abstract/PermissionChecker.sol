// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";

import {IPermissionRegistry} from "../registry/IPermissionRegistry.sol";
import {PermissionUtils} from "../libs/PermissionUtils.sol";

/**
 * @title PermissionChecker
 * @notice Assert that a permission exists for an organization and owner using the permission registry.
 */
abstract contract PermissionChecker {
    using PermissionUtils for string;

    error PermissionNotFound(bytes32 _id, address _caller);

    IPermissionRegistry public permissionRegistry;

    constructor(address _registry) {
        _setPermissionRegistry(_registry);
    }

    /**
     * @dev Assert a permission
     */

    function _checkPermission(
        bytes32 _permission,
        uint256 _orgId,
        address _owner
    ) internal view virtual {
        if (
            !permissionRegistry.hasOwnerPermission(_orgId, _owner, _permission)
        ) {
            revert PermissionNotFound(_permission, _owner);
        }
    }

    function _checkPermissionName(
        string memory _permissionName,
        uint256 _orgId,
        address _owner
    ) internal view virtual {
        _checkPermission(_permissionName.id(), _orgId, _owner);
    }

    /**
     * @dev Set the permission registry
     */

    function _setPermissionRegistry(address _registry) internal virtual {
        require(
            IERC165(_registry).supportsInterface(
                type(IPermissionRegistry).interfaceId
            ),
            "Invalid permission registry"
        );
        permissionRegistry = IPermissionRegistry(_registry);
    }
}
