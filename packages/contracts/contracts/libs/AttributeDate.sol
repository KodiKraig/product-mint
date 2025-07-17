// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @notice Library for converting a block timestamp to a metadata date attribute.
 */
library AttributeDate {
    using Strings for uint256;

    /**
     * @notice Convert a date value to a metadata attribute with proper display type.
     * @param value The block timestamp value representing the date.
     * @param traitType The trait type of the attribute.
     * @return The attribute as a string.
     *
     * Format:
     * { 'display_type': 'date', 'trait_type': '<TRAIT TYPE>', 'value': '<BLOCK TIMESTAMP>' }
     */
    function attributeTraitTypeDate(
        uint256 value,
        string memory traitType
    ) internal pure returns (string memory) {
        return
            string.concat(
                '{"display_type": "date", "trait_type": "',
                traitType,
                '", "value": ',
                value.toString(),
                "}"
            );
    }
}
