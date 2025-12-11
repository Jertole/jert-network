// src/config/networks.ts
export type NetworkKey = "hardhat" | "sepolia";

export interface NetworkConfig {
  key: NetworkKey;
  label: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl?: string;
}

export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  hardhat: {
    key: "hardhat",
    label: "Localhost (Hardhat)",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
  },
  sepolia: {
    key: "sepolia",
    label: "Sepolia (Alchemy/Infura)",
    chainId: 11155111,
    // Вставишь свой URL от Alchemy/Infura в .env
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || "",
    explorerUrl: "https://sepolia.etherscan.io",
  },
};

export const DEFAULT_NETWORK_KEY: NetworkKey = "hardhat";

export function getDefaultNetwork(): NetworkConfig {
  const envKey = (import.meta.env.VITE_DEFAULT_NETWORK || "hardhat") as NetworkKey;
  return NETWORKS[envKey] ?? NETWORKS.hardhat;
}
