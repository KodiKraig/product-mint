// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

/**
 * @title ITokenMetadataProvider
 * @notice An interface for token metadata providers
 */
interface ITokenMetadataProvider {
    /**
     * @notice Get the token metadata
     * @param tokenId The token ID
     * @return The token metadata
     */
    function getTokenMetadata(
        uint256 tokenId
    ) external view returns (string memory);
}
