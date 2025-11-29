
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Treasury Multisig Config
/// @notice Stores the configuration of the 2-of-3 multisig treasury for JERT.
contract TreasuryMultisig {
    address[] public owners;
    uint256 public immutable threshold; // e.g. 2-of-3

    event OwnershipUpdated(address[] owners, uint256 threshold);

    constructor(address[] memory _owners, uint256 _threshold) {
        require(_owners.length >= 3, "Need at least 3 owners");
        require(_threshold > 0 && _threshold <= _owners.length, "Invalid threshold");

        owners = _owners;
        threshold = _threshold;

        emit OwnershipUpdated(_owners, _threshold);
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function isOwner(address account) public view returns (bool) {
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == account) return true;
        }
        return false;
    }
}
