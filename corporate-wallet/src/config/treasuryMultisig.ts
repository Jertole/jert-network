// src/config/treasuryMultisig.ts
// Treasury Multisig configuration (canonical)

import { SUPPORTED_NETWORKS } from "./networks";

// -----------------------------
// Multisig addresses by chainId
// -----------------------------
export const TREASURY_MULTISIG_ADDRESSES: Record<number, string | null> = {
  [SUPPORTED_NETWORKS.sepolia.chainId]:
    import.meta.env.VITE_TREASURY_MULTISIG_ADDRESS || null,

  [SUPPORTED_NETWORKS.mainnet.chainId]:
    null, // not deployed yet
};

export function getTreasuryMultisigAddress(
  chainId: number
): string | null {
  return TREASURY_MULTISIG_ADDRESSES[chainId] ?? null;
}

// -----------------------------
// DEFAULT export expected by UI
// -----------------------------
export const TREASURY_MULTISIG_ADDRESS =
  getTreasuryMultisigAddress(SUPPORTED_NETWORKS.sepolia.chainId);

// -----------------------------
// Minimal ABI for dashboard usage
// -----------------------------
export const TREASURY_MULTISIG_ABI = [
  "function getOwners() view returns (address[])",
  "function requiredConfirmations() view returns (uint256)",
  "function getTransactionCount() view returns (uint256)",
  "function transactions(uint256) view returns (address to, uint256 value, bytes data, bool executed)",
  "function submitTransaction(address to, uint256 value, bytes data) returns (uint256)",
  "function confirmTransaction(uint256 txIndex)",
  "function executeTransaction(uint256 txIndex)",
];
