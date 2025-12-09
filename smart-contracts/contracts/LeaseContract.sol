// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Lease Contract
/// @notice Базовый контракт аренды для JERT-терминалов/участков.
/// @dev Простая модель, которую можно расширять по мере необходимости.
contract LeaseContract is Ownable {
    struct Lease {
        address lessee;     // арендатора
        uint256 amount;     // сумма платежа (например, в JERT или в wei)
        uint64 startDate;   // timestamp начала
        uint64 endDate;     // timestamp окончания
        bool active;        // статус
    }

    uint256 public nextLeaseId;
    mapping(uint256 => Lease) public leases;

    event LeaseCreated(
        uint256 indexed leaseId,
        address indexed lessee,
        uint256 amount,
        uint64 startDate,
        uint64 endDate
    );

    event LeaseClosed(uint256 indexed leaseId);

    constructor() Ownable(msg.sender) {}

    /// @notice Создать новый договор аренды.
    function createLease(
        address lessee,
        uint256 amount,
        uint64 startDate,
        uint64 endDate
    ) external onlyOwner returns (uint256 leaseId) {
        require(lessee != address(0), "Lease: zero lessee");
        require(endDate > startDate, "Lease: invalid dates");

        leaseId = nextLeaseId++;
        leases[leaseId] = Lease({
            lessee: lessee,
            amount: amount,
            startDate: startDate,
            endDate: endDate,
            active: true
        });

        emit LeaseCreated(leaseId, lessee, amount, startDate, endDate);
    }

    /// @notice Закрыть договор аренды.
    function closeLease(uint256 leaseId) external onlyOwner {
        Lease storage lease = leases[leaseId];
        require(lease.active, "Lease: already inactive");

        lease.active = false;
        emit LeaseClosed(leaseId);
    }

    /// @notice Получить данные по договору.
    function getLease(uint256 leaseId) external view returns (Lease memory) {
        return leases[leaseId];
    }
}
