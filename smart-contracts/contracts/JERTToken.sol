// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title JERT Utility Token (ERC-20)
/// @notice ERC-20 utility token used as a unit of account inside the JERT Permissioned EVM Network
///         and the Cryogas / JERT cold logistics and energy infrastructure.
/// @dev
/// - This contract implements a standard ERC-20 token with no on-chain pricing logic.
/// - JERT is NOT a stablecoin and does NOT provide any redemption or claim rights in USD
///   or any other fiat currency.
/// - USD valuation and the energy-denominated model (e.g. 100 JERT = 1 MWh, 1000 JERT = 1 MWh-cold)
///   are defined and executed OFF-CHAIN by the JERT Energy Oracle and API Gateway.
/// - This contract MUST NOT implement any on-chain logic that pegs, guarantees, or redeems JERT
///   into fiat or energy units.
/// - Minting and burning are restricted to the owner (treasury / governance).
contract JERTToken is ERC20, Ownable {
    uint8 private constant _DECIMALS = 18;

    /// @notice Maximum token supply in the smallest units (wei-style).
    /// @dev 1_000_000_000_000 * 10^18 = 1 trillion JERT with 18 decimals.
    uint256 public constant MAX_SUPPLY = 1_000_000_000_000 * 10 ** uint256(_DECIMALS);

    /// @notice Constructs the JERT token and mints the full MAX_SUPPLY to the treasury.
    /// @param treasury Address of the treasury (typically the multisig) that receives the initial supply.
    constructor(address treasury) ERC20("JERT Utility Token", "JERT") {
        require(treasury != address(0), "JERT: zero treasury");
        _mint(treasury, MAX_SUPPLY);
        _transferOwnership(_msgSender());
    }

    /// @inheritdoc ERC20
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /// @notice Mints additional JERT tokens to a specified address.
    /// @dev Only callable by the contract owner. Minting cannot exceed MAX_SUPPLY.
    ///      Intended for controlled issuance (e.g. bridging or technical adjustments).
    /// @param to Recipient address.
    /// @param amount Amount to mint, in smallest units.
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "JERT: mint to zero");
        require(totalSupply() + amount <= MAX_SUPPLY, "JERT: cap exceeded");
        _mint(to, amount);
    }

    /// @notice Burns JERT tokens from a specified address.
    /// @dev Only callable by the contract owner (governance / treasury).
    ///      Intended for treasury or reserve management. This does not represent
    ///      any on-chain redemption into fiat or energy units.
    /// @param from Address from which tokens will be burned.
    /// @param amount Amount to burn, in smallest units.
    function burn(address from, uint256 amount) external onlyOwner {
        require(from != address(0), "JERT: burn from zero");
        _burn(from, amount);
    }
}
