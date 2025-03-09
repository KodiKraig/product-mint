// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IOrganizationAdmin} from "./IOrganizationAdmin.sol";

contract OrganizationAdmin is RegistryEnabled, IOrganizationAdmin {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Organization ID => Addresses that can record usages for the organization.
    // Useful for recording usages through an application without having to be the owner of the organization.
    mapping(uint256 => EnumerableSet.AddressSet) private admins;

    constructor(address _contractRegistry) RegistryEnabled(_contractRegistry) {}

    /**
     * Organization Admins
     */

    function addAdmin(
        uint256 organizationId,
        address admin
    ) external onlyOrgOwner(organizationId) {
        require(
            !admins[organizationId].contains(admin),
            "Admin already exists"
        );

        admins[organizationId].add(admin);

        emit OrgAdminUpdate(organizationId, admin, true);
    }

    function removeAdmin(
        uint256 organizationId,
        address admin
    ) external onlyOrgOwner(organizationId) {
        require(admins[organizationId].contains(admin), "Admin not found");

        admins[organizationId].remove(admin);

        emit OrgAdminUpdate(organizationId, admin, false);
    }

    function removeAllAdmins(
        uint256 organizationId
    ) external onlyOrgOwner(organizationId) {
        address[] memory adminsToRemove = admins[organizationId].values();

        for (uint256 i = 0; i < adminsToRemove.length; i++) {
            admins[organizationId].remove(adminsToRemove[i]);

            emit OrgAdminUpdate(organizationId, adminsToRemove[i], false);
        }
    }

    function getAdmins(
        uint256 organizationId
    ) external view returns (address[] memory) {
        return admins[organizationId].values();
    }

    function isAdmin(
        uint256 organizationId,
        address admin
    ) external view returns (bool) {
        return admins[organizationId].contains(admin);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) external pure returns (bool) {
        return
            interfaceId == type(IOrganizationAdmin).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
