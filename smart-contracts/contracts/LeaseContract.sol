
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
    /// - `leaseId` should be derived from an off-chain document (e.g. hash of PDF).
    /// @param leaseId Off-chain lease identifier (e.g. hash or UUID).
    /// @param tenant Address of the tenant (on-chain account).
    /// @param startTimestamp Lease start time (Unix timestamp).
    /// @param endTimestamp Lease end time (Unix timestamp).
    function registerLease(
        bytes32 leaseId,
        address tenant,
        uint256 startTimestamp,
        uint256 endTimestamp
    ) external onlyOwner {
        require(leaseId != bytes32(0), "Lease: invalid leaseId");
        require(tenant != address(0), "Lease: tenant is zero");
        require(startTimestamp < endTimestamp, "Lease: invalid timeframe");
        require(
            _leases[leaseId].leaseId == bytes32(0),
            "Lease: already exists"
        );

        _leases[leaseId] = Lease({
            leaseId: leaseId,
            tenant: tenant,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            status: LeaseStatus.Active
        });

        emit LeaseRegistered(leaseId, tenant, startTimestamp, endTimestamp);
        emit LeaseStatusChanged(leaseId, LeaseStatus.Active);
    }

    /// @notice Updates the lifecycle status of an existing lease.
    /// @dev Only callable by the owner (governance).
    /// @param leaseId Off-chain lease identifier.
    /// @param newStatus New lifecycle status for this lease.
    function setLeaseStatus(
        bytes32 leaseId,
        LeaseStatus newStatus
    ) external onlyOwner {
        Lease storage l = _leases[leaseId];
        require(l.leaseId != bytes32(0), "Lease: not found");
        require(newStatus != LeaseStatus.None, "Lease: invalid status");

        l.status = newStatus;
        emit LeaseStatusChanged(leaseId, newStatus);
    }

    /// @notice Updates the term (start/end timestamps) of an existing lease.
    /// @dev Only callable by the owner (governance).
    /// @param leaseId Off-chain lease identifier.
    /// @param newStartTimestamp New lease start time.
    /// @param newEndTimestamp New lease end time.
    function updateLeaseTerm(
        bytes32 leaseId,
        uint256 newStartTimestamp,
        uint256 newEndTimestamp
    ) external onlyOwner {
        Lease storage l = _leases[leaseId];
        require(l.leaseId != bytes32(0), "Lease: not found");
        require(newStartTimestamp < newEndTimestamp, "Lease: invalid timeframe");

        l.startTimestamp = newStartTimestamp;
        l.endTimestamp = newEndTimestamp;

        emit LeaseTermUpdated(leaseId, newStartTimestamp, newEndTimestamp);
    }

    /// @notice Returns lease metadata by leaseId.
    /// @param leaseId Off-chain lease identifier.
    /// @return lease Full lease struct.
    function getLease(
        bytes32 leaseId
    ) external view returns (Lease memory lease) {
        lease = _leases[leaseId];
    }

    /// @notice Returns the current status of a lease.
    /// @param leaseId Off-chain lease identifier.
    /// @return status Current LeaseStatus for this lease.
    function getLeaseStatus(
        bytes32 leaseId
    ) external view returns (LeaseStatus status) {
        status = _leases[leaseId].status;
    }
}
