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
