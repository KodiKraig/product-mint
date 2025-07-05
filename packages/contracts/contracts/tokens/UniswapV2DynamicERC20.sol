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

import {
    IUniswapV2DynamicPriceRouter
} from "../router/IUniswapV2DynamicPriceRouter.sol";
import {IDynamicERC20} from "../tokens/IDynamicERC20.sol";

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
contract UniswapV2DynamicERC20 is ERC20, ERC165, Ownable2Step, IDynamicERC20 {
    // Token used for payment
    address public immutable baseToken;

    // Token used for price targeting
    address public immutable quoteToken;

    // Path used to convert the base token to the quote token
    address[] internal baseToQuotePath;

    // Path used to convert the quote token to the base token
    address[] internal quoteToBasePath;

    // Dynamic price router to interact with Uniswap V2
    IUniswapV2DynamicPriceRouter public dynamicPriceRouter;

    constructor(
        string memory _name,
        string memory _symbol,
        address _baseToken,
        address _quoteToken,
        address[] memory _baseToQuotePath,
        address[] memory _quoteToBasePath,
        address _dynamicPriceRouter
    ) ERC20(_name, _symbol) Ownable(_msgSender()) {
        require(_baseToken != address(0), "Base token cannot be zero address");
        require(
            _quoteToken != address(0),
            "Quote token cannot be zero address"
        );
        require(
            _baseToken != _quoteToken,
            "Base and quote token cannot be the same"
        );

        baseToken = _baseToken;
        quoteToken = _quoteToken;

        _setBaseToQuotePath(_baseToQuotePath);
        _setQuoteToBasePath(_quoteToBasePath);

        _setDynamicPriceRouter(_dynamicPriceRouter);
    }

    /**
     * IDynamicERC20
     */

    function routerName() external view returns (string memory) {
        return dynamicPriceRouter.ROUTER_NAME();
    }

    function routerAddress() external view returns (address) {
        return address(dynamicPriceRouter);
    }

    function getBaseTokenPrice() external view returns (uint256) {
        return _getQuoteTokenAmount(10 ** IERC20Metadata(baseToken).decimals());
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
        return dynamicPriceRouter.getPriceWithoutFees(_amount, quoteToBasePath);
    }

    function _getQuoteTokenAmount(
        uint256 _amount
    ) internal view returns (uint256) {
        if (_amount == 0) return 0;
        return dynamicPriceRouter.getPriceWithoutFees(_amount, baseToQuotePath);
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
     * Base to quote
     */

    /**
     * @dev Emitted when the base to quote path is set
     */
    event BaseToQuotePathSet(address[] _baseToQuotePath);

    function getBaseToQuotePath() external view returns (address[] memory) {
        return baseToQuotePath;
    }

    function setBaseToQuotePath(
        address[] calldata _baseToQuotePath
    ) external onlyOwner {
        _setBaseToQuotePath(_baseToQuotePath);
    }

    function _setBaseToQuotePath(address[] memory _baseToQuotePath) internal {
        require(
            _baseToQuotePath.length > 1,
            "Path must have at least 2 tokens"
        );
        require(
            _baseToQuotePath[0] == baseToken,
            "Base token must be first in path"
        );
        require(
            _baseToQuotePath[_baseToQuotePath.length - 1] == quoteToken,
            "Quote token must be last in path"
        );

        baseToQuotePath = _baseToQuotePath;

        emit BaseToQuotePathSet(_baseToQuotePath);
    }

    /**
     * Quote to base
     */

    /**
     * @dev Emitted when the quote to base path is set
     */
    event QuoteToBasePathSet(address[] _quoteToBasePath);

    function getQuoteToBasePath() external view returns (address[] memory) {
        return quoteToBasePath;
    }

    function setQuoteToBasePath(
        address[] calldata _quoteToBasePath
    ) external onlyOwner {
        _setQuoteToBasePath(_quoteToBasePath);
    }

    function _setQuoteToBasePath(address[] memory _quoteToBasePath) internal {
        require(
            _quoteToBasePath.length > 1,
            "Path must have at least 2 tokens"
        );
        require(
            _quoteToBasePath[0] == quoteToken,
            "Quote token must be first in path"
        );
        require(
            _quoteToBasePath[_quoteToBasePath.length - 1] == baseToken,
            "Base token must be last in path"
        );

        quoteToBasePath = _quoteToBasePath;

        emit QuoteToBasePathSet(_quoteToBasePath);
    }

    /**
     * Dynamic price router updates
     */

    /**
     * @dev Emitted when the dynamic price router is set
     */
    event DynamicPriceRouterSet(address _dynamicPriceRouter);

    function setDynamicPriceRouter(
        address _dynamicPriceRouter
    ) external onlyOwner {
        _setDynamicPriceRouter(_dynamicPriceRouter);
    }

    function _setDynamicPriceRouter(address _dynamicPriceRouter) internal {
        require(
            IERC165(_dynamicPriceRouter).supportsInterface(
                type(IUniswapV2DynamicPriceRouter).interfaceId
            ),
            "Invalid dynamic price router"
        );

        dynamicPriceRouter = IUniswapV2DynamicPriceRouter(_dynamicPriceRouter);

        emit DynamicPriceRouterSet(_dynamicPriceRouter);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IDynamicERC20).interfaceId ||
            interfaceId == type(IERC20).interfaceId ||
            interfaceId == type(IERC20Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
