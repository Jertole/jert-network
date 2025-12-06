
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title JERT Infrastructure Lease Settlement Contract
/// @notice On-chain representation of settlement states for long-term infrastructure
///         and service agreements (e.g. land plots, terminals, cold-storage capacity).
/// @dev
/// - This contract does NOT replace or override any off-chain legal lease agreement.
///   Legal rights and obligations are governed by signed off-chain contracts
///   between Cryogas / partners / tenants.
/// - The purpose of this contract is to:
///   * Register identifiers of off-chain agreements (e.g. leaseId / agreementHash).
///   * Record JERT-based settlement events and lifecycle statuses
///     (e.g. active, expired, terminated).
///   * Emit transparent events for audit and reporting.
/// - No energy pricing or USD valuation is implemented on-chain.
///   Conversion between JERT and MWh / MWh-cold is handled OFF-CHAIN.
/// - The contract MUST NOT store raw personal data or confidential commercial terms.
contract LeaseContract is Ownable {
    /// @notice Possible on-chain lifecycle states for a lease.
    enum LeaseStatus {
        None,
        Active,
        Expired,
        Terminated
    }

    /// @notice Basic lease metadata referencing an off-chain legal agreement.
    struct Lease {
        bytes32 leaseId;         // off-chain lease/agreement identifier (hash, UUID, etc.)
        address tenant;          // on-chain tenant address
        uint256 startTimestamp;  // lease start (Unix timestamp)
        uint256 endTimestamp;    // lease end (Unix timestamp)
        LeaseStatus status;      // current lifecycle status
    }

    /// @dev Mapping from leaseId to Lease struct.
    mapping(bytes32 => Lease) private _leases;

    /// @notice Emitted when a new lease reference is registered on-chain.
    event LeaseRegistered(
        bytes32 indexed leaseId,
        address indexed tenant,
        uint256 startTimestamp,
        uint256 endTimestamp
    );

    /// @notice Emitted when the lease status is changed.
    event LeaseStatusChanged(bytes32 indexed leaseId, LeaseStatus newStatus);

    /// @notice Emitted when the lease term dates are updated.
    event LeaseTermUpdated(
        bytes32 indexed leaseId,
        uint256 newStartTimestamp,
        uint256 newEndTimestamp
    );

    /// @notice Registers a new lease agreement reference on-chain.
    /// @dev
    /// - Only callable by the contract owner (governance / operator).
