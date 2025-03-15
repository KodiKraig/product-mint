// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @title DiscountCalculator
 * @notice Abstract contract for calculating discounts
 */
abstract contract DiscountCalculator {
    /**
     * @dev The denominator for the discount calculation
     */
    function _getDiscountDenominator() internal view virtual returns (uint256) {
        return 10000;
    }

    /**
     * Calculations
     */

    /**
     * @dev Calculates the discount amount on a single amount
     */
    function _calculateDiscountAmount(
        uint256 discount,
        uint256 amount
    ) internal view virtual returns (uint256) {
        return amount - (amount * discount) / _getDiscountDenominator();
    }

    /**
     * Validations
     */

    /**
     * @dev Is the discount valid?
     */
    function _isDiscountValid(
        uint256 discount
    ) internal view virtual returns (bool) {
        return discount > 0 && discount <= _getDiscountDenominator();
    }
}
