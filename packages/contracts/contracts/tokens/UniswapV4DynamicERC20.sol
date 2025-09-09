// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import {DynamicERC20} from "../abstract/DynamicERC20.sol";
import {
    IUniswapV4DynamicPriceRouter
} from "../router/IUniswapV4DynamicPriceRouter.sol";
import {
    ICustomUniswapV4Router,
    IHooks
} from "../router/ICustomUniswapV4Router.sol";

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
 * @title UniswapV4DynamicERC20
 * @notice A dynamic ERC20 token that uses Uniswap V4 to get the current swap price.
 * @dev A UniswapV4DynamicERC20 cannot be minted, burned, or transferred
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
contract UniswapV4DynamicERC20 is DynamicERC20, Ownable2Step {
    // Path keys used to convert the base token to the quote token
    ICustomUniswapV4Router.PathKey[] private baseToQuotePathKeys;

    // Path keys used to convert the quote token to the base token
    ICustomUniswapV4Router.PathKey[] private quoteToBasePathKeys;

    // Fees for each pool from Uniswap V4
    struct Fee {
        uint24 fee;
        int24 tickSpacing;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _baseToken,
        address _quoteToken,
        address _dynamicPriceRouter,
        address[] memory _baseToQuotePath,
        address[] memory _quoteToBasePath,
        Fee[] memory _baseToQuoteFees,
        Fee[] memory _quoteToBaseFees
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
        _setBaseToQuotePath(_baseToQuotePath, _baseToQuoteFees);
        _setQuoteToBasePath(_quoteToBasePath, _quoteToBaseFees);
    }

    /**
     * IDynamicERC20
     */

    function getBaseTokenPrice() external returns (uint256) {
        return _getQuoteTokenAmount(10 ** IERC20Metadata(baseToken).decimals());
    }

    function balanceOfQuote(address account) external returns (uint256) {
        return _getQuoteTokenAmount(IERC20(baseToken).balanceOf(account));
    }

    function allowanceQuote(
        address owner,
        address spender
    ) external returns (uint256) {
        return
            _getQuoteTokenAmount(IERC20(baseToken).allowance(owner, spender));
    }

    function getBaseTokenAmount(
        uint256 quoteTokenAmount
    ) external returns (address, uint256) {
        return (baseToken, _getBaseTokenAmount(quoteTokenAmount));
    }

    function getQuoteTokenAmount(
        uint256 baseTokenAmount
    ) external returns (address, uint256) {
        return (quoteToken, _getQuoteTokenAmount(baseTokenAmount));
    }

    function _getBaseTokenAmount(uint256 amount) internal returns (uint256) {
        if (amount == 0) return 0;

        IUniswapV4DynamicPriceRouter router = IUniswapV4DynamicPriceRouter(
            dynamicPriceRouter
        );

        return
            router.getPriceFeesRemoved(
                ICustomUniswapV4Router.QuoteExactParams({
                    exactCurrency: ICustomUniswapV4Router.Currency.wrap(
                        quoteToken
                    ),
                    path: quoteToBasePathKeys,
                    exactAmount: uint128(amount)
                })
            );
    }

    function _getQuoteTokenAmount(uint256 amount) internal returns (uint256) {
        if (amount == 0) return 0;

        IUniswapV4DynamicPriceRouter router = IUniswapV4DynamicPriceRouter(
            dynamicPriceRouter
        );

        return
            router.getPriceFeesRemoved(
                ICustomUniswapV4Router.QuoteExactParams({
                    exactCurrency: ICustomUniswapV4Router.Currency.wrap(
                        baseToken
                    ),
                    path: baseToQuotePathKeys,
                    exactAmount: uint128(amount)
                })
            );
    }

    /**
     * Base to quote path
     */

    /**
     * @notice Emitted when the base to quote path is set
     * @param dynamicERC20 The address of the current dynamic ERC20 contract
     * @param baseToken The address of the base token
     * @param quoteToken The address of the quote token
     * @param path The path used to convert the base token to the quote token
     * @param pathKeys The path keys used to convert the base token to the quote token
     */
    event UniswapV4BaseToQuotePathSet(
        address indexed dynamicERC20,
        address indexed baseToken,
        address indexed quoteToken,
        address[] path,
        ICustomUniswapV4Router.PathKey[] pathKeys
    );

    function getBaseToQuotePathKeys()
        external
        view
        returns (ICustomUniswapV4Router.PathKey[] memory)
    {
        return baseToQuotePathKeys;
    }

    function setBaseToQuotePath(
        address[] memory _path,
        Fee[] memory _fees
    ) external onlyOwner {
        _setBaseToQuotePath(_path, _fees);
    }

    function _setBaseToQuotePath(
        address[] memory _path,
        Fee[] memory _fees
    ) internal {
        _checkBaseToQuotePath(_path);

        ICustomUniswapV4Router.PathKey[] memory keys = _generatePathKeys(
            _path,
            _fees
        );

        delete baseToQuotePathKeys;
        delete baseToQuotePath;

        for (uint256 i = 0; i < keys.length; i++) {
            baseToQuotePathKeys.push(keys[i]);
        }
        baseToQuotePath = _path;

        emit UniswapV4BaseToQuotePathSet(
            address(this),
            baseToken,
            quoteToken,
            baseToQuotePath,
            baseToQuotePathKeys
        );
    }

    /**
     * @notice Emitted when the quote to base path is set
     * @param dynamicERC20 The address of the current dynamic ERC20 contract
     * @param baseToken The address of the base token
     * @param quoteToken The address of the quote token
     * @param path The path used to convert the quote token to the base token
     * @param pathKeys The path keys used to convert the quote token to the base token
     */
    event UniswapV4QuoteToBasePathSet(
        address indexed dynamicERC20,
        address indexed baseToken,
        address indexed quoteToken,
        address[] path,
        ICustomUniswapV4Router.PathKey[] pathKeys
    );

    function getQuoteToBasePathKeys()
        external
        view
        returns (ICustomUniswapV4Router.PathKey[] memory)
    {
        return quoteToBasePathKeys;
    }

    function setQuoteToBasePath(
        address[] memory _path,
        Fee[] memory _fees
    ) external onlyOwner {
        _setQuoteToBasePath(_path, _fees);
    }

    function _setQuoteToBasePath(
        address[] memory _path,
        Fee[] memory _fees
    ) internal {
        _checkQuoteToBasePath(_path);

        ICustomUniswapV4Router.PathKey[] memory keys = _generatePathKeys(
            _path,
            _fees
        );

        delete quoteToBasePathKeys;
        delete quoteToBasePath;

        for (uint256 i = 0; i < keys.length; i++) {
            quoteToBasePathKeys.push(keys[i]);
        }
        quoteToBasePath = _path;

        emit UniswapV4QuoteToBasePathSet(
            address(this),
            baseToken,
            quoteToken,
            quoteToBasePath,
            quoteToBasePathKeys
        );
    }

    /**
     * Path updates
     */

    /**
     * @dev Error when attempting to set an invalid path
     */
    error InvalidPath(address[] _path, Fee[] _fees);

    function _generatePathKeys(
        address[] memory _path,
        Fee[] memory _fees
    ) internal returns (ICustomUniswapV4Router.PathKey[] memory pathKeys) {
        _checkFees(_path, _fees);

        pathKeys = new ICustomUniswapV4Router.PathKey[](_fees.length);

        for (uint256 i = 0; i < _fees.length; i++) {
            pathKeys[i] = ICustomUniswapV4Router.PathKey({
                intermediateCurrency: ICustomUniswapV4Router.Currency.wrap(
                    _path[i + 1]
                ),
                fee: _fees[i].fee,
                tickSpacing: _fees[i].tickSpacing,
                hooks: IHooks(address(0)),
                hookData: ""
            });
        }

        ICustomUniswapV4Router.QuoteExactParams
            memory params = ICustomUniswapV4Router.QuoteExactParams({
                exactCurrency: ICustomUniswapV4Router.Currency.wrap(_path[0]),
                path: pathKeys,
                exactAmount: uint128(10 ** IERC20Metadata(_path[0]).decimals())
            });

        try
            IUniswapV4DynamicPriceRouter(dynamicPriceRouter)
                .getPriceFeesRemoved(params)
        {} catch {
            revert InvalidPath(_path, _fees);
        }
    }

    function _checkFees(
        address[] memory _path,
        Fee[] memory _fees
    ) internal pure {
        require(
            _fees.length == _path.length - 1,
            "Fees must be provided for all hops"
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
                type(IUniswapV4DynamicPriceRouter).interfaceId
            ),
            "Does not implement IUniswapV4DynamicPriceRouter"
        );

        super._setDynamicPriceRouter(_dynamicPriceRouter);
    }
}
