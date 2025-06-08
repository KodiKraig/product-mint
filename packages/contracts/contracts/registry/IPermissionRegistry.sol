// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPermissionRegistry {
    struct AdminPermissionSetterParams {
        address owner;
        uint256 orgId;
        bytes32[] permissions;
        bool grantAccess;
    }

    error InactivePermission(bytes32 _id);

    /**
     * @dev View permissions
     */

    function hasPermission(
        uint256 _orgId,
        address _owner,
        bytes32 _permission
    ) external view returns (bool);

    function hasPermissions(
        uint256 _orgId,
        address _owner,
        bytes32[] memory _permissions
    ) external view returns (bool[] memory _hasPermissions);

    function getPermissions(
        uint256 _orgId,
        address _owner
    ) external view returns (bytes32[] memory);

    function getPermissionsBatch(
        uint256[] memory _orgIds,
        address[] memory _owners
    ) external view returns (bytes32[][] memory _permissions);

    /**
     * @dev Grant and revoke permissions
     */

    function addPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external;

    function removePermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external;

    /**
     * @dev Admin functions
     */

    function adminUpdatePermissions(
        AdminPermissionSetterParams[] memory _params
    ) external;

    function adminGrantAllPermissions() external;

    function setPermissionFactory(address _permissionFactory) external;
}
