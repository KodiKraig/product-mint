// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

interface ISubscriptionTransferOracle {
    function isTransferable(
        uint256 productPassId,
        uint256[] calldata productIds
    ) external view returns (bool);
}
