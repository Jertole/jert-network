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
///     (e.g. active, expired, terminated, completed).
contract LeaseContract is Ownable {
    /// @notice Lease lifecycle status.
    enum LeaseStatus {
        Inactive,
        Active,
        Suspended,
        Terminated,
        Completed
    }

    /// @notice Struct describing a registered lease.
    struct Lease {
        bytes32 leaseId;
        address tenant;
        uint64 startTimestamp;
        uint64 endTimestamp;
        uint256 totalAmount; // denominated in JERT smallest units (off-chain priced).
        uint256 paidAmount;  // cumulative paid amount.
        LeaseStatus status;
    }

    /// @dev Mapping of lease identifiers to lease records.
    mapping(bytes32 => Lease) private _leases;

    /// @notice Emitted when a new lease is registered.
    event LeaseRegistered(
        bytes32 indexed leaseId,
        address indexed tenant,
        uint64 startTimestamp,
        uint64 endTimestamp,
        uint256 totalAmount
    );

    /// @notice Emitted when a lease payment is recorded.
    event LeasePaymentRecorded(
        bytes32 indexed leaseId,
        address indexed payer,
        uint256 amount,
        uint256 newPaidAmount
    );

    /// @notice Emitted when a lease status is updated.
    event LeaseStatusUpdated(
        bytes32 indexed leaseId,
        LeaseStatus previousStatus,
        LeaseStatus newStatus
    );

    /// @notice Registers a new lease.
    /// @dev Only callable by the contract owner (infrastructure operator / admin).
    /// @param leaseId Off-chain lease identifier or agreement hash.
    /// @param tenant Address of the tenant / counterparty.
    /// @param startTimestamp Lease start (UTC seconds).
    /// @param endTimestamp Lease end (UTC seconds).
    /// @param totalAmount Total nominal amount denominated in JERT smallest units.
    function registerLease(
        bytes32 leaseId,
        address tenant,
        uint64 startTimestamp,
        uint64 endTimestamp,
        uint256 totalAmount
    ) external onlyOwner {
        require(leaseId != bytes32(0), "Lease: empty id");
        require(tenant != address(0), "Lease: zero tenant");
        require(_leases[leaseId].tenant == address(0), "Lease: already exists");
        require(endTimestamp == 0 || endTimestamp > startTimestamp, "Lease: invalid period");

        Lease memory lease = Lease({
            leaseId: leaseId,
            tenant: tenant,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            totalAmount: totalAmount,
            paidAmount: 0,
            status: LeaseStatus.Active
        });

        _leases[leaseId] = lease;

        emit LeaseRegistered(
            leaseId,
            tenant,
            startTimestamp,
            endTimestamp,
            totalAmount
        );
        emit LeaseStatusUpdated(leaseId, LeaseStatus.Inactive, LeaseStatus.Active);
    }

    /// @notice Records a lease payment in JERT terms.
    /// @dev This function only records accounting state on-chain. Actual token transfers
    ///      are expected to happen in separate token contracts / treasuries.
    ///      Only callable by the contract owner.
    /// @param leaseId Off-chain lease identifier.
    /// @param amount Amount paid for this settlement event.
    function recordPayment(bytes32 leaseId, uint256 amount) external onlyOwner {
        require(amount > 0, "Lease: zero amount");

        Lease storage lease = _leases[leaseId];
        require(lease.tenant != address(0), "Lease: unknown id");
        require(
            lease.status == LeaseStatus.Active || lease.status == LeaseStatus.Suspended,
            "Lease: not active"
        );

        lease.paidAmount += amount;

        emit LeasePaymentRecorded(
            leaseId,
            _msgSender(),
            amount,
            lease.paidAmount
        );

        // Optionally mark as completed when fully paid.
        if (lease.totalAmount > 0 && lease.paidAmount >= lease.totalAmount) {
            LeaseStatus previous = lease.status;
            lease.status = LeaseStatus.Completed;
            emit LeaseStatusUpdated(leaseId, previous, LeaseStatus.Completed);
        }
    }

    /// @notice Manually updates the status of a lease.
    /// @dev Only callable by the owner. This is to reflect off-chain legal status changes.
    /// @param leaseId Off-chain lease identifier.
    /// @param newStatus New lease status.
    function setLeaseStatus(bytes32 leaseId, LeaseStatus newStatus) external onlyOwner {
        Lease storage lease = _leases[leaseId];
        require(lease.tenant != address(0), "Lease: unknown id");

        LeaseStatus previous = lease.status;
        lease.status = newStatus;

        emit LeaseStatusUpdated(leaseId, previous, newStatus);
    }

    /// @notice Returns the full lease struct for a given leaseId.
    /// @param leaseId Off-chain lease identifier.
    /// @return lease Full lease data.
    function getLease(bytes32 leaseId) external view returns (Lease memory lease) {
        lease = _leases[leaseId];
    }

    /// @notice Returns the current status of a lease.
    /// @param leaseId Off-chain lease identifier.
    /// @return status Current LeaseStatus for this lease.
    function getLeaseStatus(bytes32 leaseId) external view returns (LeaseStatus status) {
        status = _leases[leaseId].status;
    }
}
