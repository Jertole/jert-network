export const SUPPORTED_NETWORKS = {
  sepolia: { chainId: 11155111, label: "Sepolia" },
  mainnet: { chainId: 1, label: "Mainnet" },
} as const;

export type SupportedNetworkKey = keyof typeof SUPPORTED_NETWORKS;

// ⬇️ ВСТАВЛЯЕШЬ СЮДА РЕАЛЬНЫЙ АДРЕС MULTISIG КОНТРАКТА В SEPOLIA
export const TREASURY_MULTISIG_ADDRESSES: Record<number, string | null> = {
  [SUPPORTED_NETWORKS.sepolia.chainId]: "0xSEPOLIA_MULTISIG_CONTRACT_ADDRESS",
  [SUPPORTED_NETWORKS.mainnet.chainId]: null, // пока не деплоили
};

export function getTreasuryMultisigAddress(chainId: number): string | null {
  return TREASURY_MULTISIG_ADDRESSES[chainId] ?? null;
}

export const TREASURY_MULTISIG_ABI = [
  "function getOwners() view returns (address[])",
  "function requiredConfirmations() view returns (uint256)",
  "function getTransactionCount() view returns (uint256)",
  "function transactions(uint256) view returns (address to, uint256 value, bytes data, bool executed, uint256 numConfirmations)",
];
