# JERT Permissioned EVM Chain

This module contains configuration files and scripts required to deploy and operate the JERT
Permissioned EVM blockchain network (IBFT/PoA consensus).
## Structure
evm-chain/config/genesis.json 
# chain configuration static-nodes.json
# validator peer list permissioned-nodes.json
# allowed nodes
scripts/init-network.sh
# bootstrap the network add-validator.sh
# add new validator remove-validator.sh
# remove validator
docker-compose.yml
# multi-node environment

## How to start the network

```bash
chmod +x scripts/*.sh
./scripts/init-network.sh
docker-compose up -d
# JERT Permissioned EVM Chain

Configuration and scripts for running the JERT Permissioned EVM network
(IBFT2 consensus, permissioned validators).

## Structure

- `config/genesis.json` – chain configuration (IBFT2, chainId, validators)
- `config/static-nodes.json` – validator peer list
- `config/permissioned-nodes.json` – allowed nodes
- `scripts/init-network.sh` – bootstrap network (Docker + Besu)
- `scripts/add-validator.sh` – template script for adding a validator
- `scripts/remove-validator.sh` – template script for removing a validator
- `docker-compose.yml` – multi-node Besu environment (5 validators + 1 observer)

> ⚠️ Never commit real private keys to this repository. Use Docker volumes or
> external key management for production.
