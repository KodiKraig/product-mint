// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPermissionRegistry {
    /**
     * @dev Errors
     */

    /**
     * @notice Revert if a permission is inactive
     *
     * @param _permission The ID of the inactive permission
     */
    error InactivePermission(bytes32 _permission);

    /**
     * @notice Revert if any of the permissions are inactive
     *
     * @param _permissions The IDs of the potentially inactive permissions
     */
    error InactivePermissionBatch(bytes32[] _permissions);

    /**
     * @dev View owner permissions
     */

    /**
     * @notice Has the owner had their initial permissions set for the org?
     *
     * @param _orgId The ID of the organization
     * @param _owner The address of the owner
     * @return True if the owner permissions have been set for the org, false otherwise
     */
    function ownerPermissionsSet(
        uint256 _orgId,
        address _owner
    ) external view returns (bool);

    /**
     * @notice Does the owner have a permission for the org?
     *
     * @param _orgId The ID of the organization
     * @param _owner The address of the owner
     * @param _permission The ID of the permission
     * @return True if the owner has the permission, false otherwise
     */
    function hasOwnerPermission(
        uint256 _orgId,
        address _owner,
        bytes32 _permission
    ) external view returns (bool);

    /**
     * @notice Does the owner have a batch of permissions for the org?
     *
     * @param _orgId The ID of the organization
     * @param _owner The address of the owner
     * @param _permissions The IDs of the permissions
     * @return _hasPermissions Resulting array of booleans indicating if the owner has each permission
     */
    function hasOwnerPermissionBatch(
        uint256 _orgId,
        address _owner,
        bytes32[] memory _permissions
    ) external view returns (bool[] memory _hasPermissions);

    /**
     * @notice Get all the permissions for the owner
     *
     * @param _orgId The ID of the organization
     * @param _owner The address of the owner
     * @return _permissions The IDs of the permissions
     */
    function getOwnerPermissions(
        uint256 _orgId,
        address _owner
    ) external view returns (bytes32[] memory);

    /**
     * @notice Get all the permissions for a batch of owners
     *
     * @param _orgIds The IDs of the organizations
     * @param _owners The addresses of the owners
     * @return _permissions The IDs of the permissions
     */
    function getOwnerPermissionsBatch(
        uint256[] memory _orgIds,
        address[] memory _owners
    ) external view returns (bytes32[][] memory _permissions);

    /**
     * @dev Grant and revoke owner permissions
     */

    /**
     * @notice Emitted when owner permissions are updated
     *
     * @param _orgId The ID of the organization
     * @param _owner The address of the owner
     * @param _grantAccess True if the permissions are being granted, false if they are being revoked
     * @param _permissions The IDs of the permissions
     */
    event OwnerPermissionsUpdated(
        uint256 indexed _orgId,
        address indexed _owner,
        bool indexed _grantAccess,
        bytes32[] _permissions
    );

    /**
     * @notice Grant permissions to the owner
     *
     * @dev caller can only update their own permissions
     * @param _orgId The ID of the organization
     * @param _permissions The IDs of the permissions
     */
    function addOwnerPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external;

    /**
     * @notice Revoke permissions from the owner
     *
     * @dev caller can only update their own permissions
     * @param _orgId The ID of the organization
     * @param _permissions The IDs of the permissions
     */
    function removeOwnerPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external;

    /**
     * @dev Organization permissions
     */

    /**
     * @notice Is the default permissions excluded for the org?
     *
     * If true then new pass owners will not be granted the default permissions.
     *
     * @param _orgId The ID of the organization
     * @return True if the default permissions are excluded, false otherwise
     */
    function excludeDefaultPermissions(
        uint256 _orgId
    ) external view returns (bool);

    /**
     * @notice Emitted when the default permissions exclusion is updated for the org
     *
     * @param _orgId The ID of the organization
     * @param _exclude True if the default permissions are excluded, false otherwise
     */
    event ExcludeDefaultPermissionsUpdated(
        uint256 indexed _orgId,
        bool _exclude
    );

    /**
     * @notice Set if the default permissions are excluded for the org during initial purchase
     *
     * @param _orgId The ID of the organization
     * @param _exclude True if the default permissions are excluded, false otherwise
     */
    function setExcludeDefaultPermissions(
        uint256 _orgId,
        bool _exclude
    ) external;

    /**
     * @notice Get all the permissions for the organization.
     *
     * These additional permissions are granted to the pass owner during the initial purchase.
     *
     * @param _orgId The ID of the organization
     * @return _permissions The IDs of the permissions
     */
    function getOrgPermissions(
        uint256 _orgId
    ) external view returns (bytes32[] memory);

    /**
     * @notice Emitted when an organization permission is updated
     *
     * @param _orgId The ID of the organization
     * @param _permission The ID of the permission
     * @param _add True if the permission is being added, false if it is being removed
     */
    event OrgPermissionUpdated(
        uint256 indexed _orgId,
        bytes32 _permission,
        bool _add
    );

    /**
     * @notice Update the permissions for the organization
     *
     * @param _orgId The ID of the organization
     * @param _permissions The IDs of the permissions
     * @param _add True if the permissions are being added, false if they are being removed
     */
    function updateOrgPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions,
        bool[] memory _add
    ) external;

    /**
     * @notice Grant the initial permissions to the owner
     *
     * @dev Only the purchase manager can call this function
     * @param _orgId The ID of the organization
     * @param _owner The address of the owner
     */
    function grantInitialOwnerPermissions(
        uint256 _orgId,
        address _owner
    ) external;

    /**
     * @dev Admin functions
     */

    /**
     * @notice Parameters for updating owner permissions
     *
     * @param owner The address of the owner
     * @param orgId The ID of the organization
     * @param permissions The IDs of the permissions
     * @param grantAccess True if the permissions are being granted, false if they are being revoked
     */
    struct AdminPermissionParams {
        address owner;
        uint256 orgId;
        bytes32[] permissions;
        bool grantAccess;
    }

    /**
     * @notice Update the owner permissions
     *
     * @dev Only the owner can call this function
     * @param _params The parameters for updating the owner permissions
     */
    function adminUpdateOwnerPermissions(
        AdminPermissionParams[] calldata _params
    ) external;

    /**
     * @notice Grant the initial permissions to the owners of a batch of passes
     *
     * This can be used to backfill the initial permissions for all pass owners
     * who have already purchased passes.
     *
     * @dev Only the owner can call this function
     * @param _passIds The IDs of the passes
     */
    function adminGrantInitialOwnerPermissions(
        uint256[] calldata _passIds
    ) external;

    /**
     * @notice Set the permission factory
     *
     * @dev Only the owner can call this function
     * @param _permissionFactory The address of the permission factory
     */
    function setPermissionFactory(address _permissionFactory) external;
}
