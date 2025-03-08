// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

library AttributeUtils {
    using Strings for uint256;

    /**
     * Strings
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
     * Booleans
     */

    function stringify(bool value) internal pure returns (string memory) {
        return value ? "True" : "False";
    }

    function attributeTraitType(
        bool value,
        string memory traitType
    ) internal pure returns (string memory) {
        return attributeTraitType(stringify(value), traitType);
    }

    /**
     * Numbers
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
}
