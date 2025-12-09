
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT || 4000),
  rpcUrl: process.env.JERT_RPC_URL || process.env.RPC_URL || "http://127.0.0.1:8545",
  networkChainId: Number(process.env.JERT_CHAIN_ID || 7777),
};

let _provider: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(config.rpcUrl);
  }
  return _provider;
}

const JERT_TOKEN_ADDRESS = process.env.JERT_TOKEN_ADDRESS;

// минимальный ABI
const JERT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export function getJertContract(provider?: ethers.Provider) {
  if (!JERT_TOKEN_ADDRESS) {
    throw new Error("JERT_TOKEN_ADDRESS env var not set");
  }
  const p = provider ?? getProvider();
  return new ethers.Contract(JERT_TOKEN_ADDRESS, JERT_ABI, p);
}

/**
 * Цена JERT в USD (пока заглушка или из ENV).
 */
export async function getJertUsdPrice(): Promise<number> {
  const hardcoded = process.env.JERT_PRICE_USD;
  if (hardcoded) return Number(hardcoded);
  return 0.1; // 0.10 USD за JERT по умолчанию
}
