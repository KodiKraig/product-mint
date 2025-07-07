// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import {IUniswapV2DynamicPriceRouter} from "./IUniswapV2DynamicPriceRouter.sol";
import {IDynamicPriceRouter} from "./IDynamicPriceRouter.sol";

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
 * @title UniswapV2DynamicPriceRouter
 * @notice A dynamic price router that uses Uniswap V2 to get the current swap price.
 * @dev The router will calculate the price with fees included or excluded.
 *
 * When removing the fee, if the fee is 0.3% per hop and there are 2 hops, the router will return the price with 0.6% fees removed.
 */
contract UniswapV2DynamicPriceRouter is
    Ownable2Step,
    ERC165,
    IUniswapV2DynamicPriceRouter
{
    // The fee per hop in basis points
    // Fixed for all Uniswap V2 pools
    uint256 public constant FEE_FACTOR = 997;

    // The denominator for the fee
    uint256 public constant FEE_DENOMINATOR = 1000;

    // The denominator for the scaler
    uint256 public constant SCALER_DENOMINATOR = 1000000;

    // The name of the underlying swap router
    string public constant ROUTER_NAME = "uniswap-v2";

    // The Uniswap V2 router used to check swap prices
    address public uniswapV2Router;

    constructor(address _uniswapRouter) Ownable(_msgSender()) {
        _setUniswapV2Router(_uniswapRouter);
    }

    /**
     * IUniswapV2DynamicPriceRouter
     */

    function getPrice(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256) {
        return _getPrice(amountIn, path);
    }

    function getPriceFeesRemoved(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256) {
        uint256 amountOutWithFee = _getPrice(amountIn, path);

        // Remove the fees from the amount out based on the number of hops
        // NOTE: This is a best approximation of the price without fees.

        uint256 feeProduct = FEE_FACTOR;

        // Remove the fee for multiple hops
        for (uint256 i = 1; i < path.length - 1; i++) {
            feeProduct = (feeProduct * FEE_FACTOR) / FEE_DENOMINATOR;
        }

        uint256 feeFreeScaler = (SCALER_DENOMINATOR * FEE_DENOMINATOR) /
            feeProduct;

        return (amountOutWithFee * feeFreeScaler) / SCALER_DENOMINATOR;
    }

    function _getPrice(
        uint256 amountIn,
        address[] calldata path
    ) internal view returns (uint256) {
        _checkAmountIn(amountIn);
        _checkPath(path);

        (bool success, bytes memory result) = uniswapV2Router.staticcall(
            // equals to getAmountsOut(uint,address[])
            abi.encodeWithSelector(0xd06ca61f, amountIn, path)
        );
        require(success, "Failed to get price from dex");

        uint256 amountOutWithFee = abi.decode(result, (uint256[]))[
            path.length - 1
        ];

        _checkOutputAmount(amountOutWithFee);

        return amountOutWithFee;
    }

    /**
     * Checks
     */

    function _checkPath(address[] calldata _path) internal pure {
        require(_path.length > 1, "Path must have at least 2 tokens");
    }

    function _checkAmountIn(uint256 _amountIn) internal pure {
        require(_amountIn > 0, "Amount in must be greater than zero");
    }

    function _checkOutputAmount(uint256 _amount) internal pure {
        require(_amount > 0, "Invalid amount out from Uniswap");
    }

    /**
     * Update the Uniswap V2 router address
     */

    /**
     * @notice Emitted when the Uniswap V2 router address is updated.
     * @param uniswapRouter The new Uniswap V2 router address
     */
    event UniswapV2RouterSet(address indexed uniswapRouter);

    /**
     * @notice Update the Uniswap V2 router address
     * @param _uniswapRouter The new Uniswap V2 router address
     */
    function setUniswapV2Router(address _uniswapRouter) external onlyOwner {
        _setUniswapV2Router(_uniswapRouter);
    }

    function _setUniswapV2Router(address _uniswapRouter) internal {
        require(
            _uniswapRouter != address(0),
            "Uniswap router cannot be zero address"
        );

        uniswapV2Router = _uniswapRouter;

        emit UniswapV2RouterSet(_uniswapRouter);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IUniswapV2DynamicPriceRouter).interfaceId ||
            interfaceId == type(IDynamicPriceRouter).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
