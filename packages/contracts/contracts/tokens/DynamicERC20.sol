// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";

import {IDynamicERC20} from "./IDynamicERC20.sol";
import {IDynamicPriceRouter} from "../router/IDynamicPriceRouter.sol";

/*
 ____                 _            _   __  __ _       _   
|  _ \ _ __ ___   __| |_   _  ___| |_|  \/  (_)_ __ | |_ 
| |_) | '__/ _ \ / _` | | | |/ __| __| |\/| | | '_ \| __|
|  __/| | | (_) | (_| | |_| | (__| |_| |  | | | | | | |_ 
|_|   |_|  \___/ \__,_|\__,_|\___|\__|_|  |_|_|_| |_|\__|
 
 NFT based payment system to mint products onchain with one-time payments and 
 recurring permissionless subscriptions.

 https://productmint.io
*/

/**
 * @title DynamicERC20
 * @notice A dynamic ERC20 token is composed of a base token and a quote token.
 * @dev A DynamicERC20 cannot be minted, burned, or transferred
 *
 * Used within the ProductMint system to act as a proxy for the base token against the quote token.
 * The base token is used to charge for payment.
 * The quote token is used for price targeting.
 * A dynamic price router is used to get the current swap price at a dex such as Uniswap.
 *
 * For example, assume the base token is WETH and the quote token is USDC.
 * An organization can use the DynamicERC20 to create a pricing model that targets a price of 100 USDC.
 * Then, when a user purchases a product, 100 USDC worth of WETH will be transferred to the organization.
 */
contract DynamicERC20 is ERC20, ERC165, Ownable2Step, IDynamicERC20 {
    // The token used for payment
    address public immutable baseToken;

    // The token used for price targeting
    address public immutable quoteToken;

    // The router used to get the current swap prices
    IDynamicPriceRouter public dynamicPriceRouter;

    constructor(
        string memory _name,
        string memory _symbol,
        address _baseToken,
        address _quoteToken,
        address _dynamicPriceRouter
    ) ERC20(_name, _symbol) Ownable(_msgSender()) {
        require(
            _baseToken != address(0) && _quoteToken != address(0),
            "Tokens cannot be zero address"
        );
        require(
            _baseToken != _quoteToken,
            "Base and quote token cannot be the same"
        );

        baseToken = _baseToken;
        quoteToken = _quoteToken;
        _setDynamicPriceRouter(_dynamicPriceRouter);
    }

    /**
     * Router pricing
     */

    function getBaseTokenPrice() external view returns (uint256) {
        return dynamicPriceRouter.getBaseTokenPrice(baseToken, quoteToken);
    }

    function getBaseTokenAmount(
        uint256 _quoteTokenAmount
    ) external view returns (address, uint256) {
        return (baseToken, _getBaseTokenAmount(_quoteTokenAmount));
    }

    function getQuoteTokenAmount(
        uint256 _baseTokenAmount
    ) external view returns (address, uint256) {
        return (quoteToken, _getQuoteTokenAmount(_baseTokenAmount));
    }

    function _getBaseTokenAmount(
        uint256 _amount
    ) internal view returns (uint256) {
        if (_amount == 0) return 0;
        return
            dynamicPriceRouter.getBaseTokenAmount(
                baseToken,
                quoteToken,
                _amount
            );
    }

    function _getQuoteTokenAmount(
        uint256 _amount
    ) internal view returns (uint256) {
        if (_amount == 0) return 0;
        return
            dynamicPriceRouter.getQuoteTokenAmount(
                baseToken,
                quoteToken,
                _amount
            );
    }

    /**
     * ERC20 view overrides
     */

    function totalSupply() public view override returns (uint256) {
        return IERC20(baseToken).totalSupply();
    }

    function decimals() public view override returns (uint8) {
        return IERC20Metadata(quoteToken).decimals();
    }

    function allowance(
        address owner,
        address spender
    ) public view override returns (uint256) {
        return
            _getQuoteTokenAmount(IERC20(baseToken).allowance(owner, spender));
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _getQuoteTokenAmount(IERC20(baseToken).balanceOf(account));
    }

    /**
     * @dev State changing functions are not allowed
     */

    error TransferNotAllowed();
    error ApproveNotAllowed();

    function transfer(address, uint256) public pure override returns (bool) {
        revert TransferNotAllowed();
    }

    function transferFrom(
        address,
        address,
        uint256
    ) public pure override returns (bool) {
        revert TransferNotAllowed();
    }

    function approve(address, uint256) public pure override returns (bool) {
        revert ApproveNotAllowed();
    }

    /**
     * Update the dynamic price router
     */

    event DynamicPriceRouterUpdated(address indexed _dynamicPriceRouter);

    function setDynamicPriceRouter(
        address _dynamicPriceRouter
    ) external onlyOwner {
        _setDynamicPriceRouter(_dynamicPriceRouter);
    }

    function _setDynamicPriceRouter(address _dynamicPriceRouter) internal {
        require(
            IERC165(_dynamicPriceRouter).supportsInterface(
                type(IDynamicPriceRouter).interfaceId
            ),
            "Invalid dynamic price router"
        );

        dynamicPriceRouter = IDynamicPriceRouter(_dynamicPriceRouter);

        emit DynamicPriceRouterUpdated(_dynamicPriceRouter);
    }

    /**
     * ERC165 interface support
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IERC20).interfaceId ||
            interfaceId == type(IDynamicERC20).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
