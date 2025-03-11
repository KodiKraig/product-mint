// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title MintToken
 * @notice A test token that can be minted and used for testing.
 *
 * THIS IS NOT OUR OFFICIAL TOKEN.
 *
 * If we end up doing a token drop in the future, we will deploy a new contract.
 * This token can be used for testing purposes and can be minted by anyone.
 */
contract MintToken is ERC20, IERC165 {
    constructor() ERC20("MintToken", "MINT") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public pure override returns (bool) {
        return
            interfaceId == type(IERC165).interfaceId ||
            interfaceId == type(IERC20).interfaceId;
    }
}
