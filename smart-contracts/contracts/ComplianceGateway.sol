
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./KYCRegistry.sol";

contract ComplianceGateway is Ownable {
    KYCRegistry public kycRegistry;

    event KYCRegistryUpdated(address indexed newRegistry);

    constructor(address registry) Ownable(msg.sender) {
        kycRegistry = KYCRegistry(registry);
    }

    function setKYCRegistry(address newRegistry) external onlyOwner {
        require(newRegistry != address(0), "Gateway: zero address");
        kycRegistry = KYCRegistry(newRegistry);
        emit KYCRegistryUpdated(newRegistry);
    }

    function isAllowed(address account) public view returns (bool) {
        return kycRegistry.isAllowed(account);
    }

    function requireSenderAllowed() external view {
        require(isAllowed(msg.sender), "Gateway: account not allowed");
    }

    function requireAccountAllowed(address account) external view {
        require(isAllowed(account), "Gateway: account not allowed");
    }
}
