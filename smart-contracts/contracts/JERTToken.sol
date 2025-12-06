/ SPDX-License-Identifier: MIT
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
///   to USD, MWh, or any other measurement unit.
/// - Supply, minting policies and access control MUST follow the governance rules approved
///   by Cryogas Kazakhstan, Vitlax Nordic AB and SY Power Energy.
contract JERTToken is ERC20, Ownable {
    /// @dev Custom decimals for the token, stored as immutable.
    uint8 private immutable _customDecimals;

    /// @notice Deploys the JERT token.
    /// @dev The deployer becomes the initial owner (see Ownable) and can later transfer ownership
    ///      to a TreasuryMultisig or any other governance contract.
    /// @param name_ Token name, e.g. "JERT Utility Token".
    /// @param symbol_ Token symbol, e.g. "JERT".
    /// @param decimals_ Number of decimals (commonly 18).
    /// @param initialTreasury Address that receives the initial supply (can be a multisig).
    /// @param initialSupply Initial supply to mint, in smallest units (respecting decimals).
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address initialTreasury,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        require(initialTreasury != address(0), "JERT: treasury is zero");
        _customDecimals = decimals_;

        if (initialSupply > 0) {
            _mint(initialTreasury, initialSupply);
        }
    }

    /// @notice Returns the number of decimals used by the token.
    /// @dev Used by off-chain systems to convert on-chain units into human-readable JERT amounts.
    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    /// @notice Mints new JERT tokens to a specified address.
    /// @dev Only callable by the contract owner (governance / treasury).
    ///      This function does not implement any pricing or energy logic.
    /// @param to Recipient address.
    /// @param amount Amount to mint, in smallest units (respecting decimals()).
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "JERT: mint to zero");
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
