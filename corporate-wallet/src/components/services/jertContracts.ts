
import { ethers } from "ethers";

export interface MultisigInfo {
  owners: string[];
  threshold: number;
}

// RPC и адреса читаем из .env (Vite)
const RPC_URL =
  import.meta.env.VITE_EVM_RPC_URL || "http://localhost:8545";

const JERT_TOKEN_ADDRESS =
  import.meta.env.VITE_JERT_TOKEN_ADDRESS ||
  "0x0000000000000000000000000000000000000000"; // TODO: поменять на реальный адрес

const TREASURY_MULTISIG_ADDRESS =
  import.meta.env.VITE_TREASURY_MULTISIG_ADDRESS ||
  "0x0000000000000000000000000000000000000000"; // TODO: поменять на реальный адрес

// Минимальный ABI для ERC-20 JERT
const jertTokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Минимальный ABI для TreasuryMultisig
//
// Предполагаем, что контракт имеет либо:
//   function getOwners() view returns (address[])
//   function threshold() view returns (uint256)
// или классическую Gnosis-схему:
//   function getOwners() view returns (address[])
//   function getThreshold() view returns (uint256)
const treasuryMultisigAbi = [
  "function getOwners() view returns (address[])",
  "function threshold() view returns (uint256)",
  "function getThreshold() view returns (uint256)",
];

let provider: ethers.JsonRpcProvider | null = null;
let jertToken: ethers.Contract | null = null;
let treasuryMultisig: ethers.Contract | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

function getJertToken(): ethers.Contract {
  if (!jertToken) {
    jertToken = new ethers.Contract(
      JERT_TOKEN_ADDRESS,
      jertTokenAbi,
      getProvider()
    );
  }
  return jertToken;
}

function getTreasury(): ethers.Contract {
  if (!treasuryMultisig) {
    treasuryMultisig = new ethers.Contract(
      TREASURY_MULTISIG_ADDRESS,
      treasuryMultisigAbi,
      getProvider()
    );
  }
  return treasuryMultisig;
}

/**
 * Возвращает список владельцев и порог подписей для Multisig-казначейства.
 */
export async function getMultisigInfo(): Promise<MultisigInfo> {
  const contract = getTreasury();

  // 1) владельцы
  const owners: string[] = await contract.getOwners();

  // 2) порог: пробуем threshold(), если нет — getThreshold()
  let threshold: number;
  try {
    const raw = await contract.threshold();
    threshold = Number(raw);
  } catch {
    const raw = await contract.getThreshold();
    threshold = Number(raw);
  }

  return { owners, threshold };
}

/**
 * Возвращает баланс казначейства в JERT (double, уже с учётом decimals).
 *
 * Логика:
 *  - читаем decimals и balanceOf(TREASURY_MULTISIG_ADDRESS)
 *  - делим на 10**decimals
 */
export async function getTreasuryBalance(): Promise<number> {
  const token = getJertToken();

  const [rawBalance, decimals] = await Promise.all([
    token.balanceOf(TREASURY_MULTISIG_ADDRESS),
    token.decimals(),
  ]);

  const denom = 10 ** Number(decimals);
  const asNumber = Number(ethers.toBigInt(rawBalance)) / denom;

  return asNumber;
}
