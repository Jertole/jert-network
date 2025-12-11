// src/config/jertToken.ts
import type { NetworkKey } from "./networks";

export const JERT_TOKEN_ADDRESS: Record<NetworkKey, string> = {
  hardhat: "0x0000000000000000000000000000000000000000", // ЗАМЕНИ на адрес локального деплоя
  sepolia: "0x0000000000000000000000000000000000000000", // ЗАМЕНИ на реальный адрес в Sepolia
};

export function getJertTokenAddress(net: NetworkKey): string | null {
  const addr = JERT_TOKEN_ADDRESS[net];
  if (!addr || addr === "0x0000000000000000000000000000000000000000") {
    return null;
  }
  return addr;
}

