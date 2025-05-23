// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {MetadataProvider} from "../abstract/MetadataProvider.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";

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
 * @title OrganizationMetadataProvider
 * @notice A metadata provider for organizations within the ProductMint ecosystem.
 *
 * Organizations can update the metadata for their organization NFT.
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
contract OrganizationMetadataProvider is MetadataProvider {
    constructor(
        address _registry,
        address _attributeProvider
    )
        Ownable(_msgSender())
        RegistryEnabled(_registry)
        MetadataProvider(_attributeProvider)
    {}
}
