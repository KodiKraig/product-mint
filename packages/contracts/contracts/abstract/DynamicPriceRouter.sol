// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import {IDynamicPriceRouter} from "../router/IDynamicPriceRouter.sol";

/**
 * @title DynamicPriceRouter
 * @author ProductMint
 * @notice Abstract contract that provides a base implementation for a dynamic price router
 */
abstract contract DynamicPriceRouter is
    Ownable2Step,
    ERC165,
    IDynamicPriceRouter
{
    constructor() Ownable(_msgSender()) {}

    function getBaseTokenPrice(
        address _baseToken,
        address _quoteToken
    ) external view virtual returns (uint256);

    function getQuoteTokenPrice(
        address _baseToken,
        address _quoteToken
    ) external view virtual returns (uint256);

    function getBaseTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _quoteTokenAmount
    ) external view virtual returns (uint256);

    function getQuoteTokenAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _baseTokenAmount
    ) external view virtual returns (uint256);

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IDynamicPriceRouter).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
