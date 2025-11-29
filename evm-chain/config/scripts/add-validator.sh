./scripts/add-validator.sh <validator-key>
#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <ENODE_URL>."
  echo "Example: $0 enode://PUBKEY@ip:3030.3."
  exit 1
fi

ENODE="$1"

echo ">>> Adding validator to permissioned-nodes.json: $ENODE"

CONFIG_FILE="./config/permissioned-nodes.json"

# simple append (devs могут заменить на jq)
tmpfile=$(mktemp)
jq ". + [\"$ENODE\"]" "$CONFIG_FILE" > "$tmpfile"
mv "$tmpfile" "$CONFIG_FILE"

echo "Updated $CONFIG_FILE. You may need to restart validator containers."
--
