// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IAttributeProvider {
    /**
     * @notice Returns the attributes for a token used when generating the token metadata.
     * @param tokenId The ID of the token.
     * @return attributes The attributes for the token.
     */
    function attributesForToken(
        uint256 tokenId
    ) external view returns (string memory);
}
