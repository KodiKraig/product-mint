// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {ITokenMetadataProvider} from "../metadata/ITokenMetadataProvider.sol";

/**
 * @title MetadataProvider
 * @notice A base contract for metadata providers
 */
abstract contract MetadataProvider is ITokenMetadataProvider, IERC165 {
    function getTokenMetadata(
        uint256 tokenId
    ) public view virtual returns (string memory);

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == type(ITokenMetadataProvider).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
