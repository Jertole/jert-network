# jert-network
# JERT Network Monorepo

This repository contains the core infrastructure for the JERT Permissioned EVM Network,
supporting Cryogas Kazakhstan, Vitlax Nordic AB (Sweden) and SY Power Energy (Switzerland)
in **Building the Green Cold Energy Network across Eurasia**.

## Structure

- `evm-chain/` – Permissioned EVM configuration (IBFT/PoA, validators, genesis).
- `smart-contracts/` – Solidity contracts (JERT token, treasury, leasing, KYC, compliance).
- `api-gateway/` – Backend gateway for tx routing, compliance and oracle integration.
- `corporate-wallet/` – React-based dashboard for the Cryogas/JERT multisig treasury.
- `mobile-wallet/` – Flutter-based non-custodial mobile wallet for JERT users.
- `docs/` – Whitepaper, Technical Specification (TZ), architecture diagrams.

> This monorepo is the technical backbone of the JERT ecosystem under the AIFC/AFSA framework.
