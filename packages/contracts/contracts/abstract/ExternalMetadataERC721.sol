// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {ITokenMetadataProvider} from "../metadata/ITokenMetadataProvider.sol";

/**
 * @title ExternalMetadataERC721
 * @notice A base contract for ERC721 tokens that use an external metadata provider.
 *
 * Also included is a batch tokenURI function.
 */
abstract contract ExternalMetadataERC721 is ERC721 {
    /**
     * @notice Emitted when the metadata provider contract is set
     * @param previousProvider The previous metadata provider contract
     * @param newProvider The new metadata provider contract
     */
    event MetadataProviderSet(
        address indexed previousProvider,
        address indexed newProvider
    );

    /**
     * @notice The metadata provider contract
     */
    address public metadataProvider;

    uint256[50] private __gap;

    /**
     * @notice Constructor
     * @param _metadataProvider The metadata provider contract
     */
    constructor(address _metadataProvider) {
        _setMetadataProvider(_metadataProvider);
    }

    /**
     * @notice Get the token metadata
     * @param tokenId The token ID
     * @return The token metadata
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);
        return
            ITokenMetadataProvider(metadataProvider).getTokenMetadata(tokenId);
    }

    /**
     * @notice Get the token metadata for a batch of tokens
     * @dev Be careful when using this function as it can be expensive and return a large amount of data.
     * @param tokenIds The token IDs
     * @return The token metadata
     */
    function tokenURIBatch(
        uint256[] memory tokenIds
    ) public view virtual returns (string[] memory) {
        string[] memory uris = new string[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uris[i] = tokenURI(tokenIds[i]);
        }
        return uris;
    }

    /**
     * @notice Set the metadata provider contract
     * @param _metadataProvider The metadata provider contract
     */
    function _setMetadataProvider(address _metadataProvider) internal {
        require(
            IERC165(_metadataProvider).supportsInterface(
                type(ITokenMetadataProvider).interfaceId
            ),
            "Invalid metadata provider"
        );

        address previousProvider = metadataProvider;

        metadataProvider = _metadataProvider;

        emit MetadataProviderSet(previousProvider, _metadataProvider);
    }
}
