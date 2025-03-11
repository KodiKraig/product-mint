// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IOrganizationAdmin {
    /**
     * Organization Admins
     */

    /**
     * @notice Emitted when an admin is added or removed from an organization.
     * @param orgId The ID of the organization.
     * @param admin The address of the admin.
     * @param status The status of the admin. True if added, false if removed.
     */
    event OrgAdminUpdate(
        uint256 indexed orgId,
        address indexed admin,
        bool status
    );

    /**
     * @notice Adds an admin to the organization.
     * Admins are great for delegating the responsibilities of the organization.
     * @dev Only the owner of the organization can add admins.
     * @param organizationId The ID of the organization.
     * @param admin The address of the admin to add.
     */
    function addAdmin(uint256 organizationId, address admin) external;

    /**
     * @notice Removes an admin from the organization.
     * @param organizationId The ID of the organization.
     * @param admin The address of the admin to remove.
     */
    function removeAdmin(uint256 organizationId, address admin) external;

    /**
     * @notice Removes all admins from the organization.
     * @param organizationId The ID of the organization.
     */
    function removeAllAdmins(uint256 organizationId) external;

    /**
     * @notice Returns all admins for an organization.
     * @param organizationId The ID of the organization.
     * @return admins The addresses of the admins for the organization.
     */
    function getAdmins(
        uint256 organizationId
    ) external view returns (address[] memory);

    /**
     * @notice Checks if an address is an admin for an organization.
     * @param organizationId The ID of the organization.
     * @param admin The address of the admin to check.
     * @return status True if the address is an admin, false otherwise.
     */
    function isAdmin(
        uint256 organizationId,
        address admin
    ) external view returns (bool);
}
