// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {IPermissionFactory} from "./IPermissionFactory.sol";
import {PermissionUtils} from "../libs/PermissionUtils.sol";

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
 * @title PermissionFactory
 * @notice The PermissionFactory is responsible for creating, updating, and retrieving permissions.
 *
 * Permissions are used to control access to various features of the system giving pass owners full control
 * over how organizations can charge their wallet for products and subscriptions minted on Product Passes.
 *
 * Only the contract owner can add new permissions and update existing permissions.
 *
 * Default permissions should always be active and granted to all owners in an org during mint.
 *
 * Permission names should follow the dot notation format. ex: "pass.wallet.spend"
 */
contract PermissionFactory is Ownable2Step, IPermissionFactory, IERC165 {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using PermissionUtils for string;

    // All permissions created by the factory
    EnumerableSet.Bytes32Set private allPermissions;

    // Default permissions
    EnumerableSet.Bytes32Set private defaultPermissions;

    // Permission ID => Permission
    mapping(bytes32 => Permission) private permissions;

    // Permission name => Permission ID
    mapping(string => bytes32) private permissionByName;

    constructor() Ownable(_msgSender()) {
        _setInitialDefaultPermissions();
    }

    /**
     * @dev Create permissions
     */

    function createPermission(
        string memory _name,
        string memory _description,
        bool _isDefault
    ) public onlyOwner {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(
            permissionByName[_name] == bytes32(0),
            "Permission name already exists"
        );

        bytes32 permissionId = _name.id();

        permissions[permissionId] = Permission({
            id: permissionId,
            name: _name,
            description: _description,
            isActive: true,
            createdAt: block.timestamp
        });

        allPermissions.add(permissionId);
        permissionByName[_name] = permissionId;

        if (_isDefault) {
            defaultPermissions.add(permissionId);

            emit DefaultPermissionAdded(permissionId);
        }

        emit PermissionCreated(permissionId, _name, _description, _isDefault);
    }

    /**
     * @dev Permission description
     */

    function setPermissionDescription(
        bytes32 _permissionId,
        string memory _description
    ) external onlyOwner permissionExists(_permissionId) {
        permissions[_permissionId].description = _description;

        emit PermissionDescriptionUpdated(_permissionId, _description);
    }

    /**
     * @dev Permission status
     */

    function setPermissionActive(
        bytes32 _permissionId,
        bool _isActive
    ) external onlyOwner permissionExists(_permissionId) {
        require(
            permissions[_permissionId].isActive != _isActive,
            "Permission already set to this active state"
        );

        permissions[_permissionId].isActive = _isActive;

        emit PermissionActivation(_permissionId, _isActive);
    }

    /**
     * @dev View permissions
     */

    function getPermissionIdByName(
        string memory _name
    ) external view returns (bytes32) {
        bytes32 _permissionId = permissionByName[_name];
        _checkPermissionExists(_permissionId);
        return _permissionId;
    }

    function getAllPermissionIds() external view returns (bytes32[] memory) {
        return allPermissions.values();
    }

    function getAllPermissions() external view returns (Permission[] memory) {
        return getPermissionBatch(allPermissions.values());
    }

    function getPermission(
        bytes32 _permissionId
    )
        external
        view
        permissionExists(_permissionId)
        returns (Permission memory)
    {
        return permissions[_permissionId];
    }

    function getPermissionBatch(
        bytes32[] memory _permissionIds
    )
        public
        view
        permissionsProvided(_permissionIds)
        returns (Permission[] memory _permissions)
    {
        _permissions = new Permission[](_permissionIds.length);
        for (uint256 i = 0; i < _permissionIds.length; i++) {
            _checkPermissionExists(_permissionIds[i]);
            _permissions[i] = permissions[_permissionIds[i]];
        }
    }

    function getPermissionByName(
        string memory _name
    ) public view returns (Permission memory) {
        bytes32 permissionId = permissionByName[_name];
        _checkPermissionExists(permissionId);
        return permissions[permissionId];
    }

    function getPermissionByNameBatch(
        string[] memory _names
    )
        external
        view
        permissionNamesProvided(_names)
        returns (Permission[] memory _permissions)
    {
        _permissions = new Permission[](_names.length);
        for (uint256 i = 0; i < _names.length; i++) {
            _permissions[i] = getPermissionByName(_names[i]);
        }
    }

    function isPermissionActive(
        bytes32 _permissionId
    ) public view returns (bool) {
        return
            allPermissions.contains(_permissionId) &&
            permissions[_permissionId].isActive;
    }

    function isPermissionActiveBatch(
        bytes32[] memory _permissionIds
    ) external view permissionsProvided(_permissionIds) returns (bool) {
        for (uint256 i = 0; i < _permissionIds.length; i++) {
            if (!isPermissionActive(_permissionIds[i])) {
                return false;
            }
        }
        return true;
    }

    function isPermissionActiveByName(
        string memory _name
    ) public view returns (bool) {
        bytes32 _permissionId = permissionByName[_name];
        return isPermissionActive(_permissionId);
    }

    function isPermissionActiveByNameBatch(
        string[] memory _names
    ) external view permissionNamesProvided(_names) returns (bool) {
        for (uint256 i = 0; i < _names.length; i++) {
            if (!isPermissionActiveByName(_names[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Default permissions
     */

    function getDefaultPermissionIds()
        external
        view
        returns (bytes32[] memory)
    {
        return defaultPermissions.values();
    }

    function isDefaultPermission(
        bytes32 _permissionId
    ) external view returns (bool) {
        return defaultPermissions.contains(_permissionId);
    }

    function addDefaultPermission(
        bytes32 _permissionId
    ) external onlyOwner permissionExists(_permissionId) {
        require(
            !defaultPermissions.contains(_permissionId),
            "Permission already added"
        );

        defaultPermissions.add(_permissionId);

        emit DefaultPermissionAdded(_permissionId);
    }

    function removeDefaultPermission(
        bytes32 _permissionId
    ) external onlyOwner permissionExists(_permissionId) {
        require(
            defaultPermissions.contains(_permissionId),
            "Permission not added"
        );

        defaultPermissions.remove(_permissionId);

        emit DefaultPermissionRemoved(_permissionId);
    }

    function _setInitialDefaultPermissions() internal {
        createPermission(
            PermissionUtils.PASS_WALLET_SPEND,
            "Approve an organization to spend funds from your wallet",
            true
        );
        createPermission(
            PermissionUtils.PASS_PURCHASE_ADDITIONAL,
            "Purchase additional products",
            true
        );
        createPermission(
            PermissionUtils.PASS_SUBSCRIPTION_RENEWAL,
            "Automatically renew expired subscriptions",
            true
        );
        createPermission(
            PermissionUtils.PASS_SUBSCRIPTION_PRICING,
            "Update or downgrade the pricing for a subscription",
            true
        );
        createPermission(
            PermissionUtils.PASS_SUBSCRIPTION_QUANTITY,
            "Change the quantity for a TIERED subscription",
            true
        );
    }

    /**
     * @dev Checks
     */

    function _checkPermissionExists(bytes32 _permissionId) internal view {
        require(
            allPermissions.contains(_permissionId),
            "Permission does not exist"
        );
    }

    function _checkPermissionsProvided(
        bytes32[] memory _permissions
    ) internal pure {
        require(_permissions.length > 0, "No permissions provided");
    }

    function _checkPermissionNamesProvided(
        string[] memory _names
    ) internal pure {
        require(_names.length > 0, "No permission names provided");
    }

    /**
     * @dev Modifiers
     */

    modifier permissionExists(bytes32 _permissionId) {
        _checkPermissionExists(_permissionId);
        _;
    }

    modifier permissionsProvided(bytes32[] memory _permissions) {
        _checkPermissionsProvided(_permissions);
        _;
    }

    modifier permissionNamesProvided(string[] memory _names) {
        _checkPermissionNamesProvided(_names);
        _;
    }

    /**
     * @dev ERC165
     */

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == type(IPermissionFactory).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
