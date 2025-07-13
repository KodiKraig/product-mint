// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

interface IDynamicPriceRouter {
    /**
     * @notice Get the name of the underlying price router.
     * @return The name of the underlying price router. i.e. "uniswap-v2" or "uniswap-v3"
     */
    function ROUTER_NAME() external view returns (string memory);
}
