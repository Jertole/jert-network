# JERT Network – Full Project Roadmap  
### USD-Denominated, Energy-Referenced Utility Token Infrastructure  
### Status: Active | Updated: 2025-12-14
Green-baseline -2025-12-14


## Canonical Baseline (Status: DONE ✅)

The repository is stabilized under a conservative, stability-first canonical layout.

Completed:
- Root hygiene: README aligned with real folder structure; CONTRIBUTING filled; .editorconfig added; .gitignore hardened
- Root proxy scripts: root package.json added (no workspaces, no Turborepo enabled)
- CI stability: per-package workflows remain green
- Umbrella CI: root umbrella workflow added and validated (installs deps per package; skips missing scripts safely)

Rules going forward:
- Do not break existing green CI checks
- Prefer incremental changes; avoid large refactors
- Turborepo will be introduced only after stable canonical baseline (prepared via turbo.json, not yet enabled)
  ## CI & Turborepo Status (Fixed ✅)

- Umbrella Root CI enabled as the primary orchestration layer
- Turborepo v2 integrated for umbrella only (no workspaces, stability-first)
- Turbo tasks defined via turbo.json (v2 schema)
- Package filtering performed by path (./smart-contracts, ./corporate-wallet)
- Turbo cache enabled (.turbo), npm root cache intentionally disabled
- No root lockfile by design (per-package dependency management preserved)

Result:
- All CI workflows green
- Deterministic, reproducible checks
- Fast re-runs via Turbo cache
- Infrastructure layer considered **stable and closed**

# 📌 Overview

The JERT Network represents a full-stack permissioned EVM ecosystem designed to support  
Cryogas infrastructure services: cold-energy terminals, LCNG stations, B2B logistics nodes,  
and energy-linked digital settlement.

---

# 🟦 Phase 1 — Smart Contracts Layer (Target: 100%)

### **1.1 NatSpec Documentation**
- [x] JERTToken  
- [x] TreasuryMultisig (3-of-3 governance)  
- [x] LeaseContract  
- [x] KYCRegistry  
- [x] ComplianceGateway  
- [ ] Automated ABI docs export → `/smart-contracts/abi/`  

### **1.2 Hardhat Test Suite**
- [ ] ERC20 behavior tests  
- [ ] Multisig approval → execution tests  
- [ ] KYC denial + compliance, negative tests  
- [ ] Lease registry tests  
- [ ] Edge cases & revert logic  

### Completion target: **100%** after full test coverage.

---

# 🟩 Phase 2 — Permissioned EVM Chain

### **2.1 Node & Genesis Configuration**
- [x] genesis.json  
- [x] static-nodes.json  
- [x] permissioned-nodes.json  
- [ ] validator key rotation system  
- [ ] auto-enrollment script for new validators  

### **2.2 Infrastructure**
- [ ] 5-node cluster (docker-compose)  
- [ ] Prometheus metrics  
- [ ] Grafana dashboards  
- [ ] Health-check endpoints  

### Completion target: **100%**  

---

# 🟧 Phase 3 — API Gateway (Backend Layer)

### **3.1 Core Endpoints**
- [x] `/wallet/balance`  
- [x] `/wallet/history`  
- [x] `/tx/send`  
- [x] `/compliance/check`  
- [x] `/oracle/mwh-rate`  
- [x] `/oracle/usd-rate`  

### **3.2 Pricing & Tariff Engine**
- [x] USD/JERT reference  
- [x] MWh/MWh-cold conversion logic  
- [ ] tariff.json (production version)  
- [ ] audit logging  

### **3.3 Production Readiness**
- [ ] JWT / API key authentication  
- [ ] rate limiting  
- [ ] full error code catalog  

---

# 🟦 Phase 4 — Corporate Wallet (React)

### Features Required:
- [x] Balance (JERT + USD + MWh + MWh-cold)  
- [x] TX history  
- [ ] Energy calculator  
- [ ] Multisig UI (3/3 approvals):  
  - [x] dashboard shell  
  - [ ] TX creation  
  - [ ] pending queue  
  - [ ] approval workflow  
  - [ ] revoke / execute  
  - [ ] signature visualization  

### Status: **60% complete**

---

# 🟪 Phase 5 — Mobile Wallet (Flutter)

### Required:
- [x] Balance screen  
- [ ] Energy & Cold Calculator  
- [ ] TX history via API  
- [ ] Send transaction  
- [ ] Integration with contract-addresses.json loader  
- [ ] UI polishing  

### Status: **50% complete**

---

# 🟨 Phase 6 — Documentation Layer

### **6.1 Whitepaper v5.6**
- [x] USD-denominated model  
- [x] Dual Energy model  
- [ ] insert diagrams into Word/PDF  
- [ ] publish v5.7  

### **6.2 Technical Specification (TZ v1.4)**
- [ ] tokenomics  
- [ ] economics  
- [ ] energy conversion layer  
- [ ] API & contract structure  

### **6.3 Regulatory Bundle (AFSA/AIFC)**
- [x] Utility-not-stablecoin  
- [x] Off-chain pricing  
- [x] No redemption  
- [x] AML/KYC model  
- [ ] Risk Disclosures v1.0  
- [ ] Final submission package  

---

# 🟥 Phase 7 — GitHub Repository Hardening

### Required files:
- [x] README.md (root)  
- [x] ROADMAP.md (this document)  
- [ ] CONTRIBUTING.md  
- [ ] SECURITY.md  
- [ ] CODEOWNERS  
- [ ] ./docs/API.md  
- [ ] ./docs/DeploymentGuide.md  

### CI/CD
- [ ] hardhat test pipeline  
- [ ] API build pipeline  
- [ ] React build pipeline  
- [ ] Flutter APK pipeline  

---

# 🟫 Phase 8 — Production Deployment

### Infrastructure:
- [ ] 5 validator nodes  
- [ ] 1 public RPC endpoint → rpc.jert.network  
- [ ] 1 API Gateway → api.jert.network  
- [ ] 1 corporate dashboard → wallet.jert.network  
- [ ] mobile wallet distribution (APK / TestFlight)

### Monitoring:
- [ ] Grafana dashboards  
- [ ] Node health and sync  
- [ ] API request metrics  
- [ ] Alerting system  

---

# 🟩 Phase 9 — Security & Compliance Audit

### Smart Contract Audit:
- [ ] static analysis  
- [ ] manual review  
- [ ] threat modeling  

### Backend Audit:
- [ ] API security  
- [ ] permissioning  
- [ ] logging integrity  

### Legal Audit:
- [ ] full AFSA risk classification  
- [ ] terms of service  
- [ ] disclaimers  

This file tracks the high-level roadmap and implementation status for the
**JERT Network Monorepo**.

---

## Legend / Status

- ✅ – Completed
- 🟡 – In progress / partial
- ⏳ – Planned
- 🟥 – Blocked / external dependency

---

## Step 1 – Smart Contracts & Tests

**Goal:** have a complete minimal set of contracts and reliable tests.

### 1.1 Core contracts

- ✅ `JERTToken.sol` – capped ERC-20 (1T max supply)
- ✅ `KYCRegistry.sol` – whitelist registry
- ✅ `ComplianceGateway.sol` – read-only compliance gate
- ✅ `LeaseContract.sol` – lease registration + payment tracking
- ✅ `TreasuryMultisig.sol` – multi-signature treasury

### 1.2 Tests (Hardhat, TypeScript)

- ✅ Token cap + mint/burn permissions
- ✅ KYC single + batch updates
- ✅ Compliance pre-checks
- ✅ Lease lifecycle (Register → Active → Completed)
- ✅ Multisig owners, confirmations, execution & failure paths

---

## Step 2 – Corporate Wallet / Multisig React UI

**Goal:** provide an internal dashboard for treasury operations.

- ✅ Contract service layer (`jertContracts.ts`)
- ✅ Multisig dashboard:
  - ✅ list owners & required confirmations
  - ✅ show ETH + JERT balances of treasury
  - ✅ load transactions via `getTransactionCount()` + `transactions(i)`
  - ✅ signature progress bar (confirmations / required)
- 🟡 API integration:
  - ⏳ real-time tx feed from API Gateway and/or event logs (WebSocket)

---

## Step 3 – JERT Mobile Wallet (Flutter)

**Goal:** simple non-custodial wallet for JERT Permissioned EVM.

- ✅ Onboarding:
  - ✅ create new private key
  - ✅ import existing private key (0x…)
- ✅ Security:
  - ✅ PIN creation (optional but recommended)
  - ✅ unlock app with PIN
  - ✅ 2FA for every JERT transfer (PIN confirmation dialog)
  - ✅ PIN change via Settings
- ✅ Wallet core:
  - ✅ read JERT balance from chain
  - ✅ read ETH balance (for gas)
  - ✅ send JERT transactions (signing done inside app)
- ✅ UX:
  - ✅ Receive screen with QR code
  - ✅ basic Home dashboard with latest balances
  - ✅ list of recent transactions from API Gateway (stub)

---

## Step 4 – API Gateway & Observability

**Goal:** central gateway for:

- wallets,
- corporate tools,
- future explorers,
- and external integrations (Middle Corridor, LNG cold energy, etc.).

### 4.1 API endpoints

- ✅ `GET /api/health` – healthcheck
- ✅ `GET /api/wallet/balance` – ETH + JERT + USD equivalent
- ✅ `GET /api/tx/history` – history stub (empty list for now)
- ✅ `POST /api/oracle/update` – Middle Corridor / LNG oracle endpoint
- ✅ `POST /api/compliance/*` – KYC/AML middleware hooks (stubs)
- 🟡 `POST /api/tx/send` – intentionally disabled (signing must remain client-side)

### 4.2 TODO – real transaction history

- ⏳ Implement log-based history:
  - scan recent blocks for `Transfer` events (JERT),
  - filter by `from` / `to` address,
  - paginate and cache results.
- ⏳ Add dedicated explorer-oriented endpoint:
  - `GET /api/tx/history/jert?address=0x...`
  - supports pagination & direction filters.

---

## Step 5 – Deployment & Networks

**Goal:** run JERT infra on testnet(s) and, later, on production permissioned EVM network.

- ⏳ Define network IDs, chain configs, and RPC nodes for:
  - ⏳ local dev (Hardhat / Anvil),
  - ⏳ internal testnet,
  - ⏳ production permissioned network.
- ⏳ Set up:
  - ⏳ RPC node(s) with basic monitoring,
  - ⏳ JERT explorer (Blockscout / similar),
  - ⏳ CI/CD pipeline for contracts + API + UI.

---

## Step 6 – Security & Compliance

**Goal:** ensure the system is safe enough for real value.

- ⏳ Internal security review:
  - contracts (reentrancy, auth, caps),
  - API Gateway,
  - mobile & web clients (no private key leaks).
- ⏳ External audit (3rd party, once scope stabilises).
- ⏳ Compliance review for AIFC / local regulators:
  - KYC/AML rules,
  - token classification,
  - reporting requirements.

---

## Step 7 – Productization

**Goal:** convert the tech into deployable products.

- ⏳ JERT Corporate Wallet (multisig) v1.0 release
- ⏳ JERT Mobile Wallet v1.0 (Android, then iOS TestFlight)
- ⏳ JERT Explorer (minimal Blockscout or custom-lite)
- ⏳ Documentation pack for regulators / partners:
  - whitepaper + annexes,
  - technical reference,
  - compliance overview.

---

_Last updated: 2025-12-09



---

# © Cryogas / JERTOLE Group – 2025  
Building the Green Cold Energy Network Across Eurasia
