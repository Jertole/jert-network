// src/config/networks.ts
// Canonical network definitions for Corporate Wallet

export const SUPPORTED_NETWORKS = {
  sepolia: {
    key: "sepolia",
    chainId: 11155111,
    label: "Sepolia",
    isTestnet: true,
  },
  mainnet: {
    key: "mainnet",
    chainId: 1,
    label: "Mainnet",
    isTestnet: false,
  },
} as const;

export type SupportedNetworkKey = keyof typeof SUPPORTED_NETWORKS;

export type SupportedNetwork = {
  key: SupportedNetworkKey;
  chainId: number;
  label: string;
  isTestnet: boolean;
};

// Default network for UI / CI
export const DEFAULT_NETWORK: SupportedNetworkKey = "sepolia";

// Backward-compatible alias (some modules expect DEFAULT_NETWORK_KEY)
export const DEFAULT_NETWORK_KEY: SupportedNetworkKey = DEFAULT_NETWORK;

/**
 * Returns the default network config (canonical getter used by UI modules).
 */
export function getDefaultNetwork(): SupportedNetwork {
  const key = DEFAULT_NETWORK;
  // SUPPORTED_NETWORKS entries are readonly literal types; normalize to SupportedNetwork
  return { ...SUPPORTED_NETWORKS[key], key } as SupportedNetwork;
}

/**
 * Optional helper: get network by key.
 */
export function getNetwork(key: SupportedNetworkKey): SupportedNetwork {
  return { ...SUPPORTED_NETWORKS[key], key } as SupportedNetwork;
}

