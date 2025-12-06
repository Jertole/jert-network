
# JERT Smart Contracts

This package contains the on-chain logic for the JERT Permissioned EVM Network.
All contracts are designed to be minimal, auditable and compliant with AIFC/AFSA
digital asset requirements.

---

## 1. Design Principles

- JERT is an **ERC-20 utility token**, not a stablecoin.
- No on-chain USD peg, redemption or guaranteed pricing.
- All USD and energy/cold-energy conversions are executed **off-chain** via:
  - JERT API Gateway
  - JERT Energy Oracle
- On-chain contracts focus on:
  - Balances and permissions
  - Governance and treasury
  - Settlement state of infrastructure agreements
  - Transparent events for audit and reporting

The energy-denominated model:

- `100 JERT = 1 MWh` (energy access unit)
- `1000 JERT = 1 MWh-cold` (cryogenic cold-energy unit)

is **documented** and used by off-chain systems, but not encoded as
on-chain arithmetic.

---

## 2. Contracts

### 2.1 `JERTToken.sol`

- ERC-20 utility token.
- Used as a unit of account for:
  - Terminal services
  - Cold-storage and cold-energy access
  - LCNG / energy infrastructure
- Implemented with NatSpec comments:
  - clearly stating that JERT is not a stablecoin
  - clarifying that pricing and energy conversions are off-chain.

### 2.2 `TreasuryMultisig.sol`

- Multisignature treasury for Cryogas / Vitlax Nordic / SY Power Energy.
- Controls JERT funds dedicated to infrastructure projects.
- No energy or USD logic in the contract — only balances and approvals.
- Events can be used by auditors and regulators.

### 2.3 `LeaseContract.sol`

- Records references to off-chain infrastructure and service agreements.
- Allows mapping of:
  - `leaseId` / `agreementHash`
  - tenant address
  - lifecycle state (active, expired, terminated)
- Does not store personal data or full legal terms.
- Not a substitute for off-chain legal contracts.

### 2.4 `KYCRegistry.sol`

- Minimal permission registry:
  - `allowed / blocked` flags
  - optional roles
- No personal data on-chain.
- Mirrors the result of off-chain KYC/AML checks.

### 2.5 `ComplianceGateway.sol`

- Enforcement layer that integrates contracts with `KYCRegistry`.
- Used by other contracts to:
  - require `isAllowed(msg.sender)`
  - enforce access for sensitive operations.
- Does not implement KYC/AML by itself.

---

## 3. Deployment & Configuration

Deployment scripts: `scripts/deploy-all.ts`

Environment:
- RPC endpoint set in `hardhat.config.ts`
- Token and treasury addresses exported to:
  - `corporate-wallet` (`VITE_JERT_TOKEN_ADDRESS`, `VITE_TREASURY_MULTISIG_ADDRESS`)
  - `mobile-wallet` configuration

---

## 4. Audits & Compliance

Before production use, all contracts MUST be:

- Independently audited (security and logic).
- Reviewed against:
  - AIFC/AFSA digital asset frameworks
  - Local securities and payments regulations
  - EU / Swiss utility token guidelines

Any change in the energy model or valuation approach must be reflected:

- In the Whitepaper
- In NatSpec documentation
- In API Gateway configuration
