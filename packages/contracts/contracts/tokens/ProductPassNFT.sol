// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

import {ExternalMetadataERC721} from "../abstract/ExternalMetadataERC721.sol";
import {IProductPassNFT} from "./IProductPassNFT.sol";
import {IProductTransferOracle} from "../oracle/IProductTransferOracle.sol";
import {
    ISubscriptionTransferOracle
} from "../oracle/ISubscriptionTransferOracle.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";
import {IPurchaseRegistry} from "../registry/IPurchaseRegistry.sol";

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
 * @title ProductPassNFT
 * @notice A contract for minting product passes.
 *
 * A product pass is minted to a user when they purchase product(s) from an organization using the ProductMint system.
 *
 * Additional products can be added to the pass after mint.
 *
 * Products cannot be duplicated in a pass.
 *
 * TRANSFERABILITY:
 * The organization can set the products that are allowed to be transferred.
 * If a pass contains any products that are not allowed to be transferred, the pass is not transferable.
 * If the pass contains products with subscriptions, the subscriptions must be paused before the pass can be transferred.
 */
contract ProductPassNFT is
    ExternalMetadataERC721,
    Ownable2Step,
    RegistryEnabled,
    IProductPassNFT
{
    constructor(
        address _contractRegistry,
        address _metadataProvider
    )
        Ownable(_msgSender())
        ExternalMetadataERC721(_metadataProvider)
        ERC721("ProductMint Product Pass NFT", "PASS")
        RegistryEnabled(_contractRegistry)
    {}

    function mint(
        address to,
        uint256 tokenId
    ) external onlyRegistry(registry.purchaseManager()) {
        _safeMint(to, tokenId);
    }

    /**
     * Overrides
     */

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        // Always allow transfers for minting
        if (_ownerOf(tokenId) != address(0)) {
            uint256[] memory productIds = IPurchaseRegistry(
                registry.purchaseRegistry()
            ).getPassProductIds(tokenId);

            if (
                !IProductTransferOracle(registry.productTransferOracle())
                    .isTransferable(productIds)
            ) {
                revert ProductsNotTransferable();
            }

            if (
                !ISubscriptionTransferOracle(
                    registry.subscriptionTransferOracle()
                ).isTransferable(tokenId, productIds)
            ) {
                revert SubscriptionsNotTransferable();
            }
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * Metadata
     */

    function setMetadataProvider(address _metadataProvider) external onlyOwner {
        _setMetadataProvider(_metadataProvider);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721) returns (bool) {
        return
            interfaceId == type(IProductPassNFT).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
