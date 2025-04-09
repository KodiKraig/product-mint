// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {MetadataProvider} from "../abstract/MetadataProvider.sol";
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
 * @title PassMetadataProviderV2
 * @notice A metadata provider for product passes.
 * @dev This provider fixes the incorrect metadata problem from v1 by getting the organization for each pass.
 *
 * Organizations can update the metadata for the product passes that they sell.
 *
 * Attributes are dynamically derived from onchain data.
 *
 * We implement the following OpenSea Metadata standard primary metadata properties:
 * - Name
 * - Description
 * - External URL
 * - Image
 * - Background Color
 * - Animation URL
 */
contract PassMetadataProviderV2 is MetadataProvider {
    constructor(
        address _registry,
        address _attributeProvider
    )
        Ownable(_msgSender())
        RegistryEnabled(_registry)
        MetadataProvider(_attributeProvider)
    {}

    /**
     * @dev Get the org that the pass belongs to to get the correct metadata.
     */
    function metadataForToken(
        uint256 tokenId
    ) internal view override returns (string memory) {
        uint256 orgId = IPurchaseRegistry(registry.purchaseRegistry())
            .passOrganization(tokenId);

        return super.metadataForToken(orgId);
    }
}
