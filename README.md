# Jert-network

JERT Network Monorepo
Non-custodial, permissioned EVM infrastructure for the **JERT token** and the
**Green Cold Energy / Cryogas** ecosystem.

This repository contains:

- `smart-contracts/` – Solidity contracts (JERT token, KYC/AML, Multisig treasury, Lease contracts) + Hardhat tests.
- `corporate-wallet/` – React-based **JERT Treasury / Multisig dashboard**.
- `api-gateway/` – Node.js (TypeScript) API gateway (compliance, energy oracle, wallet balance, tx stubs).
- `flutter-wallet/` – Android/iOS **JERT Wallet** (non-custodial, PIN-protected, 2FA for sends).
- 
## 1. Repository structure

jert-network/
  smart-contracts/       # Hardhat, Solidity contracts, tests
  corporate-wallet/      # React (Vite) multisig UI
  api-gateway/           # Express + ethers API gateway
  flutter-wallet/        # Flutter JERT mobile wallet
  docs/
    PROJECT_ROADMAP.md   # High-level roadmap & status

## USD & Energy-Denominated Utility

JERT — это **USD-номинированный утилити-токен**, связанный с реальными
энергетическими потоками внутри инфраструктуры Cryogas:

- **100 JERT = 1 MWh** электрической/тепловой энергии  
- **1000 JERT = 1 MWh-Cold** (криогенная холодовая энергия, извлекаемая при регазификации LNG)

Модель двойной деноминации:

- USD-слой — финансовая понятность для инвесторов и партнёров  
- Energy-слой — реальная индустриальная полезность для терминалов, складов, LCNG, дата-центров  

Все расчёты тарифов и цен выполняются **off-chain** через JERT API (energy oracle),
см. раздел `docs/EnergyLayer.md`.

Repository structure:
evm-chain/ – permissioned EVM
smart-contracts/ – Solidity code
api-gateway/ – backend API layer
corporate-wallet/ – React multisig wallet
mobile-wallet/ – Flutter wallet
docs/ – whitepaper, architecture, specifications.


