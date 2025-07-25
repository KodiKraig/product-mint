// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {
    IUniswapV2DynamicPriceRouter
} from "../router/IUniswapV2DynamicPriceRouter.sol";
import {DynamicERC20} from "../abstract/DynamicERC20.sol";

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
 * @title UniswapV2DynamicERC20
 * @notice A dynamic ERC20 token that uses Uniswap V2 to get the current swap price.
 * @dev A UniswapV2DynamicERC20 cannot be minted, burned, or transferred
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
contract UniswapV2DynamicERC20 is DynamicERC20, Ownable2Step {
    constructor(
        string memory _name,
        string memory _symbol,
        address _baseToken,
        address _quoteToken,
        address _dynamicPriceRouter,
        address[] memory _baseToQuotePath,
        address[] memory _quoteToBasePath
    )
        DynamicERC20(
            _name,
            _symbol,
            _baseToken,
            _quoteToken,
            _dynamicPriceRouter
        )
        Ownable(_msgSender())
    {
        _setBaseToQuotePath(_baseToQuotePath);
        _setQuoteToBasePath(_quoteToBasePath);
    }

    /**
     * IDynamicERC20
     */

    function getBaseTokenPrice() external view returns (uint256) {
        return _getQuoteTokenAmount(10 ** IERC20Metadata(baseToken).decimals());
    }

    function balanceOfQuote(address _account) external view returns (uint256) {
        return _getQuoteTokenAmount(IERC20(baseToken).balanceOf(_account));
    }

    function allowanceQuote(
        address owner,
        address spender
    ) external view returns (uint256) {
        return
            _getQuoteTokenAmount(IERC20(baseToken).allowance(owner, spender));
    }

    function getBaseTokenAmount(
        uint256 quoteTokenAmount
    ) external view returns (address, uint256) {
        return (baseToken, _getBaseTokenAmount(quoteTokenAmount));
    }

    function getQuoteTokenAmount(
        uint256 baseTokenAmount
    ) external view returns (address, uint256) {
        return (quoteToken, _getQuoteTokenAmount(baseTokenAmount));
    }

    function _getBaseTokenAmount(
        uint256 amount
    ) internal view returns (uint256) {
        if (amount == 0) return 0;
        return
            IUniswapV2DynamicPriceRouter(dynamicPriceRouter)
                .getPriceFeesRemoved(amount, quoteToBasePath);
    }

    function _getQuoteTokenAmount(
        uint256 amount
    ) internal view returns (uint256) {
        if (amount == 0) return 0;
        return
            IUniswapV2DynamicPriceRouter(dynamicPriceRouter)
                .getPriceFeesRemoved(amount, baseToQuotePath);
    }

    /**
     * Base to quote path
     */

    /**
     * @notice Emitted when the base to quote path is set
     * @param dynamicERC20 The address of the current dynamic ERC20 contract
     * @param baseToken The address of the base token
     * @param quoteToken The address of the quote token
     * @param baseToQuotePath The path used to convert the base token to the quote token
     */
    event UniswapV2BaseToQuotePathSet(
        address indexed dynamicERC20,
        address indexed baseToken,
        address indexed quoteToken,
        address[] baseToQuotePath
    );

    function setBaseToQuotePath(
        address[] calldata _baseToQuotePath
    ) external onlyOwner {
        _setBaseToQuotePath(_baseToQuotePath);
    }

    function _setBaseToQuotePath(address[] memory _baseToQuotePath) internal {
        _checkBaseToQuotePath(_baseToQuotePath);
        _checkPriceValid(_baseToQuotePath);

        baseToQuotePath = _baseToQuotePath;

        emit UniswapV2BaseToQuotePathSet(
            address(this),
            baseToken,
            quoteToken,
            _baseToQuotePath
        );
    }

    /**
     * Quote to base path
     */

    /**
     * @notice Emitted when the quote to base path is set
     * @param dynamicERC20 The address of the current dynamic ERC20 contract
     * @param quoteToBasePath The path used to convert the quote token to the base token
     */
    event UniswapV2QuoteToBasePathSet(
        address indexed dynamicERC20,
        address indexed baseToken,
        address indexed quoteToken,
        address[] quoteToBasePath
    );

    function setQuoteToBasePath(
        address[] calldata _quoteToBasePath
    ) external onlyOwner {
        _setQuoteToBasePath(_quoteToBasePath);
    }

    function _setQuoteToBasePath(address[] memory _quoteToBasePath) internal {
        _checkQuoteToBasePath(_quoteToBasePath);
        _checkPriceValid(_quoteToBasePath);

        quoteToBasePath = _quoteToBasePath;

        emit UniswapV2QuoteToBasePathSet(
            address(this),
            baseToken,
            quoteToken,
            _quoteToBasePath
        );
    }

    /**
     * Path updates
     */

    /**
     * @dev Error when attempting to set an invalid path
     */
    error InvalidPath(address[] _path);

    function _checkPriceValid(address[] memory _path) internal view {
        try
            IUniswapV2DynamicPriceRouter(dynamicPriceRouter)
                .getPriceFeesRemoved(
                    10 ** IERC20Metadata(_path[0]).decimals(),
                    _path
                )
        {} catch {
            revert InvalidPath(_path);
        }
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
                type(IUniswapV2DynamicPriceRouter).interfaceId
            ),
            "Does not implement IUniswapV2DynamicPriceRouter"
        );

        super._setDynamicPriceRouter(_dynamicPriceRouter);
    }
}
