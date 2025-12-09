
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
///   * Require that msg.sender is allowed before sensitive operations.
///   * Require that a specific beneficiary address is allowed.
contract ComplianceGateway is Ownable {
    /// @notice Emitted when the KYC registry address is updated.
    event KYCRegistryUpdated(address indexed previousRegistry, address indexed newRegistry);

    /// @dev Reference to the external KYCRegistry contract.
    IKYCRegistry public kycRegistry;

    /// @notice Optional constructor that sets the initial KYC registry.
    /// @param _kycRegistry Address of the KYC registry (can be zero and set later).
    constructor(address _kycRegistry) {
        if (_kycRegistry != address(0)) {
            kycRegistry = IKYCRegistry(_kycRegistry);
            emit KYCRegistryUpdated(address(0), _kycRegistry);
        }
    }

    /// @notice Updates the address of the KYC registry.
    /// @dev Only callable by the contract owner.
    /// @param _kycRegistry New KYC registry contract address.
    function setKYCRegistry(address _kycRegistry) external onlyOwner {
        require(_kycRegistry != address(0), "Gateway: zero registry");
        address previous = address(kycRegistry);
        kycRegistry = IKYCRegistry(_kycRegistry);
        emit KYCRegistryUpdated(previous, _kycRegistry);
    }

    /// @notice Returns true if the given account is allowed according to the registry.
    /// @param account Address to check.
    /// @return allowed True if the account is allowed, false otherwise (including when registry is unset).
    function isAllowed(address account) public view returns (bool allowed) {
        if (address(kycRegistry) == address(0)) {
            // Fail closed: if registry is not set, treat everyone as not allowed.
            return false;
        }
        return kycRegistry.isAllowed(account);
    }

    /// @notice External helper that reverts if msg.sender is not allowed.
    /// @dev Can be called by frontends or other contracts that need an explicit check.
    function requireSenderAllowed() external view {
        _requireAllowed(_msgSender());
    }

    /// @notice External helper that reverts if the given account is not allowed.
    /// @param account Address to check.
    function requireAccountAllowed(address account) external view {
        _requireAllowed(account);
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
