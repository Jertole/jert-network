# JERT Network

JERT Network develops infrastructure for energy, LNG cold recovery, logistics, compute, and marketplace services. The JERT Utility Token (JERT) is designed for infrastructure access and service settlement. The project also uses JERT in its architecture for moving corporate value between supported network environments.

## Network deployments and token identity

The JERT DeploymentIndex records 21 network environments. Each entry has its own deployment and verification scope. The count describes infrastructure coverage, including entries without deployed modules. It does not imply separate token issuance, a live transfer route, or customer availability on every network.

The public JERT ERC-20 identity used in the [MetaMask metadata submission](https://github.com/MetaMask/contract-metadata/pull/1951) is **Arbitrum One** (chain ID **42161**), contract [`0x6eBe6b6e7E49ad8d09142DBE0964D034F8774f16`](https://arbiscan.io/token/0x6eBe6b6e7E49ad8d09142DBE0964D034F8774f16), with **18 decimals**. See [official token assets](assets/README.md) and the [21-network inventory](PROJECT-ROADMAP.md#21-network-deployment-index). [Sepolia configuration](docs/contract-addresses.json) is for testing.

## Corporate value movement and customer wallet

JERT's internal execution engine is designed to coordinate authorized movement and rebalancing of corporate value between supported network environments, with JERT as the common value asset. JDAT Core has validated this architecture. Actual execution depends on the readiness and approval of the route. USDC, USDT, and EURC can be used separately where settlement or conversion calls for them.

The customer-facing JERT Wallet is a connection interface for users' own wallets. Users retain their keys and review and sign transactions in the connected wallet. This is the design for customer access and settlement. The former Flutter prototype was removed from this repository on 24 December 2025. The corporate wallet UI in this repository is a separate component.

## JERTNet-OS, JDAT Core, and JDAT CIR

- **JERTNet-OS** coordinates infrastructure deployment, recovery, and operation across supported environments.
- **JDAT Core** maintains authoritative project state and verifies the state and outcomes of authorized operations.
- **JDAT CIR (Continuous Infrastructure Readiness)** continuously evaluates readiness for the next authorized operation using current state and evidence.

See the [project roadmap](PROJECT-ROADMAP.md) for status and historical milestones.

## Repository contents

| Path | Contents |
| --- | --- |
| [`smart-contracts/`](smart-contracts/) | Solidity contracts and Hardhat tooling |
| [`api-gateway/`](api-gateway/) | Node.js and TypeScript reference API |
| [`corporate-wallet/`](corporate-wallet/) | React corporate wallet UI |
| [`evm-chain/`](evm-chain/) | Configuration and tooling from the earlier permissioned EVM design |
| [`docs/`](docs/) | Technical references and Sepolia deployment documentation |
| [`assets/`](assets/) | Official public JERT logos and token metadata reference |

This repository publishes reference components and public documentation. The descriptions of JERTNet-OS, JDAT Core, and JDAT CIR summarize the project architecture.

Common tasks can be run from the repository root.

- `npm run test:smart-contracts`
- `npm run build:api-gateway`
- `npm run test:corporate-wallet`

JERT does not represent equity or financial yield. This repository makes no promise of redemption, pricing, or financial return.

[Official JERT website](https://www.jert.net/) · [JERT Utility Token](https://token.jert.ch/) · [Previous README](https://github.com/Jertole/jert-network/blob/b8b97f1aa6df909b17a0aa768e4426f64b34f0a8/README.md)
