// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title JERT KYC Permission Registry
/// @notice Minimal on-chain registry used to mark addresses as allowed or blocked
///         according to off-chain KYC/AML checks.
/// @dev
/// - This contract MUST NOT store any personal data (names, documents, addresses, etc.).
/// - The only purpose is to maintain boolean flags and roles for addresses:
///   * allowed / blocked
/// - All KYC/AML verification is performed OFF-CHAIN by licensed providers
///   and only the resulting status is mirrored on-chain.
/// - Off-chain providers and compliance logic are orchestrated via the JERT API Gateway.
contract KYCRegistry is Ownable {
    /// @notice Emitted when an address receives a new KYC permission status.
    event KYCStatusUpdated(address indexed account, bool allowed);

    /// @dev Mapping of address => allowed flag.
    mapping(address => bool) private _allowed;

    /// @notice Sets the KYC status for a single address.
    /// @dev Only callable by the owner (compliance operator / governance).
    /// @param account Address for which to set the status.
    /// @param allowed True if address is permitted to interact with restricted areas.
    function setAllowed(address account, bool allowed) external onlyOwner {
        require(account != address(0), "KYC: zero address");
        _allowed[account] = allowed;
        emit KYCStatusUpdated(account, allowed);
    }

    /// @notice Batch updates KYC status for multiple addresses.
    /// @dev Only callable by the owner.
    /// @param accounts Array of addresses.
    /// @param allowedFlags Array of allowed flags, must be same length as accounts.
    function setAllowedBatch(
        address[] calldata accounts,
        bool[] calldata allowedFlags
    ) external onlyOwner {
        require(
            accounts.length == allowedFlags.length,
            "KYC: length mismatch"
        );

        for (uint256 i = 0; i < accounts.length; i++) {
            address account = accounts[i];
            require(account != address(0), "KYC: zero address");
            _allowed[account] = allowedFlags[i];
            emit KYCStatusUpdated(account, allowedFlags[i]);
        }
    }

    /// @notice Returns whether `account` is allowed to interact with restricted
    ///         parts of the JERT ecosystem (e.g. certain pools or instruments).
    /// @param account Address to be checked.
    /// @return isAllowed True if the address passed off-chain KYC/AML checks.
    function isAllowed(
        address account
    ) external view returns (bool isAllowed) {
        isAllowed = _allowed[account];
    }
}
