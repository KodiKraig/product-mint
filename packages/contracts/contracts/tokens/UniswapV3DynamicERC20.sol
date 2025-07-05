// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {DynamicERC20} from "../abstract/DynamicERC20.sol";
import {
    IUniswapV3DynamicPriceRouter
} from "../router/IUniswapV3DynamicPriceRouter.sol";

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
 * @title UniswapV3DynamicERC20
 * @notice A dynamic ERC20 token that uses Uniswap V3 to get the current swap price.
 * @dev A UniswapV3DynamicERC20 cannot be minted, burned, or transferred
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
contract UniswapV3DynamicERC20 is DynamicERC20, Ownable2Step {
    // Path used to convert the base token to the quote token
    bytes internal baseToQuotePathEncoded;

    // Path used to convert the quote token to the base token
    bytes internal quoteToBasePathEncoded;

    // Fees for each pool in the base to quote path
    IUniswapV3DynamicPriceRouter.Fee[] internal baseToQuoteFees;

    // Fees for each pool in the quote to base path
    IUniswapV3DynamicPriceRouter.Fee[] internal quoteToBaseFees;

    constructor(
        string memory _name,
        string memory _symbol,
        address _baseToken,
        address _quoteToken,
        address _dynamicPriceRouter
    )
        ERC20(_name, _symbol)
        DynamicERC20(_baseToken, _quoteToken, _dynamicPriceRouter)
        Ownable(_msgSender())
    {
        // TODO: Implement paths and fees
    }

    /**
     * IDynamicERC20
     */

    function getBaseTokenPrice() external returns (uint256) {
        return _getQuoteTokenAmount(10 ** IERC20Metadata(baseToken).decimals());
    }

    function getBaseTokenAmount(
        uint256 _quoteTokenAmount
    ) external returns (address, uint256) {
        return (baseToken, _getBaseTokenAmount(_quoteTokenAmount));
    }

    function getQuoteTokenAmount(
        uint256 _baseTokenAmount
    ) external returns (address, uint256) {
        return (quoteToken, _getQuoteTokenAmount(_baseTokenAmount));
    }

    function _getBaseTokenAmount(uint256 _amount) internal returns (uint256) {
        if (_amount == 0) return 0;
        return
            IUniswapV3DynamicPriceRouter(dynamicPriceRouter)
                .getPriceFeesRemoved(
                    _amount,
                    quoteToBasePathEncoded,
                    quoteToBaseFees
                );
    }

    function _getQuoteTokenAmount(uint256 _amount) internal returns (uint256) {
        if (_amount == 0) return 0;
        return
            IUniswapV3DynamicPriceRouter(dynamicPriceRouter)
                .getPriceFeesRemoved(
                    _amount,
                    baseToQuotePathEncoded,
                    baseToQuoteFees
                );
    }

    /**
     * Dynamic price router updates
     */

    function setDynamicPriceRouter(
        address _dynamicPriceRouter
    ) external onlyOwner {
        _setDynamicPriceRouter(_dynamicPriceRouter);
    }

    function _setDynamicPriceRouter(
        address _dynamicPriceRouter
    ) internal override {
        require(
            IERC165(_dynamicPriceRouter).supportsInterface(
                type(IUniswapV3DynamicPriceRouter).interfaceId
            ),
            "Does not implement IUniswapV3DynamicPriceRouter"
        );

        super._setDynamicPriceRouter(_dynamicPriceRouter);
    }
}
