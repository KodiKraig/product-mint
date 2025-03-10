// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.24;

/**
 * @title OneTimeLock
 * @notice A contract for locking calls based on a hash.
 * Once locked, there is no way to unlock.
 */
contract OneTimeLock {
    /**
     * @dev The error emitted when the caller is already locked.
     */
    error AlreadyLocked(bytes32 hash);

    /**
     * @dev The event emitted when the caller is locked.
     */
    event Locked(bytes32 hash);

    /**
     * @dev The hash => locked
     */
    mapping(bytes32 => bool) private _locked;

    /**
     * @notice Locks the caller based on a hash.
     * @dev The function can only be called once with the same hash.
     * If the function is called more than once, the second and subsequent calls will revert.
     */
    function lock(bytes32 caller) internal {
        if (_locked[caller]) {
            revert AlreadyLocked(caller);
        }

        _locked[caller] = true;

        emit Locked(caller);
    }
}
