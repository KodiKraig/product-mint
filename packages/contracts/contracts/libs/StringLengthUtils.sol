// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

library StringLengthUtils {
    function isEmpty(string memory str) internal pure returns (bool) {
        return bytes(str).length == 0;
    }

    function isNotEmpty(string memory str) internal pure returns (bool) {
        return !isEmpty(str);
    }

    function or(
        string memory thisValue,
        string memory defaultValue
    ) internal pure returns (string memory) {
        return isEmpty(thisValue) ? defaultValue : thisValue;
    }
}
