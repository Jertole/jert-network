
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./KYCRegistry.sol";

/// @title Compliance Gateway
/// @notice Централизованная точка проверки KYC/Compliance.
contract ComplianceGateway is Ownable {
    KYCRegistry public kycRegistry;

    event KYCRegistryUpdated(address indexed newRegistry);

    constructor() Ownable(msg.sender) {}

    /// @notice Установить адрес реестра KYC.
    function setKYCRegistry(KYCRegistry newRegistry) external onlyOwner {
        require(address(newRegistry) != address(0), "Compliance: zero address");
        kycRegistry = newRegistry;
        emit KYCRegistryUpdated(address(newRegistry));
    }

    /// @notice Модификатор, который разрешает действия только KYC-подтверждённым адресам.
    modifier onlyAllowed(address account) {
        require(address(kycRegistry) != address(0), "Compliance: KYC not set");
        require(kycRegistry.isAllowed(account), "Compliance: account not allowed");
        _;
    }

    /// @notice Внешняя функция для удобной проверки KYC статуса.
    function isAccountAllowed(address account) external view returns (bool) {
        if (address(kycRegistry) == address(0)) {
            return false;
        }
        return kycRegistry.isAllowed(account);
    }
}
