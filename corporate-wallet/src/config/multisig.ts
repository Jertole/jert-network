
import type { NetworkKey } from "./networks";

export const TREASURY_MULTISIG_ADDRESS: Record<NetworkKey, string> = {
  hardhat: "0x0000000000000000000000000000000000000000",
  sepolia: "АДРЕС_КОНТРАКТА_TreasuryMultisig", // вставишь после деплоя
};

export function getMultisigAddress(net: NetworkKey): string | null {
  const addr = TREASURY_MULTISIG_ADDRESS[net];
  if (!addr || addr === "0x0000000000000000000000000000000000000000") {
    return null;
  }
  return addr;
}
