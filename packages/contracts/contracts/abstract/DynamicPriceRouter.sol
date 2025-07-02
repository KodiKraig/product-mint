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

    /**
     * IDynamicPriceRouter
     */

    function routerName() external view virtual returns (string memory);

    function getBaseTokenPrice(
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

    /**
     * Checks
     */

    function _checkTokenAddresses(
        address _baseToken,
        address _quoteToken
    ) internal pure {
        require(
            _baseToken != address(0) && _quoteToken != address(0),
            "Invalid token address"
        );
        require(_baseToken != _quoteToken, "Base and quote tokens must differ");
    }

    function _checkTokenAddressesAmount(
        address _baseToken,
        address _quoteToken,
        uint256 _amount
    ) internal pure {
        _checkTokenAddresses(_baseToken, _quoteToken);
        _checkInputAmount(_amount);
    }

    function _checkInputAmount(uint256 _amountIn) internal pure {
        require(_amountIn > 0, "Amount in must be greater than 0");
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == type(IDynamicPriceRouter).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
