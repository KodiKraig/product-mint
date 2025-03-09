// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IProductTransferOracle {
    function isTransferable(
        uint256[] calldata productIds
    ) external view returns (bool);
}
