
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract KYCRegistry is Ownable {
    mapping(address => bool) private _allowed;

    event KYCStatusUpdated(address indexed account, bool allowed);

    constructor() Ownable(msg.sender) {}

    function setKYCStatus(address account, bool allowed_) external onlyOwner {
        _allowed[account] = allowed_;
        emit KYCStatusUpdated(account, allowed_);
    }

    function setKYCStatusBatch(
        address[] calldata accounts,
        bool[] calldata statuses
    ) external onlyOwner {
        require(accounts.length == statuses.length, "KYC: length mismatch");

        for (uint256 i = 0; i < accounts.length; i++) {
            _allowed[accounts[i]] = statuses[i];
            emit KYCStatusUpdated(accounts[i], statuses[i]);
        }
    }

    function isAllowed(address account) external view returns (bool) {
        return _allowed[account];
    }
}
