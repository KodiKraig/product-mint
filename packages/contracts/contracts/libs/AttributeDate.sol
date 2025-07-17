// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

library AttributeDate {
    using Strings for uint256;

    /**
     * @notice Convert a date value to a Metadata attribute with proper display type.
     * @param value The date value to convert.
     * @param traitType The trait type of the attribute.
     * @return The attribute as a string.
     *
     * Format:
     * { 'display_type': 'date', 'trait_type': '<TRAIT TYPE>', 'value': '<VALUE>' }
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
