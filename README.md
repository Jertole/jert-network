
# JERT Network — USD-Denominated Digital Utility Layer  
### Building the Green Cold Energy Network Across Eurasia  
**Cryogas Kazakhstan / Vitlax Nordic AB (Sweden) / SY Power Energy (Switzerland)**

The **JERT Network** is a permissioned EVM-based digital infrastructure powering the Cryogas cold-energy ecosystem, LCNG stations, B2B logistics services, and industrial terminals across Eurasia.  
JERT is a **USD-denominated digital utility token** used for infrastructure access, service settlement, leasing, reconciliation and cross-border coordination.

This monorepo contains the full technical stack of the JERT Network:
# 🌍 USD-Denominated Model

JERT functions as a **USD-based digital unit**, not tied to any national currency.  
All infrastructure pricing — cold-energy services, LCNG fueling, B2B logistics, leasing contracts — is expressed in USD.

### Advantages
- Eliminates FX risk (no exposure to KZT or other local currencies)  
- Standardised international pricing for suppliers and contractors  
- Transparent valuation of infrastructure services  
- Suitable for cross-border B2B operations  
- Enables integration into global digital asset ecosystems

---

# 🧱 Architecture Overview

### **1. Permissioned EVM Network (IBFT/PoA)**  
Located in `/evm-chain`  
- Static nodes configuration  
- Genesis file  
- 5 VPS validators/service nodes  
- Role separation (reconciliation, booking, compliance, gateway, backup)  
- Docker-compose for local development

### **2. Smart Contracts**  
Located in `/smart-contracts`
- **JERTToken.sol** — fixed-supply utility token  
- **TreasuryMultisig.sol** — 2/3 governance multisig (submit/confirm/execute/revoke)  
- **LeaseContract.sol** — prepaid infrastructure leasing logic  
- **KYCRegistry.sol** — address whitelist / AIFC compliance  
- **ComplianceGateway.sol** — middleware contract  

Includes full Hardhat test suite.

### **3. API Gateway (Node.js/TS)**  
Located in `/api-gateway`
- `/tx/send` — signing/broadcasting  
- `/tx/history` — on-chain event lookup  
- `/wallet` — account services  
- `/oracle` — Middle Corridor oracle integration  
- `/compliance` — AML/KYC middleware  
- Unified USD valuation responses

### **4. Corporate Wallet (React)**  
Located in `/corporate-wallet`
- Multisig treasury dashboard  
- Approvals UI (submit/confirm/revoke/execute)  
- Live JERT balance & history  
- API integration  

### **5. Mobile Wallet (Flutter)**  
Located in `/mobile-wallet`
- Non-custodial  
- On-chain tx history  
- JERT send/receive  
- Local storage for keys  
- Clean USD-based UI logic

---

# 🔑 Token Model (USD Standard)

- **Total supply:** 1,000,000,000,000 JERT  
- **50% Infrastructure Reserve** (cold terminals, LCNG, B2B logistics)  
- **50% Distributed (Variant B)**  
- **No minting**  
- **No burning mechanisms linked to speculation**  
- **USD valuation layer** for pricing terminals, storage, energy flows, logistics routes

---

# ⚖ Compliance

JERT is a **utility token** under the AIFC digital asset framework.  
It is not equity, not debt, and not a security.  
Used strictly for service access, billing and infrastructure coordination.

KYC/AML is enforced through:
- API compliance middleware  
- On-chain KYCRegistry  
- Gateway-level whitelisting  

---

# 📚 Documentation

All official documents in `/docs`:

- **Whitepaper v5.3 — USD Edition**  
- Architecture diagrams  
- Technical specification (TZ)  
- Multisig / Wallet / EVM chain documentation  

---

# 🧭 Roadmap

### Phase 1 — Aktobe
- Cold Energy Terminal deployment  
- LCNG integration  
- Digital booking via JERT  
- Multisig treasury (2/3)  

### Phase 2 — Eurasia Scaling
- Middle Corridor expansion: EU → AZ → KZ → CN  
- Oracle and route integration  
- Compliance preparation (AIFC)  
- Global partner onboarding  

---

# 📝 Contact

**Cryogas Kazakhstan**  
info@cryogas.kz  

Slogan:  
**“Building the Green Cold Energy Network across Eurasia”**

---

# ⚠ Disclaimer
JERT is a **utility token** and does not represent equity, debt, or investment contract.  
See the Whitepaper for complete definitions.
