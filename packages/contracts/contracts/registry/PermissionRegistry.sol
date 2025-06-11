// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPermissionRegistry} from "./IPermissionRegistry.sol";
import {IPurchaseRegistry} from "./IPurchaseRegistry.sol";
import {IPurchaseManager} from "../manager/IPurchaseManager.sol";
import {IPermissionFactory} from "../permission/IPermissionFactory.sol";
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
 * @title PermissionRegistry
 * @notice The PermissionRegistry is responsible for managing permissions for users and organizations.
 *
 * Permissions are used to control access to various features of the system giving pass owners full control
 * over how organizations can charge their wallet for products and subscriptions minted on Product Passes.
 *
 * Only owners can grant and revoke their own permissions.
 *
 * All permissions are derived from the PermissionFactory contract.
 *
 * Organizations can add additional permissions that get granted to the pass owner during the pass minting process.
 *
 * Organizations can optionally exclude granting default permissions during the pass minting process.
 * NOTE: If the org has excluded default permissions, subscriptions will not be able to be renewed without
 * the pass owner adding the permissions back in themselves.
 */
contract PermissionRegistry is
    RegistryEnabled,
    Ownable2Step,
    IPermissionRegistry,
    IERC165
{
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using PermissionUtils for string;

    // Organization ID => Owner => Permission IDs
    mapping(uint256 => mapping(address => EnumerableSet.Bytes32Set))
        private ownerPermissions;

    // Organization ID => Permission IDs
    mapping(uint256 => EnumerableSet.Bytes32Set) private orgPermissions;

    // Organization ID => Exclude default permissions for org during initial purchase?
    mapping(uint256 => bool) public excludeDefaultPermissions;

    // Organization ID => Pass Owner => Have initial owner org permissions been set for the org?
    mapping(uint256 => mapping(address => bool)) public ownerPermissionsSet;

    IPermissionFactory public permissionFactory;

    constructor(
        address _registry,
        address _permissionFactory
    ) RegistryEnabled(_registry) Ownable(_msgSender()) {
        _setPermissionFactory(_permissionFactory);
    }

    /**
     * @dev View owner permissions
     */

    function hasOwnerPermission(
        uint256 _orgId,
        address _owner,
        bytes32 _permission
    ) external view activePermission(_permission) returns (bool) {
        return ownerPermissions[_orgId][_owner].contains(_permission);
    }

    function hasOwnerPermissionBatch(
        uint256 _orgId,
        address _owner,
        bytes32[] memory _permissions
    )
        external
        view
        activePermissions(_permissions)
        returns (bool[] memory _hasPermissions)
    {
        _hasPermissions = new bool[](_permissions.length);

        EnumerableSet.Bytes32Set storage _orgPermissions = ownerPermissions[
            _orgId
        ][_owner];

        for (uint256 i = 0; i < _permissions.length; i++) {
            _hasPermissions[i] = _orgPermissions.contains(_permissions[i]);
        }
    }

    function getOwnerPermissions(
        uint256 _orgId,
        address _owner
    ) public view returns (bytes32[] memory) {
        return ownerPermissions[_orgId][_owner].values();
    }

    function getOwnerPermissionsBatch(
        uint256[] memory _orgIds,
        address[] memory _owners
    ) external view returns (bytes32[][] memory _permissions) {
        require(_orgIds.length > 0, "No orgIds provided");
        require(_orgIds.length == _owners.length, "Invalid input length");

        _permissions = new bytes32[][](_owners.length);

        for (uint256 i = 0; i < _owners.length; i++) {
            _permissions[i] = getOwnerPermissions(_orgIds[i], _owners[i]);
        }
    }

    /**
     * @dev Grant and revoke owner permissions
     */

    function addOwnerPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external {
        _orgOwner(_orgId);

        _addOwnerPermissions(_orgId, _msgSender(), _permissions);
    }

    function removeOwnerPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external {
        _orgOwner(_orgId);

        _removeOwnerPermissions(_orgId, _msgSender(), _permissions);
    }

    function _addOwnerPermissions(
        uint256 _orgId,
        address _owner,
        bytes32[] memory _permissions
    ) internal {
        _checkActivePermissionBatch(_permissions);

        for (uint256 i = 0; i < _permissions.length; i++) {
            ownerPermissions[_orgId][_owner].add(_permissions[i]);
        }

        emit OwnerPermissionsUpdated(_orgId, _owner, true, _permissions);
    }

    function _removeOwnerPermissions(
        uint256 _orgId,
        address _owner,
        bytes32[] memory _permissions
    ) internal {
        _checkPermissionsProvided(_permissions);

        for (uint256 i = 0; i < _permissions.length; i++) {
            ownerPermissions[_orgId][_owner].remove(_permissions[i]);
        }

        emit OwnerPermissionsUpdated(_orgId, _owner, false, _permissions);
    }

    /**
     * @dev Organization permissions
     */

    function setExcludeDefaultPermissions(
        uint256 _orgId,
        bool _exclude
    ) external onlyOrgAdmin(_orgId) {
        excludeDefaultPermissions[_orgId] = _exclude;

        emit ExcludeDefaultPermissionsUpdated(_orgId, _exclude);
    }

    function getOrgPermissions(
        uint256 _orgId
    ) external view returns (bytes32[] memory) {
        return orgPermissions[_orgId].values();
    }

    function updateOrgPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions,
        bool[] memory _add
    ) external onlyOrgAdmin(_orgId) activePermissions(_permissions) {
        require(_permissions.length == _add.length, "Invalid input length");

        for (uint256 i = 0; i < _permissions.length; i++) {
            if (_add[i]) {
                orgPermissions[_orgId].add(_permissions[i]);

                emit OrgPermissionUpdated(_orgId, _permissions[i], true);
            } else {
                orgPermissions[_orgId].remove(_permissions[i]);

                emit OrgPermissionUpdated(_orgId, _permissions[i], false);
            }
        }
    }

    function grantInitialOwnerPermissions(
        uint256 _orgId,
        address _owner
    ) external onlyRegistry(registry.purchaseManager()) {
        _grantInitialOwnerPermissions(_orgId, _owner);
    }

    function _grantInitialOwnerPermissions(
        uint256 _orgId,
        address _owner
    ) internal {
        if (ownerPermissionsSet[_orgId][_owner]) {
            // Will only be set once per owner per org
            return;
        } else {
            ownerPermissionsSet[_orgId][_owner] = true;
        }

        // Set default permissions if not excluded by org
        if (!excludeDefaultPermissions[_orgId]) {
            bytes32[] memory _defaultPermissions = permissionFactory
                .getDefaultPermissionIds();

            _addOwnerPermissions(_orgId, _owner, _defaultPermissions);
        }

        // Set any additional initial org permissions
        if (orgPermissions[_orgId].length() > 0) {
            _addOwnerPermissions(
                _orgId,
                _owner,
                orgPermissions[_orgId].values()
            );
        }
    }

    /**
     * @dev Admin functions
     */

    function adminUpdateOwnerPermissions(
        AdminPermissionParams[] calldata _params
    ) external onlyOwner {
        require(_params.length > 0, "No params provided");

        AdminPermissionParams calldata _param;

        for (uint256 i = 0; i < _params.length; i++) {
            _param = _params[i];

            if (_param.grantAccess) {
                _addOwnerPermissions(
                    _param.orgId,
                    _param.owner,
                    _param.permissions
                );
            } else {
                _removeOwnerPermissions(
                    _param.orgId,
                    _param.owner,
                    _param.permissions
                );
            }
        }
    }

    function adminGrantInitialOwnerPermissions(
        uint256[] calldata _passIds
    ) external onlyOwner {
        require(_passIds.length > 0, "No passIds provided");

        uint256 _passId;

        for (uint256 i = 0; i < _passIds.length; i++) {
            _passId = _passIds[i];

            _grantInitialOwnerPermissions(
                IPurchaseRegistry(registry.purchaseRegistry()).passOrganization(
                    _passId
                ),
                _passOwner(_passId)
            );
        }
    }

    function setPermissionFactory(
        address _permissionFactory
    ) external onlyOwner {
        _setPermissionFactory(_permissionFactory);
    }

    function _setPermissionFactory(address _permissionFactory) internal {
        require(
            IERC165(_permissionFactory).supportsInterface(
                type(IPermissionFactory).interfaceId
            ),
            "Invalid permission factory"
        );
        permissionFactory = IPermissionFactory(_permissionFactory);
    }

    /**
     * @dev Checks
     */

    function _checkActivePermission(bytes32 _permission) internal view {
        if (!permissionFactory.isPermissionActive(_permission)) {
            revert InactivePermission(_permission);
        }
    }

    function _checkActivePermissionBatch(
        bytes32[] memory _permissions
    ) internal view {
        _checkPermissionsProvided(_permissions);

        if (!permissionFactory.isPermissionActiveBatch(_permissions)) {
            revert InactivePermissionBatch(_permissions);
        }
    }

    function _checkPermissionsProvided(
        bytes32[] memory _permissions
    ) internal pure {
        require(_permissions.length > 0, "No permissions provided");
    }

    /**
     * @dev Modifiers
     */

    modifier activePermission(bytes32 _permission) {
        _checkActivePermission(_permission);
        _;
    }

    modifier activePermissions(bytes32[] memory _permissions) {
        _checkActivePermissionBatch(_permissions);
        _;
    }

    /**
     * @dev ERC165
     */

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return
            interfaceId == type(IPermissionRegistry).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
