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
 * Only owners can grant and revoke permissions.
 *
 * All permissions are derived from the PermissionFactory contract.
 */
contract PermissionRegistry is
    RegistryEnabled,
    Ownable2Step,
    IPermissionRegistry,
    IERC165
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // Organization ID => Owner => Permissions
    mapping(uint256 => mapping(address => EnumerableSet.Bytes32Set))
        private permissions;

    IPermissionFactory private permissionFactory;

    constructor(
        address _registry,
        address _permissionFactory
    ) RegistryEnabled(_registry) Ownable(_msgSender()) {
        _setPermissionFactory(_permissionFactory);
    }

    /**
     * @dev View permissions
     */

    function hasPermission(
        uint256 _orgId,
        address _owner,
        bytes32 _permission
    ) external view activePermission(_permission) returns (bool) {
        return permissions[_orgId][_owner].contains(_permission);
    }

    function hasPermissions(
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
        EnumerableSet.Bytes32Set storage _orgPermissions = permissions[_orgId][
            _owner
        ];
        for (uint256 i = 0; i < _permissions.length; i++) {
            _hasPermissions[i] = _orgPermissions.contains(_permissions[i]);
        }
    }

    function ownerPermissions(
        uint256 _orgId,
        address _owner
    ) public view returns (bytes32[] memory) {
        return permissions[_orgId][_owner].values();
    }

    function ownerPermissionsBatch(
        uint256[] memory _orgIds,
        address[] memory _owners
    ) external view returns (bytes32[][] memory _permissions) {
        _permissions = new bytes32[][](_owners.length);
        for (uint256 i = 0; i < _owners.length; i++) {
            _permissions[i] = ownerPermissions(_orgIds[i], _owners[i]);
        }
    }

    /**
     * @dev Grant and revoke permissions
     */

    function addPermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external activePermissions(_permissions) {
        _orgOwner(_orgId);
        address _owner = _msgSender();
        for (uint256 i = 0; i < _permissions.length; i++) {
            permissions[_orgId][_owner].add(_permissions[i]);
        }
    }

    function removePermissions(
        uint256 _orgId,
        bytes32[] memory _permissions
    ) external activePermissions(_permissions) {
        _orgOwner(_orgId);
        address _owner = _msgSender();
        for (uint256 i = 0; i < _permissions.length; i++) {
            permissions[_orgId][_owner].remove(_permissions[i]);
        }
    }

    /**
     * @dev Admin functions
     */

    function adminUpdatePermissions(
        AdminPermissionSetterParams[] memory _params
    ) external onlyOwner {
        AdminPermissionSetterParams memory _param;
        for (uint256 i = 0; i < _params.length; i++) {
            _param = _params[i];

            for (uint256 j = 0; j < _param.permissions.length; j++) {
                _assertActivePermission(_param.permissions[j]);

                if (_param.grantAccess) {
                    permissions[_param.orgId][_param.owner].add(
                        _param.permissions[j]
                    );
                } else {
                    permissions[_param.orgId][_param.owner].remove(
                        _param.permissions[j]
                    );
                }
            }
        }
    }

    function adminGrantAllPermissions() external onlyOwner {
        // This contract was deployed after the core system as an upgrade
        // Backfill permissions for all current pass owners

        address _owner;
        EnumerableSet.Bytes32Set storage _permissions;
        bytes32[] memory _allPermissions = permissionFactory
            .getAllPermissionIds();
        uint256 _totalPassSupply = IPurchaseManager(registry.purchaseManager())
            .passSupply();

        for (uint256 i = 1; i <= _totalPassSupply; i++) {
            _owner = _passOwner(i);
            _permissions = permissions[
                IPurchaseRegistry(registry.purchaseRegistry()).passOrganization(
                    i
                )
            ][_owner];

            for (uint256 j = 0; j < _allPermissions.length; j++) {
                if (permissionFactory.isPermissionActive(_allPermissions[j])) {
                    _permissions.add(_allPermissions[j]);
                }
            }
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
            "Permission factory does not support IPermissionFactory interface"
        );
        permissionFactory = IPermissionFactory(_permissionFactory);
    }

    /**
     * @dev Assertions
     */

    function _assertActivePermission(bytes32 _permission) internal view {
        if (!permissionFactory.isPermissionActive(_permission)) {
            revert InactivePermission(_permission);
        }
    }

    /**
     * @dev Modifiers
     */

    modifier activePermission(bytes32 _permission) {
        _assertActivePermission(_permission);
        _;
    }

    modifier activePermissions(bytes32[] memory _permissions) {
        require(_permissions.length > 0, "No permissions provided");
        for (uint256 i = 0; i < _permissions.length; i++) {
            _assertActivePermission(_permissions[i]);
        }
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
