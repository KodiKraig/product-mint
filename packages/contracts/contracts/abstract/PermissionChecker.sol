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

    // @notice Revert if the owner does not have the permission
    error PermissionNotFound(address _owner, bytes32 _id);

    IPermissionRegistry public permissionRegistry;

    constructor(address _registry) {
        _setPermissionRegistry(_registry);
    }

    /**
     * @dev Assert a permission
     */

    /**
     * @notice Assert a permission
     * @dev Reverts if the owner does not have the permission or the permission is inactive
     * @param _permission The permission to check
     * @param _orgId The organization ID
     * @param _owner The owner to check
     */
    function _checkPermission(
        bytes32 _permission,
        uint256 _orgId,
        address _owner
    ) internal view virtual {
        if (
            !permissionRegistry.hasOwnerPermission(_orgId, _owner, _permission)
        ) {
            revert PermissionNotFound(_owner, _permission);
        }
    }

    /**
     * @notice Assert a permission by name
     * @dev Reverts if the owner does not have the permission or the permission is inactive
     * @param _permissionName The permission name to check
     * @param _orgId The organization ID
     * @param _owner The owner to check
     */
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

    /**
     * @notice Set the permission registry
     * @dev Reverts if the registry does not support the IPermissionRegistry interface
     * @param _registry The address of the new permission registry
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
