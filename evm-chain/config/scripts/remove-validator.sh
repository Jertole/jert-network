./scripts/remove-validator.sh <validator-key>
#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <ENODE_URL>"
  exit 1
fi

ENODE="$1"

echo ">>> Removing validator from permissioned-nodes.json: $ENODE"

CONFIG_FILE="./config/permissioned-nodes.json"

tmpfile=$(mktemp)
jq "[ .[] | select(. != \"$ENODE\") ]" "$CONFIG_FILE" > "$tmpfile"
mv "$tmpfile" "$CONFIG_FILE"

echo "Updated $CONFIG_FILE. You may need to restart validator containers."
