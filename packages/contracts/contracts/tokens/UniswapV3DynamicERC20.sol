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
    bytes public baseToQuotePathEncoded;

    // Path used to convert the quote token to the base token
    bytes public quoteToBasePathEncoded;

    // Fees for each pool in the base to quote path
    IUniswapV3DynamicPriceRouter.Fee[] private baseToQuoteFees;

    // Fees for each pool in the quote to base path
    IUniswapV3DynamicPriceRouter.Fee[] private quoteToBaseFees;

    constructor(
        string memory _name,
        string memory _symbol,
        address _baseToken,
        address _quoteToken,
        address _dynamicPriceRouter,
        address[] memory _baseToQuotePath,
        address[] memory _quoteToBasePath,
        IUniswapV3DynamicPriceRouter.Fee[] memory _baseToQuoteFees,
        IUniswapV3DynamicPriceRouter.Fee[] memory _quoteToBaseFees
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
        return
            IUniswapV3DynamicPriceRouter(dynamicPriceRouter)
                .getPriceFeesRemoved(
                    amount,
                    quoteToBasePathEncoded,
                    quoteToBaseFees
                );
    }

    function _getQuoteTokenAmount(uint256 amount) internal returns (uint256) {
        if (amount == 0) return 0;
        return
            IUniswapV3DynamicPriceRouter(dynamicPriceRouter)
                .getPriceFeesRemoved(
                    amount,
                    baseToQuotePathEncoded,
                    baseToQuoteFees
                );
    }

    /**
     * Base to quote path
     */

    function getBaseToQuoteFees()
        external
        view
        returns (IUniswapV3DynamicPriceRouter.Fee[] memory)
    {
        return baseToQuoteFees;
    }

    /**
     * @notice Emitted when the base to quote path is set
     * @param dynamicERC20 The address of the current dynamic ERC20 contract
     * @param baseToken The address of the base token
     * @param quoteToken The address of the quote token
     * @param path The path used to convert the base token to the quote token
     * @param pathEncoded The encoded path
     * @param fees The fees for each pool in the path
     */
    event UniswapV3BaseToQuotePathSet(
        address indexed dynamicERC20,
        address indexed baseToken,
        address indexed quoteToken,
        address[] path,
        bytes pathEncoded,
        IUniswapV3DynamicPriceRouter.Fee[] fees
    );

    function setBaseToQuotePath(
        address[] memory _path,
        IUniswapV3DynamicPriceRouter.Fee[] memory _fees
    ) external onlyOwner {
        _setBaseToQuotePath(_path, _fees);
    }

    function _setBaseToQuotePath(
        address[] memory _path,
        IUniswapV3DynamicPriceRouter.Fee[] memory _fees
    ) internal {
        _checkBaseToQuotePath(_path);
        _checkFees(_path, _fees);

        bytes memory pathEncoded = _encodePath(_path, _fees);
        baseToQuotePathEncoded = pathEncoded;
        baseToQuotePath = _path;
        baseToQuoteFees = _fees;

        emit UniswapV3BaseToQuotePathSet(
            address(this),
            baseToken,
            quoteToken,
            _path,
            pathEncoded,
            _fees
        );
    }

    /**
     * Quote to base path
     */

    function getQuoteToBaseFees()
        external
        view
        returns (IUniswapV3DynamicPriceRouter.Fee[] memory)
    {
        return quoteToBaseFees;
    }

    /**
     * @notice Emitted when the quote to base path is set
     * @param dynamicERC20 The address of the current dynamic ERC20 contract
     * @param baseToken The address of the base token
     * @param quoteToken The address of the quote token
     * @param path The path used to convert the quote token to the base token
     * @param pathEncoded The encoded path
     * @param fees The fees for each pool in the path
     */
    event UniswapV3QuoteToBasePathSet(
        address indexed dynamicERC20,
        address indexed baseToken,
        address indexed quoteToken,
        address[] path,
        bytes pathEncoded,
        IUniswapV3DynamicPriceRouter.Fee[] fees
    );

    function setQuoteToBasePath(
        address[] memory _path,
        IUniswapV3DynamicPriceRouter.Fee[] memory _fees
    ) external onlyOwner {
        _setQuoteToBasePath(_path, _fees);
    }

    function _setQuoteToBasePath(
        address[] memory _path,
        IUniswapV3DynamicPriceRouter.Fee[] memory _fees
    ) internal {
        _checkQuoteToBasePath(_path);
        _checkFees(_path, _fees);

        bytes memory pathEncoded = _encodePath(_path, _fees);
        quoteToBasePathEncoded = pathEncoded;
        quoteToBasePath = _path;
        quoteToBaseFees = _fees;

        emit UniswapV3QuoteToBasePathSet(
            address(this),
            baseToken,
            quoteToken,
            _path,
            pathEncoded,
            _fees
        );
    }

    /**
     * Path updates
     */

    /**
     * @dev Error when attempting to set an invalid path
     */
    error InvalidPath(address[] _path);

    function _encodePath(
        address[] memory _path,
        IUniswapV3DynamicPriceRouter.Fee[] memory _fees
    ) internal returns (bytes memory pathEncoded) {
        IUniswapV3DynamicPriceRouter _router = IUniswapV3DynamicPriceRouter(
            dynamicPriceRouter
        );

        for (uint256 i = 0; i < _path.length - 1; i++) {
            pathEncoded = abi.encodePacked(
                pathEncoded,
                _path[i],
                uint24(_router.getFee(_fees[i]))
            );
        }

        pathEncoded = abi.encodePacked(pathEncoded, _path[_path.length - 1]);

        try
            _router.getPriceFeesRemoved(
                10 ** IERC20Metadata(_path[0]).decimals(),
                pathEncoded,
                _fees
            )
        {} catch {
            revert InvalidPath(_path);
        }
    }

    function _checkFees(
        address[] memory _path,
        IUniswapV3DynamicPriceRouter.Fee[] memory _fees
    ) internal pure {
        require(
            _fees.length == _path.length - 1,
            "Fees length must match hops"
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
