--// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ComplianceGateway.sol";

/// @title Lease Contract for B2B Zones and LCNG Services
/// @notice Simple prepaid lease model in JERT tokens.
contract LeaseContract is ComplianceGateway {
    IERC20 public immutable jertToken;
    address public immutable treasury; // where payments go

    struct Lease {
        address lessee;
        uint256 amountJert;   // total JERT price
        uint256 paidJert;     // how much already paid
        uint64  startDate;
        uint64  endDate;
        bool    active;
    }

    uint256 public nextLeaseId;
    mapping(uint256 => Lease) public leases;

    event LeaseCreated(uint256 indexed leaseId, address indexed lessee, uint256 amountJert);
    event LeasePayment(uint256 indexed leaseId, address indexed payer, uint256 amount);
    event LeaseClosed(uint256 indexed leaseId);

    constructor(address jertToken_, address kycRegistry_, address treasury_)
        ComplianceGateway(kycRegistry_)
    {
        require(jertToken_ != address(0), "JERT token is zero");
        require(treasury_ != address(0), "Treasury is zero");
        jertToken = IERC20(jertToken_);
        treasury = treasury_;
    }

    /// @notice Create a new lease (called by off-chain operator / marketplace)
    function createLease(
        address lessee,
        uint256 amountJert,
        uint64 startDate,
        uint64 endDate
    ) external onlyKycAddress(lessee) returns (uint256 leaseId) {
        require(endDate > startDate, "Invalid dates");
        require(amountJert > 0, "Zero amount");

        leaseId = ++nextLeaseId;
        leases[leaseId] = Lease({
            lessee: lessee,
            amountJert: amountJert,
            paidJert: 0,
            startDate: startDate,
            endDate: endDate,
            active: true
        });

        emit LeaseCreated(leaseId, lessee, amountJert);
    }

    /// @notice Pay JERT towards an active lease
    function payLease(uint256 leaseId, uint256 amount)
        external
        onlyKycAddress(msg.sender)
    {
        Lease storage l = leases[leaseId];
        require(l.active, "Lease not active");
        require(amount > 0, "Zero amount");
        require(l.paidJert + amount <= l.amountJert, "Overpayment");

        jertToken.transferFrom(msg.sender, treasury, amount);
        l.paidJert += amount;

        emit LeasePayment(leaseId, msg.sender, amount);

        if (l.paidJert == l.amountJert) {
            l.active = false;
            emit LeaseClosed(leaseId);
        }
    }
}
