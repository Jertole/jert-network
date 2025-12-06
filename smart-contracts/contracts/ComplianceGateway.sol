

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Interface for KYCRegistry used by the Compliance Gateway.
interface IKYCRegistry {
    function isAllowed(address account) external view returns (bool);
}

/// @title JERT Compliance Gateway
/// @notice On-chain enforcement layer that integrates with KYCRegistry and other
///         permission contracts to allow or deny specific actions in the JERT network.
/// @dev
/// - This contract does not perform KYC/AML checks itself.
///   It only reads status flags from KYCRegistry (and similar contracts).
/// - All actual verification is handled OFF-CHAIN by licensed providers.
/// - The gateway can be used by other contracts to:
///   * Require that msg.sender is allowed()
///   * Enforce access control for specific operations (e.g. leasing, treasury flows).
/// - The contract must remain generic and upgradable in terms of which registry it uses,
///   to align with regulatory evolution and AFSA/AIFC requirements.
contract ComplianceGateway is Ownable {
    /// @notice Current KYC registry used to validate addresses.
    IKYCRegistry public kycRegistry;

    /// @notice Emitted when the KYC registry reference is updated.
    event KYCRegistryUpdated(address indexed newRegistry);

    /// @notice Deploys the gateway with an initial KYC registry.
    /// @param initialRegistry Address of the KYCRegistry contract.
    constructor(address initialRegistry) {
        require(initialRegistry != address(0), "Gateway: zero registry");
        kycRegistry = IKYCRegistry(initialRegistry);
        emit KYCRegistryUpdated(initialRegistry);
    }

    /// @notice Updates the address of the KYCRegistry.
    /// @dev Only callable by the owner (governance / compliance operator).
    /// @param newRegistry Address of the new KYCRegistry contract.
    function setKYCRegistry(address newRegistry) external onlyOwner {
        require(newRegistry != address(0), "Gateway: zero registry");
        kycRegistry = IKYCRegistry(newRegistry);
        emit KYCRegistryUpdated(newRegistry);
    }

    /// @notice Reverts if `account` is not allowed according to the KYCRegistry.
    /// @param account Address to be checked.
    function requireAllowed(address account) external view {
        _requireAllowed(account);
    }

    /// @notice Returns true if `account` is allowed according to the current KYCRegistry.
    /// @param account Address to be checked.
    /// @return allowed True if the address is allowed.
    function checkAllowed(
        address account
    ) external view returns (bool allowed) {
        allowed = _isAllowed(account);
    }

    /// @dev Internal view helper to check permissions.
    function _isAllowed(address account) internal view returns (bool) {
        if (address(kycRegistry) == address(0)) {
            // If registry is not set, fail-closed to avoid bypassing compliance.
            return false;
        }
        return kycRegistry.isAllowed(account);
    }

    /// @dev Internal helper that reverts when an account is not allowed.
    function _requireAllowed(address account) internal view {
        require(_isAllowed(account), "Gateway: account not allowed");
    }
}
