// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPermissionFactory {
    struct Permission {
        bytes32 id;
        string name;
        string description;
        bool isActive;
        uint256 createdAt;
    }

    event PermissionCreated(
        bytes32 indexed permissionId,
        string name,
        string description
    );
    event PermissionActivation(bytes32 indexed permissionId, bool isActive);

    /**
     * @dev Create permissions
     */

    function createPermission(
        string memory _name,
        string memory _description
    ) external;

    /**
     * @dev Permission status
     */

    function setPermissionActive(
        bytes32 _permissionId,
        bool _isActive
    ) external;

    /**
     * @dev View permissions
     */

    function getPermission(
        bytes32 _permissionId
    ) external view returns (Permission memory);

    function getPermissionBatch(
        bytes32[] memory _permissionIds
    ) external view returns (Permission[] memory _permissions);

    function getPermissionIdByName(
        string memory _name
    ) external view returns (bytes32);

    function getPermissionByName(
        string memory _name
    ) external view returns (Permission memory);

    function getAllPermissionIds() external view returns (bytes32[] memory);

    function getAllPermissions() external view returns (Permission[] memory);

    function isPermissionActive(
        bytes32 _permissionId
    ) external view returns (bool);

    function isPermissionActiveByName(
        string memory _name
    ) external view returns (bool);

    function isPermissionActiveBatch(
        bytes32[] memory _permissionIds
    ) external view returns (bool[] memory _isActive);
}
