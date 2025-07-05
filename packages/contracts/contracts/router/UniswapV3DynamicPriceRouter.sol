// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IDynamicPriceRouter} from "./IDynamicPriceRouter.sol";
import {IUniswapV3DynamicPriceRouter} from "./IUniswapV3DynamicPriceRouter.sol";
import {ICustomUniswapV3Router} from "./ICustomUniswapV3Router.sol";

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
 * @title UniswapV3DynamicPriceRouter
 * @notice A dynamic price router that uses Uniswap V3 to get the current swap price.
 * @dev The router will calculate the price with fees included or excluded.
 *
 * For example, if the fee is 0.3% for one hop and 0.5% for the other, the router will return the price with 0.8% fees removed.
 * In order to get the price without fees, you must pass the total fee across all pools in the path.
 *
 * The router dynamically calculates the price without fees based on the fees passed in.
 */
contract UniswapV3DynamicPriceRouter is
    Ownable2Step,
    ERC165,
    IUniswapV3DynamicPriceRouter
{
    // The Uniswap V3 router used to check swap prices
    ICustomUniswapV3Router public uniswapV3Router;

    // Larger denominator for the fee in basis points
    uint256 public constant FEE_DENOMINATOR = 1000000;

    // Larger denominator for the scaler
    uint256 public constant SCALER_DENOMINATOR = 1000000;

    // The name of the router
    string public constant ROUTER_NAME = "uniswap-v3";

    constructor(address _uniswapRouter) Ownable(_msgSender()) {
        _setUniswapV3Router(_uniswapRouter);
    }

    /**
     * IDynamicPriceRouter
     */

    function getPrice(
        uint256 _amountIn,
        bytes calldata _path
    ) external returns (uint256) {
        return _getPrice(_amountIn, _path);
    }

    function getPriceFeesRemoved(
        uint256 _amountIn,
        bytes calldata _path,
        Fee[] calldata _fees
    ) external returns (uint256) {
        _checkFees(_fees);

        uint256 amountOutWithFee = _getPrice(_amountIn, _path);

        // Remove the fees from the amount out based on the number of fees
        // NOTE: This is a best approximation of the price without fees.

        uint256 feeProduct = _getFeeMinusDenominator(_fees[0]);

        // Remove the fee for multiple hops
        for (uint256 i = 1; i < _fees.length; i++) {
            feeProduct =
                (feeProduct * _getFeeMinusDenominator(_fees[i])) /
                FEE_DENOMINATOR;
        }

        uint256 feeFreeScaler = (SCALER_DENOMINATOR * FEE_DENOMINATOR) /
            feeProduct;

        return (amountOutWithFee * feeFreeScaler) / SCALER_DENOMINATOR;
    }

    function _getPrice(
        uint256 _amountIn,
        bytes calldata _path
    ) internal returns (uint256) {
        _checkPath(_path);
        _checkAmountIn(_amountIn);

        (uint256 amountOutWithFee, , , ) = uniswapV3Router.quoteExactInput(
            _path,
            _amountIn
        );

        _checkOutputAmount(amountOutWithFee);

        return amountOutWithFee;
    }

    /**
     * Checks
     */

    function _checkPath(bytes memory _path) internal pure {
        require(_path.length > 0, "Path cannot be empty");
    }

    function _checkAmountIn(uint256 _amountIn) internal pure {
        require(_amountIn > 0, "Amount in must be greater than zero");
    }

    function _checkOutputAmount(uint256 _amount) internal pure {
        require(_amount > 0, "Invalid amount out from Uniswap");
    }

    function _checkFees(Fee[] calldata _fees) internal pure {
        require(_fees.length > 0, "Fees cannot be empty");
    }

    /**
     * Fees
     */

    function getFee(Fee _fee) external pure returns (uint256) {
        return FEE_DENOMINATOR - _getFeeMinusDenominator(_fee);
    }

    function _getFeeMinusDenominator(Fee _fee) internal pure returns (uint256) {
        if (_fee == Fee.LOWEST_001) {
            return 999900;
        } else if (_fee == Fee.LOW_005) {
            return 999500;
        } else if (_fee == Fee.MEDIUM_03) {
            return 997000;
        } else if (_fee == Fee.HIGH_1) {
            return 990000;
        } else {
            revert("Invalid fee");
        }
    }

    /**
     * Update the Uniswap V3 router address
     */

    /**
     * @notice Emitted when the Uniswap V3 router address is updated.
     * @param _uniswapRouter The new Uniswap V3 router address
     */
    event UniswapV3RouterSet(address indexed _uniswapRouter);

    function setUniswapV3Router(address _uniswapRouter) external onlyOwner {
        _setUniswapV3Router(_uniswapRouter);
    }

    function _setUniswapV3Router(address _uniswapRouter) internal {
        require(
            _uniswapRouter != address(0),
            "Uniswap router cannot be zero address"
        );

        uniswapV3Router = ICustomUniswapV3Router(_uniswapRouter);

        emit UniswapV3RouterSet(_uniswapRouter);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IUniswapV3DynamicPriceRouter).interfaceId ||
            interfaceId == type(IDynamicPriceRouter).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
