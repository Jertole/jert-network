// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title JERT Infrastructure Token
/// @notice Fixed-supply ERC20 used for prepaid services, leases and ESG-linked flows.
contract JERTToken is ERC20, Ownable {
    // 1 trillion tokens with 18 decimals
    uint256 public constant MAX_SUPPLY = 1_000_000_000_000 * 10 ** 18;

    /// @param treasury Address that receives the full initial supply (multisig vault)
    constructor(address treasury) ERC20("JERT Infrastructure Token", "JERT") {
        require(treasury != address(0), "Treasury is zero");
        _mint(treasury, MAX_SUPPLY);
        _transferOwnership(treasury);
    }
}
