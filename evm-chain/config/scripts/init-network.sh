#!/usr/bin/env bash
set -e

echo ">>> Initialising JERT Permissioned EVM network..."

# create data dirs
mkdir -p ./data/validator1 ./data/validator2 ./data/validator3 ./data/validator4 ./data/validator5 ./data/observer

echo "Data directories created."

echo "Starting Docker containers..."
docker-compose up -d

echo "JERT network bootstrap request sent. Check container logs:"
echo "  docker logs -f jert-validator1"
