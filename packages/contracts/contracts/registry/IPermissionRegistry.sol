// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPermissionRegistry {
    error InactivePermission(bytes32 _permission);
    error InactivePermissionBatch(bytes32[] _permissions);

    function ownerPermissionsSet(
        uint256 _orgId,
        address _owner
    ) external view returns (bool);

    /**
     * @dev View owner permissions
     */

    function hasOwnerPermission(
        uint256 _orgId,
        address _owner,
        bytes32 _permission
    ) external view returns (bool);

    function hasOwnerPermissionBatch(
        uint256 _orgId,
        address _owner,
        bytes32[] memory _permissions
    ) external view returns (bool[] memory _hasPermissions);

    function getOwnerPermissions(
        uint256 _orgId,
        address _owner
    ) external view returns (bytes32[] memory);

    function getOwnerPermissionsBatch(
        uint256[] memory _orgIds,
        address[] memory _owners
    ) external view returns (bytes32[][] memory _permissions);

    /**
     * @dev Grant and revoke owner permissions
     */

    event OwnerPermissionsUpdated(
        uint256 indexed _orgId,
        address indexed _owner,
        bool indexed _grantAccess,
        bytes32[] _permissions
    );

    function addOwnerPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external;

    function removeOwnerPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external;

    /**
     * @dev Organization permissions
     */

    function excludeDefaultPermissions(
        uint256 _orgId
    ) external view returns (bool);

    event ExcludeDefaultPermissionsUpdated(
        uint256 indexed _orgId,
        bool _exclude
    );

    function setExcludeDefaultPermissions(
        uint256 _orgId,
        bool _exclude
    ) external;

    function getOrgPermissions(
        uint256 _orgId
    ) external view returns (bytes32[] memory);

    event OrgPermissionUpdated(
        uint256 indexed _orgId,
        bytes32 _permission,
        bool _add
    );

    function updateOrgPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions,
        bool[] memory _add
    ) external;

    function grantInitialOwnerPermissions(
        uint256 _orgId,
        address _owner
    ) external;

    /**
     * @dev Admin functions
     */

    struct AdminPermissionParams {
        address owner;
        uint256 orgId;
        bytes32[] permissions;
        bool grantAccess;
    }

    function adminUpdateOwnerPermissions(
        AdminPermissionParams[] calldata _params
    ) external;

    function adminGrantInitialOwnerPermissions(
        uint256[] calldata _passIds
    ) external;

    function setPermissionFactory(address _permissionFactory) external;
}
