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

