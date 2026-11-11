# JERT Network project roadmap

Public project status as of 11 November 2026.

## Current architecture and milestones

| Area | Status and scope |
| --- | --- |
| Network deployment | The JERT DeploymentIndex records 21 network environments across multiple runtimes. Deployment and verification are tracked per module and network. |
| JERTNet-OS | Evolved from deployment scripts into a multi-network infrastructure deployment platform. Its published capabilities include dependency-aware execution, recovery and resume, and deployment records. |
| JDAT Core and internal execution engine | JDAT Core maintains authoritative project state and provides verification for authorized operations. The internal engine is designed to coordinate approved execution across supported environments. |
| Corporate value movement through JERT | JDAT Core validated the architecture for using JERT to move and rebalance corporate value between supported network environments. Each route requires readiness and authorization before execution. USDC, USDT, and EURC remain separate settlement and conversion instruments where required. |
| JDAT CIR | Continuous Infrastructure Readiness defines how JERT evaluates whether infrastructure is ready for the next authorized operation. It uses current state and evidence to verify readiness and outcomes. |
| Customer-facing JERT Wallet | The approved design connects a user's own wallet for transaction review and signing. Keys stay in the connected wallet. The corporate wallet UI is a separate reference component. |

The architecture progressed from the initial JERT AI Policy through JERTNet-OS and JDAT Core to JDAT CIR. The current work is to qualify individual network routes and service integrations against their own readiness evidence. Architecture validation and network inventory entries have a separate status from availability to users.

## 21-network deployment index

The following identifiers reproduce the published inventory. The index includes environments with and without deployed modules. It records infrastructure scope and does not imply a separate JERT issuance on each network.

| Network identifiers in DeploymentIndex order |
| --- |
| `arbitrum`, `base`, `bnb`, `ethereum`, `linea`, `optimism`, `polygon` |
| `sei`, `solana-mainnet`, `tron`, `bitcoin`, `megaeth`, `monad`, `zksync` |
| `avalanche`, `robinhood`, `litecoin`, `cardano-mainnet`, `ton`, `hyperevm`, `aptos-mainnet` |

For the Arbitrum One token identity used in the MetaMask submission, see [official JERT assets](assets/README.md). For the test environment, see [Sepolia deployment documentation](docs/deployment-check.md).

Public references: [JERT project description](https://token.jert.ch/project-description.html), [JERTNet-OS milestone](https://www.linkedin.com/posts/jertse_jert-jertnetos-ethereum-activity-7479863519111393281-M_ik), and [JERT value movement architecture](https://www.linkedin.com/posts/jertse_jert-access-real-infrastructure-with-utility-activity-7504175180177473536-Sq-e).

## December 2025 historical roadmap

The original roadmap is preserved in full in the [December 2025 historical snapshot](https://github.com/Jertole/jert-network/blob/b8b97f1aa6df909b17a0aa768e4426f64b34f0a8/PROJECT-ROADMAP.md). Its completion marks, percentages, and deployment plans describe that period.

- The roadmap records a corporate wallet test transfer signed through MetaMask and confirmed on Sepolia.
- The former Flutter mobile wallet prototype described creating or importing private keys and signing inside the app. The repository stopped tracking the prototype on [24 December 2025](https://github.com/Jertole/jert-network/commit/4cfa6cb5cf9bf822ba1e8b3baf4cfd33fd779659).
- The permissioned EVM rollout, validator and public RPC plans, Flutter app distribution, and USD and energy reference model belong to the earlier design documented in that snapshot.
