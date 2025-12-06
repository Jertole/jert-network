/// @title JERT Utility Token (ERC-20)
/// @notice ERC-20 utility token used as a unit of account inside the JERT Permissioned EVM Network
///         and the Cryogas / JERT cold logistics and energy infrastructure.
/// @dev
/// - This contract implements a standard ERC-20 token with no on-chain pricing logic.
/// - JERT is NOT a stablecoin and does NOT provide any redemption or claim rights in USD or any fiat currency.
/// - USD valuation and the energy-denominated model (e.g. 100 JERT = 1 MWh, 1000 JERT = 1 MWh-cold)
///   are defined and executed OFF-CHAIN by the JERT Energy Oracle and API Gateway.
/// - This contract MUST NOT implement any on-chain logic that pegs, guarantees, or redeems JERT
///   to USD, MWh, or any other measurement unit.
/// - Supply, minting policies and access control MUST follow the governance rules approved
///   by Cryogas Kazakhstan, Vitlax Nordic AB and SY Power Energy.
contract JERTToken {
    ...
}

/// @notice Transfers `amount` of JERT tokens to `to`.
    /// @param to Recipient address.
    /// @param amount Amount of tokens to transfer (in smallest units, decimals()).
    /// @return success True if transfer succeeds.
    function transfer(address to, uint256 amount) external returns (bool success) { ... }

    /// @notice Returns the decimals used by the token.
    /// @dev Used by off-chain systems to convert on-chain units into human-readable JERT amounts.
    function decimals() external view returns (uint8) { ... }
