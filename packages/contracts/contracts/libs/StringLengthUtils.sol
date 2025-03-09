// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.20;

/**
 * @notice Utility library for checking the length of strings.
 */
library StringLengthUtils {
    /**
     * @notice Check if a string is empty.
     * @param str The string to check.
     * @return true if the string is empty, false otherwise.
     */
    function isEmpty(string memory str) internal pure returns (bool) {
        return bytes(str).length == 0;
    }

    /**
     * @notice Check if a string is not empty.
     * @param str The string to check.
     * @return true if the string is not empty, false otherwise.
     */
    function isNotEmpty(string memory str) internal pure returns (bool) {
        return !isEmpty(str);
    }

    /**
     * @notice Return a default value if the string is empty.
     * @param thisValue The string to check.
     * @param defaultValue The default value to return if the string is empty.
     * @return The string if it is not empty, the default value otherwise.
     */
    function or(
        string memory thisValue,
        string memory defaultValue
    ) internal pure returns (string memory) {
        return isEmpty(thisValue) ? defaultValue : thisValue;
    }
}
