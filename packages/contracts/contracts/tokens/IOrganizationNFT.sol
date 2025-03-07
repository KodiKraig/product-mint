// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

interface IOrganizationNFT {
    /**
     * Minting
     */

    /**
     * @notice Emitted when the mint open status is set.
     * @param mintOpen The new mint open status.
     */
    event MintOpenSet(bool mintOpen);

    /**
     * @notice Returns the mint open status.
     * @return The mint open status. True if the mint is open, else False.
     */
    function mintOpen() external view returns (bool);

    /**
     * @notice Returns the total number of organization NFTs minted.
     * @return The total number of organization NFTs minted.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Mints a new organization NFT.
     * @param to The address to mint the NFT to.
     */
    function mint(address to) external;

    /**
     * @notice Sets the mint open status.
     * @param _mintOpen The new mint open status.
     */
    function setMintOpen(bool _mintOpen) external;

    /**
     * Whitelist Management
     */

    /**
     * @notice Emitted when a whitelisted address is set.
     * @param account The address that is whitelisted.
     * @param isWhitelisted The new whitelisted status.
     */
    event WhitelistedSet(address indexed account, bool isWhitelisted);

    /**
     * @notice Returns the whitelisted status for an address.
     * @param account The address to check the whitelisted status for.
     * @return The whitelisted status. True if the address is whitelisted, else False.
     */
    function whitelisted(address account) external view returns (bool);

    /**
     * @notice Sets the whitelisted addresses.
     * @param _addresses The addresses to set the whitelisted status for.
     * @param _isWhitelisted The new whitelisted statuses for each respective address.
     */
    function setWhitelisted(
        address[] calldata _addresses,
        bool[] calldata _isWhitelisted
    ) external;
}
