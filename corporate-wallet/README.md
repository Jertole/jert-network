# JERT Corporate Wallet – Multisig Dashboard

React (Vite) app for monitoring and operating the **JERT Treasury Multisig**.

## Features

- Read-only view of the JERT treasury multisig:
  - list of owners and required confirmations,
  - ETH + JERT balances,
  - transaction list (from on-chain storage),
  - progress bars for signature thresholds.

## Config

Set RPC URL via environment:

```bash
# Vite
VITE_JERT_RPC_URL=http://127.0.0.1:8545
