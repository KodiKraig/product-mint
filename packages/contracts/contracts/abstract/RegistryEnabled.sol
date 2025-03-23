// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import {IContractRegistry} from "../registry/IContractRegistry.sol";
import {IOrganizationAdmin} from "../admin/IOrganizationAdmin.sol";

/**
 * @title RegistryEnabled
 * @notice A base contract for contracts that use the central registry to interact with other contracts within the ProductMint system.
 */
abstract contract RegistryEnabled is Context {
    /**
     * @notice The registry contract
     */
    IContractRegistry public registry;

    uint256[50] private __gap;

    constructor(address _registry) {
        registry = IContractRegistry(_registry);
    }

    // Registry

    modifier onlyRegistry(address expectedContract) {
        _checkRegistry(expectedContract);
        _;
    }

    function _checkRegistry(address expectedContract) internal view {
        require(_msgSender() == expectedContract, "Caller not authorized");
    }

    // Org Admin

    modifier onlyOrgAdmin(uint256 organizationId) {
        _checkOrgAdmin(organizationId);
        _;
    }

    function _isOrgAdmin(uint256 organizationId) internal view returns (bool) {
        return _isOrgAdminAddress(organizationId, _msgSender());
    }

    function _isOrgAdminAddress(
        uint256 organizationId,
        address orgAdmin
    ) internal view returns (bool) {
        return
            _isOrgOwnerAddress(organizationId, orgAdmin) ||
            IOrganizationAdmin(registry.orgAdmin()).isAdmin(
                organizationId,
                orgAdmin
            );
    }

    function _checkOrgAdmin(uint256 organizationId) internal view {
        require(
            _isOrgAdmin(organizationId),
            "Not an admin of the organization"
        );
    }

    // Product Pass NFT

    modifier onlyPassOwner(uint256 _productPassId) {
        _checkPassOwner(_productPassId);
        _;
    }

    function _checkPassOwner(uint256 _productPassId) internal view {
        require(
            _isPassOwner(_productPassId),
            "Not the owner of the ProductPassNFT"
        );
    }

    function _isPassOwner(uint256 _productPassId) internal view returns (bool) {
        return _passOwner(_productPassId) == _msgSender();
    }

    function _passOwner(
        uint256 _productPassId
    ) internal view returns (address) {
        return IERC721(registry.productPassNFT()).ownerOf(_productPassId);
    }

    // Organization NFT

    modifier onlyOrgOwner(uint256 organizationId) {
        _checkOrgOwner(organizationId);
        _;
    }

    function _checkOrgOwner(uint256 organizationId) internal view {
        require(
            _isOrgOwner(organizationId),
            "Not the owner of the OrganizationNFT"
        );
    }

    function _isOrgOwner(uint256 organizationId) internal view returns (bool) {
        return _isOrgOwnerAddress(organizationId, _msgSender());
    }

    function _isOrgOwnerAddress(
        uint256 organizationId,
        address orgOwner
    ) internal view returns (bool) {
        return _orgOwner(organizationId) == orgOwner;
    }

    function _orgOwner(uint256 organizationId) internal view returns (address) {
        return IERC721(registry.organizationNFT()).ownerOf(organizationId);
    }
}
