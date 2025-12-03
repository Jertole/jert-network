import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT || 4000),
  rpcUrl: process.env.JERT_RPC_URL || "http://127.0.0.1:8545",
  networkChainId: Number(process.env.JERT_CHAIN_ID || 7777)
};

// src/config.ts
import { ethers } from "ethers";
import JERT_ABI from "./abi/JERTToken.json";

const RPC_URL = process.env.RPC_URL!;
const JERT_TOKEN_ADDRESS = process.env.JERT_TOKEN_ADDRESS!;

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export function getJertContract(provider: any) {
  return new ethers.Contract(JERT_TOKEN_ADDRESS, JERT_ABI, provider);
}

/**
 * Returns current JERT price in USD.
 * For now: placeholder or pulled from external oracle.
 */
export async function getJertUsdPrice(): Promise<number> {
  // TODO: replace with real oracle integration
  // For example: read from on-chain price feed or config.
  const hardcoded = process.env.JERT_PRICE_USD;
  if (hardcoded) return Number(hardcoded);
  return 0.10; // example 0.10 USD per JERT
}
