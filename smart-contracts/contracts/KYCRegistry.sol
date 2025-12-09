// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title JERT KYC Permission Registry
/// @notice Minimal on-chain registry used to mark addresses as allowed or blocked
///         according to off-chain KYC/AML checks.
/// @dev
/// - This contract MUST NOT store any personal data (names, documents, addresses, etc.).
/// - The only purpose is to maintain boolean flags for addresses:
///   * allowed / blocked
/// - All KYC/AML verification is performed OFF-CHAIN by licensed providers
///   and only the resulting status is mirrored on-chain.
/// - Off-chain providers and compliance logic are orchestrated via the JERT API Gateway.
contract KYCRegistry is Ownable {
    /// @notice Emitted when the allowed status for an address changes.
    /// @param account Address whose status changed.
    /// @param allowed New allowed state for the account.
    event KYCStatusUpdated(address indexed account, bool allowed);

    /// @dev Mapping of addresses to their "allowed" flag.
    mapping(address => bool) private _allowed;

    /// @notice Sets the allowed / blocked status for a single account.
    /// @dev Only callable by the contract owner (compliance admin).
    /// @param account Address whose status is being updated.
    /// @param allowed True if the account passed off-chain KYC/AML and is allowed.
    function setKYCStatus(address account, bool allowed) external onlyOwner {
        require(account != address(0), "KYC: zero address");
        _allowed[account] = allowed;
        emit KYCStatusUpdated(account, allowed);
    }

    /// @notice Batch version of setKYCStatus.
    /// @dev Arrays must have the same length. Only callable by the owner.
    /// @param accounts List of addresses to update.
    /// @param allowedFlags List of allowed flags corresponding to each address.
    function setKYCStatusBatch(
        address[] calldata accounts,
        bool[] calldata allowedFlags
    ) external onlyOwner {
        uint256 len = accounts.length;
        require(len == allowedFlags.length, "KYC: length mismatch");

        for (uint256 i = 0; i < len; i++) {
            address account = accounts[i];
            require(account != address(0), "KYC: zero address");
            bool allowed = allowedFlags[i];
            _allowed[account] = allowed;
            emit KYCStatusUpdated(account, allowed);
        }
    }

    /// @notice Returns whether `account` is allowed to interact with restricted
    ///         parts of the JERT ecosystem (e.g. certain pools or instruments).
    /// @param account Address to be checked.
    /// @return isAllowed True if the address passed off-chain KYC/AML checks.
    function isAllowed(address account) external view returns (bool isAllowed) {
        isAllowed = _allowed[account];
    }
}
