// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

/**
 * @title ITokenMetadataProvider
 * @notice An interface for token metadata providers to provide metadata for ERC721 tokens.
 */
interface ITokenMetadataProvider {
    /**
     * @notice Get the token metadata for a given token ID.
     * @param tokenId The token ID
     * @return The token metadata as a JSON string
     */
    function getTokenMetadata(
        uint256 tokenId
    ) external view returns (string memory);
}
