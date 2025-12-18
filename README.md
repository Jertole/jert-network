# Jert-network

JERT Network Monorepo
Non-custodial, permissioned EVM infrastructure for the **JERT token** and the
**Green Cold Energy / Cryogas** ecosystem.
**Public preview / reference implementation**

This repository contains the reference implementation of the **JERT Network** components (smart contracts, wallet UIs, and API services).
It does **not** provide any promise of redemption, pricing, or financial return.
Production parameters (pricing, validator governance, compliance rules) are defined off-chain.
This repository contains:

- smart-contracts/ — Solidity contracts (Hardhat)
- corporate-wallet/ — React-based corporate wallet (Treasury UI)
  PIN-protected with optional second-factor (2FA) security model
- api-gateway/ — Node.js / TypeScript API gateway
- mobile-wallet/ — Flutter Android/iOS wallet
  PIN-protected with optional second-factor (2FA) security model
- evm-chain/ — EVM chain / node configuration & tooling
- docs/ — Documentation (incl. contract-addresses.json, specs, roadmap)
  
## 1. Repository structure

jert-network/
  smart-contracts/       # Hardhat, Solidity contracts, tests
  corporate-wallet/      # React (Vite) multisig UI
  api-gateway/           # Express + ethers API gateway
  flutter-wallet/        # Flutter JERT mobile wallet
  docs/
    PROJECT_ROADMAP.md   # High-level roadmap & status

## Root-level commands

For convenience, common tasks can be executed from the repository root.
These commands proxy to the corresponding package directories without changing
their internal tooling.

Examples:
- npm run test:smart-contracts
- npm run build:api-gateway
- npm run test:corporate-wallet

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


