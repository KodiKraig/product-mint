// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {MetadataProvider} from "../abstract/MetadataProvider.sol";
import {RegistryEnabled} from "../abstract/RegistryEnabled.sol";

contract PassMetadataProvider is RegistryEnabled, MetadataProvider {
    using Strings for uint256;

    constructor(address _registry) RegistryEnabled(_registry) {}

    function getTokenMetadata(
        uint256 tokenId
    ) public pure override returns (string memory) {
        return string.concat(tokenId.toString(), "TODO");
    }
}
