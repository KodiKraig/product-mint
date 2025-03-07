// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

interface IProductPassNFT {
    /**
     * Revert when attempting to transfer a product pass with products that are not transferable.
     */
    error ProductsNotTransferable();

    /**
     * Revert when attempting to transfer a product pass with subscriptions that are not transferable.
     */
    error SubscriptionsNotTransferable();

    /**
     * Mint a product pass to an address.
     * @dev Only the purchase manager can mint a product pass.
     * @param to The address to mint the product pass to.
     * @param tokenId The token ID of the product pass to mint.
     */
    function mint(address to, uint256 tokenId) external;
}
