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
 * The contract owner can add new permissions and update existing permissions.
 *
 * Permission names follow the dot notation format. ex: "pass.purchase.mint"
 */
contract PermissionFactory is Ownable2Step, IPermissionFactory, IERC165 {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using PermissionUtils for string;

    // All permissions created by the factory
    EnumerableSet.Bytes32Set private allPermissions;

    // Permission ID => Permission
    mapping(bytes32 => Permission) private permissions;

    // Permission name => Permission ID
    mapping(string => bytes32) private permissionByName;

    constructor() Ownable(msg.sender) {
        _loadCorePermissions();
    }

    /**
     * @dev Create permissions
     */

    function createPermission(
        string memory _name,
        string memory _description
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

        emit PermissionCreated(permissionId, _name, _description);
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

    function getAllPermissionIds() external view returns (bytes32[] memory) {
        return allPermissions.values();
    }

    function getAllPermissions() external view returns (Permission[] memory) {
        return getPermissionBatch(allPermissions.values());
    }

    function getPermissionIdByName(
        string memory _name
    ) external view returns (bytes32) {
        bytes32 _permissionId = permissionByName[_name];
        _checkPermissionExists(_permissionId);
        return _permissionId;
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
    ) public view returns (Permission[] memory _permissions) {
        _permissions = new Permission[](_permissionIds.length);
        for (uint256 i = 0; i < _permissionIds.length; i++) {
            _checkPermissionExists(_permissionIds[i]);
            _permissions[i] = permissions[_permissionIds[i]];
        }
    }

    function getPermissionByName(
        string memory _name
    ) external view returns (Permission memory) {
        bytes32 permissionId = permissionByName[_name];
        _checkPermissionExists(permissionId);
        return permissions[permissionId];
    }

    function isPermissionActive(
        bytes32 _permissionId
    ) public view returns (bool) {
        return
            allPermissions.contains(_permissionId) &&
            permissions[_permissionId].isActive;
    }

    function isPermissionActiveByName(
        string memory _name
    ) public view returns (bool) {
        bytes32 _permissionId = permissionByName[_name];
        return isPermissionActive(_permissionId);
    }

    function isPermissionActiveBatch(
        bytes32[] memory _permissionIds
    ) external view returns (bool[] memory _isActive) {
        _isActive = new bool[](_permissionIds.length);
        for (uint256 i = 0; i < _permissionIds.length; i++) {
            _isActive[i] = isPermissionActive(_permissionIds[i]);
        }
    }

    /**
     * @dev Internal helpers
     */

    function _loadCorePermissions() internal {
        createPermission(
            PermissionUtils.PASS_WALLET_SPEND,
            "Approve an organization to spend funds from your wallet"
        );
        createPermission(
            PermissionUtils.PASS_PURCHASE_MINT,
            "Mint a new Product Pass NFT"
        );
        createPermission(
            PermissionUtils.PASS_PURCHASE_ADDITIONAL,
            "Purchase additional products"
        );
        createPermission(
            PermissionUtils.PASS_SUBSCRIPTION_RENEWAL,
            "Automatically renew expired subscriptions"
        );
        createPermission(
            PermissionUtils.PASS_SUBSCRIPTION_PRICING,
            "Update or downgrade the pricing for a subscription"
        );
        createPermission(
            PermissionUtils.PASS_SUBSCRIPTION_QUANTITY,
            "Change the quantity for a TIERED subscription"
        );
    }

    /**
     * @dev Assertions
     */

    function _checkPermissionExists(bytes32 _permissionId) internal view {
        require(
            allPermissions.contains(_permissionId),
            "Permission does not exist"
        );
    }

    /**
     * @dev Modifiers
     */

    modifier permissionExists(bytes32 _permissionId) {
        _checkPermissionExists(_permissionId);
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
