
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./KYCRegistry.sol";

/// @title Compliance Gateway
/// @notice Simple on-chain KYC gate, used by other contracts via modifier.
contract ComplianceGateway {
    KYCRegistry public immutable kycRegistry;

    constructor(address kycRegistry_) {
        require(kycRegistry_ != address(0), "KYC address is zero");
        kycRegistry = KYCRegistry(kycRegistry_);
    }

    modifier onlyKycAddress(address user) {
        require(kycRegistry.isKYCCompleted(user), "KYC not completed");
        _;
    }
}
