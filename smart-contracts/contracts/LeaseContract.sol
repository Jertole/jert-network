// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LeaseContract is Ownable {
    enum Status {
        Inactive,
        Active,
        Suspended,
        Terminated,
        Completed
    }

    struct Lease {
        bytes32 leaseId;
        address tenant;
        uint256 totalAmount;
        uint256 paidAmount;
        Status status;
    }

    mapping(bytes32 => Lease) public leases;

    event LeaseRegistered(
        bytes32 indexed leaseId,
        address indexed tenant,
        uint256 startDate,
        uint256 endDate,
        uint256 totalAmount
    );

    event LeaseStatusChanged(bytes32 indexed leaseId, Status status);

    constructor() Ownable(msg.sender) {}

    function registerLease(
        bytes32 leaseId,
        address tenant,
        uint256 startDate,
        uint256 endDate,
        uint256 totalAmount
    ) external onlyOwner {
        require(leases[leaseId].tenant == address(0), "Lease: already exists");

        leases[leaseId] = Lease({
            leaseId: leaseId,
            tenant: tenant,
            totalAmount: totalAmount,
            paidAmount: 0,
            status: Status.Active
        });

        emit LeaseRegistered(
            leaseId,
            tenant,
            startDate,
            endDate,
            totalAmount
        );
    }

    function recordPayment(bytes32 leaseId, uint256 amount)
        external
        onlyOwner
    {
        Lease storage L = leases[leaseId];
        require(L.tenant != address(0), "Lease: not exists");

        L.paidAmount += amount;

        if (L.paidAmount >= L.totalAmount) {
            L.status = Status.Completed;
        }

        emit LeaseStatusChanged(leaseId, L.status);
    }

    function setLeaseStatus(bytes32 leaseId, Status status) external onlyOwner {
        Lease storage L = leases[leaseId];
        require(L.tenant != address(0), "Lease: not exists");

        L.status = status;

        emit LeaseStatusChanged(leaseId, status);
    }

    function getLease(bytes32 leaseId) external view returns (Lease memory) {
        return leases[leaseId];
    }
}
