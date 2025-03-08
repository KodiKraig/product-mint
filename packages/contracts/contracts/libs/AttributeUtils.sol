// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

library AttributeUtils {
    using Strings for uint256;

    /**
     * Strings
     */

    function attributeValue(
        string memory value
    ) internal pure returns (string memory) {
        return string.concat('{"value": "', value, '"}');
    }

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

    function attributeValue(bool value) internal pure returns (string memory) {
        return attributeValue(stringify(value));
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

    function attributeValue(
        uint256 value
    ) internal pure returns (string memory) {
        return attributeValue(value.toString());
    }

    function attributeTraitType(
        uint256 value,
        string memory traitType
    ) internal pure returns (string memory) {
        return attributeTraitType(value.toString(), traitType);
    }
}
