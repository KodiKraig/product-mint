// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {IDynamicERC20} from "../tokens/IDynamicERC20.sol";

// contract UniswapV3DynamicERC20 is ERC20, ERC165, Ownable2Step, IDynamicERC20 {
//     // Token used for payment
//     address public immutable baseToken;

//     // Token used for price targeting
//     address public immutable quoteToken;

//     // Path used to convert the base token to the quote token
// }
