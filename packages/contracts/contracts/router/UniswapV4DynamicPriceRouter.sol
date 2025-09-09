// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IDynamicPriceRouter} from "./IDynamicPriceRouter.sol";
import {IUniswapV4DynamicPriceRouter} from "./IUniswapV4DynamicPriceRouter.sol";
import {ICustomUniswapV4Router} from "./ICustomUniswapV4Router.sol";

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
 * @title UniswapV4DynamicPriceRouter
 * @notice A dynamic price router that uses Uniswap V4 to get the current swap price.
 * @dev The router will calculate the price with fees included or excluded.
 * Assumes no custom hook data or price limits for simplicity. Fees are approximated.
 */
contract UniswapV4DynamicPriceRouter is
    Ownable2Step,
    ERC165,
    IUniswapV4DynamicPriceRouter
{
    // Larger denominator for the fee in basis points
    uint256 public constant FEE_DENOMINATOR = 1000000;

    // Larger denominator for the scaler
    uint256 public constant SCALER_DENOMINATOR = 1000000;

    // The name of the underlying swap router
    string public constant ROUTER_NAME = "uniswap-v4";

    // The Uniswap V4 Quoter address used to check swap prices
    address public v4Quoter;

    constructor(address _v4Quoter) Ownable(_msgSender()) {
        _setV4Quoter(_v4Quoter);
    }

    /**
     * Pricing
     */

    function getPrice(
        ICustomUniswapV4Router.QuoteExactParams calldata params
    ) external returns (uint256) {
        return _getPrice(params);
    }

    function getPriceFeesRemoved(
        ICustomUniswapV4Router.QuoteExactParams calldata params
    ) external returns (uint256) {
        uint256 amountOutWithFee = _getPrice(params);

        // Remove the fees from the amount out based on the number of fees
        // NOTE: This is a best approximation of the price without fees.

        uint256 feeProduct = _getFeeMinusDenominator(params.path[0].fee);

        // Remove the fee for multiple hops (loop only if >1 hop; optimized for small arrays)
        for (uint8 i = 1; i < params.path.length; i++) {
            feeProduct =
                (feeProduct * _getFeeMinusDenominator(params.path[i].fee)) /
                FEE_DENOMINATOR;
        }

        uint256 feeFreeScaler = (SCALER_DENOMINATOR * FEE_DENOMINATOR) /
            feeProduct;

        return (amountOutWithFee * feeFreeScaler) / SCALER_DENOMINATOR;
    }

    function _getPrice(
        ICustomUniswapV4Router.QuoteExactParams calldata params
    ) internal returns (uint256) {
        _checkPath(params.path);
        _checkAmountIn(params.exactAmount);

        (uint256 amountOutWithFee, ) = ICustomUniswapV4Router(v4Quoter)
            .quoteExactInput(params);

        _checkOutputAmount(amountOutWithFee);

        return amountOutWithFee;
    }

    /**
     * Checks
     */

    function _checkPath(
        ICustomUniswapV4Router.PathKey[] calldata _keys
    ) internal pure {
        require(_keys.length > 0, "Path cannot be empty");
    }

    function _checkAmountIn(uint128 _amountIn) internal pure {
        require(_amountIn > 0, "Amount in must be greater than zero");
    }

    function _checkOutputAmount(uint256 _amount) internal pure {
        require(_amount > 0, "Invalid amount out from Uniswap");
    }

    /**
     * Fees
     */

    function _getFeeMinusDenominator(
        uint24 fee
    ) internal pure returns (uint256) {
        unchecked {
            return FEE_DENOMINATOR - fee;
        }
    }

    /**
     * Update the Uniswap V4 quoter address
     */

    /**
     * @notice Emitted when the Uniswap V4 quoter address is updated.
     * @param v4Quoter The new Uniswap V4 quoter address
     */
    event V4QuoterSet(address indexed v4Quoter);

    function setV4Quoter(address _v4Quoter) external onlyOwner {
        _setV4Quoter(_v4Quoter);
    }

    function _setV4Quoter(address _v4Quoter) internal {
        require(_v4Quoter != address(0), "V4 quoter cannot be zero address");

        v4Quoter = _v4Quoter;

        emit V4QuoterSet(_v4Quoter);
    }

    /**
     * ERC165
     */

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            interfaceId == type(IUniswapV4DynamicPriceRouter).interfaceId ||
            interfaceId == type(IDynamicPriceRouter).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
