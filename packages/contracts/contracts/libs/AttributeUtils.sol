// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @notice Utility library for converting values to Metadata attributes.
 */
library AttributeUtils {
    using Strings for uint256;

    /**
     * Strings
     */

    /**
     * @notice Convert a string value to a Metadata attribute.
     *
     * Format:
     * { 'trait_type': '<TRAIT TYPE>', 'value': '<VALUE>' }
     *
     * @param value The string value to convert.
     * @param traitType The trait type of the attribute.
     * @return The attribute as a string.
     */
    function attributeTraitType(
        string memory value,
        string memory traitType
    ) internal pure returns (string memory) {
        return
            string.concat(
                '{"trait_type": "',
                traitType,
                '", "value": "',
                value,
                '"}'
            );
    }

    /**
     * @notice Convert a string value to a key-value pair.
     * @dev Will return "null" if the value is an empty string.
     *
     * Format:
     * { '<KEY>': '<VALUE>' }
     *
     * @param value The string value to convert.
     * @param key The key of the attribute.
     * @return The attribute as a string.
     */
    function keyValue(
        string memory value,
        string memory key
    ) internal pure returns (string memory) {
        string memory initial = string.concat('"', key, '": ');

        if (bytes(value).length == 0) {
            return string.concat(initial, "null");
        }

        return string.concat(initial, '"', value, '"');
    }

    /**
     * Booleans
     */

    /**
     * @notice Convert a boolean value to a string with "True" or "False".
     * @param value The boolean value to convert.
     * @return The string value of the boolean.
     */
    function stringify(bool value) internal pure returns (string memory) {
        return value ? "True" : "False";
    }

    /**
     * @notice Convert a boolean value to a Metadata attribute.
     *
     * Format:
     * { 'trait_type': '<TRAIT TYPE>', 'value': 'True' or 'False' }
     *
     * @param value The boolean value to convert.
     * @param traitType The trait type of the attribute.
     * @return The attribute as a string.
     */
    function attributeTraitType(
        bool value,
        string memory traitType
    ) internal pure returns (string memory) {
        return attributeTraitType(stringify(value), traitType);
    }

    /**
     * Numbers
     */

    /**
     * @notice Convert a uint256 value to a Metadata attribute and preserve the numeric value.
     *
     * Format:
     * { 'trait_type': '<TRAIT TYPE>', 'value': '<VALUE>' }
     *
     * @param value The uint256 value to convert.
     * @param traitType The trait type of the attribute.
     * @return The attribute as a string.
     */
    function attributeTraitType(
        uint256 value,
        string memory traitType
    ) internal pure returns (string memory) {
        return
            string.concat(
                '{"trait_type": "',
                traitType,
                '", "value": ',
                value.toString(),
                "}"
            );
    }

    /**
     * @notice Convert a uint256 value to a Metadata attribute and display "No Limit" if the value is 0.
     *
     * Format:
     * { 'trait_type': '<TRAIT TYPE>', 'value': '<VALUE>' }
     *
     * @param value The uint256 value to convert.
     * @param traitType The trait type of the attribute.
     * @return The attribute as a string.
     */
    function noLimitAttributeTraitType(
        uint256 value,
        string memory traitType
    ) internal pure returns (string memory) {
        return
            attributeTraitType(
                value == 0 ? "No Limit" : value.toString(),
                traitType
            );
    }

    /**
     * @notice Convert a uint256 value to a percentage string.
     * @param value The uint256 value to convert.
     * @param denominator The denominator of the percentage.
     * @return The percentage as a string.
     */
    function percentage(
        uint256 value,
        uint256 denominator
    ) internal pure returns (string memory) {
        uint256 significantDigits = value / denominator;
        uint256 decimals = value % denominator;

        return
            string.concat(
                decimals == 0
                    ? significantDigits.toString()
                    : string.concat(
                        significantDigits.toString(),
                        ".",
                        decimals.toString()
                    ),
                "%"
            );
    }
}
