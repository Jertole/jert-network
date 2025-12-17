# Deployment Check (Sepolia)

This document describes how to validate the current Sepolia deployment using the Hardhat check script.

## Canonical addresses file

All Sepolia addresses are stored in:

- `docs/contract-addresses.json`

Expected structure (canonical):

- `network`: `sepolia`
- `chainId`: `11155111`
- `contracts.JERTToken.address`
- `contracts.TreasuryMultisig.address`
- `multisig.threshold`: `2` (canonical governance = 2-of-3)

## Local prerequisites

- Node.js **20 LTS**
- A local `.env` file in `smart-contracts/` (NEVER commit it)

Example `.env` keys (names must match `hardhat.config.ts`):

- `INFURA_SEPOLIA_RPC`
- `DEPLOYER_PRIVATE_KEY`
- `ETHERSCAN_API_KEY` (optional)

## Run the check

From repo root:

```bash
cd smart-contracts
set -a && source .env && set +a
npx hardhat run scripts/check-deployed-contracts.ts --network sepolia

Expected output

The check is considered successful when it prints:

✓ JERTToken OK

✓ TreasuryMultisig OK

ALL GOOD ✓


Notes

Governance is canonical 2-of-3 for TreasuryMultisig.

If TreasuryMultisig is not deployed or its address is missing in docs/contract-addresses.json, the check must fail.


---

## 3) Commit message
Например:
**`Add Sepolia deployment check instructions`**




