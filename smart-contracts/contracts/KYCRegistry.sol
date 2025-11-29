// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title KYC Registry
/// @notice Stores which addresses passed KYC/AML and can access privileged features.
contract KYCRegistry is Ownable {
    mapping(address => bool) private _kycStatus;

    event KYCStatusUpdated(address indexed user, bool isKycPassed);

    function setKYCStatus(address user, bool status) external onlyOwner {
        _kycStatus[user] = status;
        emit KYCStatusUpdated(user, status);
    }

    function isKYCCompleted(address user) external view returns (bool) {
        return _kycStatus[user];
    }
}
