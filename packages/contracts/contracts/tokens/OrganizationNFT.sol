// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import {IOrganizationNFT} from "./IOrganizationNFT.sol";
import {ExternalMetadataERC721} from "../abstract/ExternalMetadataERC721.sol";

/*
 ____                 _            _   __  __ _       _   
|  _ \ _ __ ___   __| |_   _  ___| |_|  \/  (_)_ __ | |_ 
| |_) | '__/ _ \ / _` | | | |/ __| __| |\/| | | '_ \| __|
|  __/| | | (_) | (_| | |_| | (__| |_| |  | | | | | | |_ 
|_|   |_|  \___/ \__,_|\__,_|\___|\__|_|  |_|_|_| |_|\__|
*/

/**
 * @title OrganizationNFT
 * @notice A contract for minting Organization NFTs.
 * An organization is required to create products to be minted by users.
 */
contract OrganizationNFT is
    ExternalMetadataERC721,
    AccessControl,
    IOrganizationNFT
{
    // Whether the mint is open
    bool public mintOpen;

    // Address => is address whitelisted?
    mapping(address => bool) public whitelisted;

    // Total number of tokens minted
    uint256 public totalSupply;

    // Role for the whitelist management
    bytes32 public constant WHITELIST_ROLE = keccak256("WHITELIST_ROLE");

    constructor(
        address _metadataProvider
    )
        ExternalMetadataERC721(_metadataProvider)
        ERC721("ProductMint Organization NFT", "ORG")
        AccessControl()
    {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(WHITELIST_ROLE, _msgSender());
    }

    /**
     * Minting
     */

    function mint(address to) external {
        require(mintOpen || whitelisted[_msgSender()], "Mint is not open");

        totalSupply++;

        _safeMint(to, totalSupply);
    }

    function setMintOpen(bool _mintOpen) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintOpen = _mintOpen;

        emit MintOpenSet(_mintOpen);
    }

    /**
     * Whitelist Management
     */

    function setWhitelisted(
        address[] calldata _addresses,
        bool[] calldata _isWhitelisted
    ) external onlyRole(WHITELIST_ROLE) {
        require(_addresses.length > 0, "No addresses provided");
        require(
            _addresses.length == _isWhitelisted.length,
            "Invalid input length"
        );
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelisted[_addresses[i]] = _isWhitelisted[i];

            emit WhitelistedSet(_addresses[i], _isWhitelisted[i]);
        }
    }

    /**
     * Metadata
     */

    function setMetadataProvider(
        address _metadataProvider
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setMetadataProvider(_metadataProvider);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, AccessControl) returns (bool) {
        return
            interfaceId == type(IOrganizationNFT).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
