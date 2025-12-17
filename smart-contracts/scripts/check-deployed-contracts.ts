import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Find docs/contract-addresses.json by walking up from CWD
 */
function findContractAddressesJson(): string {
  const target = path.join("docs", "contract-addresses.json");
  let dir = process.cwd();

  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, target);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error(`Cannot find ${target}. Run from repo root or smart-contracts/.`);
}

function isAddressLike(v: unknown): v is string {
  return typeof v === "string" && /^0x[a-fA-F0-9]{40}$/.test(v);
}

/**
 * Pick address from:
 *  - string: "0x..."
 *  - object: { address: "0x..." }
 *  - nested aliases
 */
function pickAddress(obj: any, keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;

  for (const k of keys) {
    const v = obj[k];
    if (isAddressLike(v)) return v;
    if (v && typeof v === "object" && isAddressLike(v.address)) return v.address;
  }
  return undefined;
}

async function main() {
  const jsonPath = findContractAddressesJson();
  const raw = fs.readFileSync(jsonPath, "utf8");
  const addresses = JSON.parse(raw);

  const net = network.name; // e.g. "sepolia"

  /**
   * Supported JSON shapes:
   *  A) { "sepolia": {...} }
   *  B) { "networks": { "sepolia": {...} } }
   *  C) { "network": "sepolia", "contracts": {...} }   <-- your canonical format
   */
  const netBlock =
    addresses?.[net] ??
    addresses?.networks?.[net] ??
    addresses?.[net.toLowerCase()] ??
    (addresses?.contracts ? addresses : undefined) ??
    addresses;

  if (!netBlock) {
    throw new Error(`No network block found for "${net}" inside ${jsonPath}.`);
  }

  // If canonical format → work inside .contracts
  const scope = (netBlock as any).contracts ?? netBlock;

  const jertToken =
    pickAddress(scope, ["JERTToken", "JertToken", "jertToken", "token", "JERT_TOKEN"]) ??
    pickAddress(addresses?.contracts ?? addresses, ["JERTToken", "JertToken", "jertToken", "token", "JERT_TOKEN"]);

  const treasuryMultisig =
    pickAddress(scope, ["TreasuryMultisig", "treasuryMultisig", "multisig", "TREASURY_MULTISIG"]) ??
    pickAddress(addresses?.contracts ?? addresses, ["TreasuryMultisig", "treasuryMultisig", "multisig", "TREASURY_MULTISIG"]);

  if (!jertToken) {
    throw new Error(`JERTToken address not found in ${jsonPath} for network "${net}".`);
  }
  if (!treasuryMultisig) {
    throw new Error(`TreasuryMultisig address not found in ${jsonPath} for network "${net}".`);
  }

  console.log(`Network: ${net}`);
  console.log(`Using addresses from: ${jsonPath}`);
  console.log(`JERTToken: ${jertToken}`);
  console.log(`TreasuryMultisig: ${treasuryMultisig}`);
  console.log("—");

  // ===== Token checks =====
  const token = await ethers.getContractAt("JERTToken", jertToken);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.totalSupply(),
  ]);

  console.log("✓ JERTToken OK");
  console.log(`  name: ${name}`);
  console.log(`  symbol: ${symbol}`);
  console.log(`  decimals: ${decimals}`);
  console.log(`  totalSupply: ${totalSupply.toString()}`);
  console.log("—");

  // ===== Multisig checks =====
  const ms = await ethers.getContractAt("TreasuryMultisig", treasuryMultisig);

  let owners: string[] = [];
  try {
    owners = await (ms as any).getOwners();
  } catch {
    // fallback: owners(i)
    for (let i = 0; i < 10; i++) {
      try {
        const o = await (ms as any).owners(i);
        if (isAddressLike(o)) owners.push(o);
      } catch {
        break;
      }
    }
  }

  let threshold: any = undefined;
  const tryFns = ["quorum", "required", "threshold", "getThreshold"];
  for (const fn of tryFns) {
    try {
      threshold = await (ms as any)[fn]();
      break;
    } catch {}
  }

  console.log("✓ TreasuryMultisig OK");
  if (owners.length) console.log(`  owners: ${owners.join(", ")}`);
  if (threshold !== undefined) console.log(`  threshold: ${threshold.toString?.() ?? String(threshold)}`);
  console.log("—");

  console.log("ALL GOOD ✓");
}

main().catch((e) => {
  console.error("FAILED ✗");
  console.error(e?.message ?? e);
  process.exitCode = 1;
});

