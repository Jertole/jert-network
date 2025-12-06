JERT Network — Documentation Overview

This directory contains the full technical documentation for the JERT Permissioned EVM Network, 
operated by Cryogas Kazakhstan, Vitlax Nordic AB (Sweden) and SY Power Energy (Switzerland).
The system supports settlement, energy access, cold-energy distribution and logistics operations
across Eurasia under the strategy:

“Building the Green Cold Energy Network across Eurasia”.

---------------------------------------------------------------------

1. Purpose of the JERT Network

The JERT network is a permissioned EVM blockchain designed to support:
- Controlled industrial settlement
- Terminal & logistics billing
- Energy and cold-energy consumption accounting
- Corporate wallet operations
- Compliance (KYC/AML)
- Multi-signature treasury custody
- Cold-chain data anchoring
- Infrastructure coordination between terminals

The network is operated by five independent VPS nodes across different jurisdictions.

---------------------------------------------------------------------

2. Repository Structure

jert-network/
  evm-chain/           → Permissioned EVM configuration (IBFT/PoA)
  smart-contracts/     → ERC-20 token, treasury multisig, leasing, compliance
  api-gateway/         → REST API, Energy Oracle, compliance middleware
  corporate-wallet/    → React-based multisig treasury dashboard
  mobile-wallet/       → Flutter non-custodial user wallet
  docs/                → Whitepapers, diagrams, specifications

---------------------------------------------------------------------

3. Token Economics — USD & Energy-Denominated Model

JERT follows a dual economic structure combining USD valuation and industrial 
energy-denominated utility.

3.1 USD Valuation Layer
- JERT is valued in USD, not in any local currency.
- Ensures clarity for international investors.
- JERT is not a stablecoin — no peg, no redemption, no claim mechanics.
- USD reference pricing is handled off-chain via the API layer.

3.2 Energy-Denominated Utility Model (Core of the system)

Energy Unit:
100 JERT = 1 MWh of energy

Cold-Energy Unit:
1000 JERT = 1 MWh-cold (Cryogenic Cold Energy)

Why cold-energy is separate:
- MWh-cold ≠ HVAC BTU
- Represents extractable cryogenic cooling from LNG regasification
- Generating 1 MWh-cold may require up to 100 tons of LNG throughput
- MWh-cold is a premium industrial commodity
- Produces natural long-term demand for JERT

Full details: see EnergyLayer.md

---------------------------------------------------------------------

4. Industrial Demand Drivers

JERT is used as a settlement instrument across Cryogas infrastructure:
- LCNG stations
- Cryogenic cold-storage terminals
- Fish / meat / pharma cold-chain logistics
- Industrial freezers
- Data centers using LNG-based cooling
- Large B2B logistics hubs

Unified billing for:
- Terminal fees
- Cold-energy consumption
- Energy access
- Processing services
- Storage and handling

---------------------------------------------------------------------

5. Architecture Diagrams

Dual Energy Settlement Architecture → /docs/Architecture/jert_permissioned_evm_architecture_neon.svg  
Cold Energy Loop (Vector Neon) → /docs/Architecture/cold_energy_loop.svg

Both diagrams embedded in Whitepaper v5.5.

---------------------------------------------------------------------

6. API Gateway — Overview

Core endpoints:
GET /energy/rates  
GET /energy/convert?jert=X  
GET /tx/history  
POST /tx/send  
POST /compliance/kyc-check  
POST /compliance/aml-check  

API = deterministic pricing layer for energy and cold-energy.

Details in:
api-gateway/README.md  
docs/EnergyLayer.md  

---------------------------------------------------------------------

7. Smart Contracts

Contracts:
- JERTToken.sol — ERC-20 utility token
- TreasuryMultisig.sol — 3/3 governance multisig
- LeaseContract.sol — terminal service agreements
- KYCRegistry.sol — permission registry
- ComplianceGateway.sol — compliance layer

Pricing logic kept off-chain for safety + regulatory compliance.

---------------------------------------------------------------------
8. Wallets

8.1 Corporate Wallet (React)
- Multisig signing
- Treasury dashboard
- Transaction monitoring
- Energy equivalents (MWh / MWh-cold)

8.2 Mobile Wallet (Flutter)
- Non-custodial wallet
- Send/receive JERT
- Tx history
- Energy equivalent display

---------------------------------------------------------------------

9. Validator Network Architecture

5 independent VPS nodes:
- Validator #1 — Cryogas KZ
- Validator #2 — Vitlax Nordic AB (EU)
- Validator #3 — SY Power Energy (CH/EU)
- API Service Node — Energy Oracle + Compliance
- Observer Node — Analytics + RPC backup

Documentation: JERT_Validator_Installation_Guide_v1.pdf

---------------------------------------------------------------------

10. Regulatory Model (AIFC/AFSA)

Principles:
- JERT = utility token
- USD denomination = reference only
- Energy pricing = off-chain
- No redemption
- Transparent governance (3/3 multisig)

Compliant with AIFC digital asset rules.

---------------------------------------------------------------------

11. Related Documents
- Whitepaper v5.5
- EnergyLayer.md
- Architecture SVGs
- Validator Installation Guide (PDF)
- Technical Specification (TZ)

---------------------------------------------------------------------

12. Contact
info@cryogas.kz

