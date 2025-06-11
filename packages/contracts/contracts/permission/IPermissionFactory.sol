// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IPermissionFactory {
    /**
     * @dev Permission struct
     *
     * @param id The ID of the permission. Hash of the name.
     * @param name The name of the permission. In dot notation (e.g. "pass.wallet.spend")
     * @param description The description of the permission.
     * @param isActive The active status of the permission.
     * @param createdAt The block timestamp when the permission was created.
     */
    struct Permission {
        bytes32 id;
        string name;
        string description;
        bool isActive;
        uint256 createdAt;
    }

    /**
     * @dev Create permissions
     */

    /**
     * @dev Permission creation
     * Emitted when a new permission is created.
     *
     * @param permissionId The ID of the permission
     * @param name The name of the permission
     * @param description The description of the permission
     * @param isDefault True if the permission is a default permission
     */
    event PermissionCreated(
        bytes32 indexed permissionId,
        string name,
        string description,
        bool isDefault
    );

    /**
     * Create a new permission.
     *
     * The ID is set to the keccak256 of the name.
     *
     * The permission is set to active by default.
     *
     * @dev only owner can create permissions
     * @param _name The name of the permission in dot notation (e.g. "pass.wallet.spend")
     * @param _description The description of the permission
     * @param _isDefault Should the permission be a default permission
     */
    function createPermission(
        string memory _name,
        string memory _description,
        bool _isDefault
    ) external;

    /**
     * @dev Permission status
     */

    /**
     * @dev Permission activation
     * Emitted when a permission is activated or deactivated.
     */
    event PermissionActivation(bytes32 indexed permissionId, bool isActive);

    /**
     * Set the active status of a permission.
     *
     * @dev only owner can set the active status of a permission
     * @param _permissionId The ID of the permission
     * @param _isActive The active status of the permission
     */
    function setPermissionActive(
        bytes32 _permissionId,
        bool _isActive
    ) external;

    /**
     * @dev View permissions
     */

    /**
     * Get the ID of a permission by name.
     *
     * @param _name The name of the permission in dot notation (e.g. "pass.wallet.spend")
     * @return The ID of the permission
     */
    function getPermissionIdByName(
        string memory _name
    ) external view returns (bytes32);

    /**
     * Get all permission IDs.
     *
     * @return The IDs of all permissions
     */
    function getAllPermissionIds() external view returns (bytes32[] memory);

    /**
     * Get all permissions.
     *
     * @return The permissions
     */
    function getAllPermissions() external view returns (Permission[] memory);

    /**
     * Get a permission by ID.
     *
     * @param _permissionId The ID of the permission
     * @return The permission
     */
    function getPermission(
        bytes32 _permissionId
    ) external view returns (Permission memory);

    /**
     * Get a batch of permissions by ID.
     *
     * @param _permissionIds The IDs of the permissions
     * @return _permissions The permissions
     */
    function getPermissionBatch(
        bytes32[] memory _permissionIds
    ) external view returns (Permission[] memory _permissions);

    /**
     * Get a permission by name.
     *
     * @param _name The name of the permission in dot notation (e.g. "pass.wallet.spend")
     * @return The permission
     */
    function getPermissionByName(
        string memory _name
    ) external view returns (Permission memory);

    /**
     * Get a batch of permissions by name.
     *
     * @param _names The names of the permissions in dot notation (e.g. ["pass.wallet.spend", "pass.purchase.mint"])
     * @return _permissions The permissions
     */
    function getPermissionByNameBatch(
        string[] memory _names
    ) external view returns (Permission[] memory _permissions);

    /**
     * Check if a permission is active.
     *
     * @param _permissionId The ID of the permission
     * @return The active status of the permission
     */
    function isPermissionActive(
        bytes32 _permissionId
    ) external view returns (bool);

    /**
     * Check if a batch of permissions are active.
     *
     * @param _permissionIds The IDs of the permissions
     * @return true if all permissions are active, false otherwise
     */
    function isPermissionActiveBatch(
        bytes32[] memory _permissionIds
    ) external view returns (bool);

    /**
     * Check if a permission is active by name.
     *
     * @param _name The name of the permission in dot notation (e.g. "pass.wallet.spend")
     * @return The active status of the permission
     */
    function isPermissionActiveByName(
        string memory _name
    ) external view returns (bool);

    /**
     * Check if a batch of permissions are active by name.
     *
     * @param _names The names of the permissions in dot notation (e.g. ["pass.wallet.spend", "pass.purchase.mint"])
     * @return true if all permissions are active, false otherwise
     */
    function isPermissionActiveByNameBatch(
        string[] memory _names
    ) external view returns (bool);

    /**
     * @dev Default permissions
     */

    /**
     * Get all default permissions.
     *
     * @return The IDs of all default permissions
     */
    function getDefaultPermissionIds() external view returns (bytes32[] memory);

    /**
     * Check if a permission is a default permission.
     *
     * @param _permissionId The ID of the permission
     * @return True if the permission is a default permission, false otherwise
     */
    function isDefaultPermission(
        bytes32 _permissionId
    ) external view returns (bool);

    /**
     * @dev Default permission addition
     * Emitted when a new default permission is added.
     *
     * @param permissionId The ID of the permission
     */
    event DefaultPermissionAdded(bytes32 indexed permissionId);

    /**
     * Add a permission as a default permission.
     *
     * @param _permissionId The ID of the permission
     */
    function addDefaultPermission(bytes32 _permissionId) external;

    /**
     * @dev Default permission removal
     * Emitted when a default permission is removed.
     *
     * @param permissionId The ID of the permission
     */
    event DefaultPermissionRemoved(bytes32 indexed permissionId);

    /**
     * Remove a permission as a default permission.
     *
     * @param _permissionId The ID of the permission
     */
    function removeDefaultPermission(bytes32 _permissionId) external;
}
