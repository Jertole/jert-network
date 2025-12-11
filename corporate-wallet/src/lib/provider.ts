
// src/lib/provider.ts
import { ethers } from "ethers";
import { getDefaultNetwork } from "../config/networks";

export function getJsonRpcProvider() {
  const net = getDefaultNetwork();

  if (!net.rpcUrl) {
    console.warn("[JERT] RPC URL is empty for network", net.key);
  }

  return new ethers.JsonRpcProvider(net.rpcUrl, net.chainId);
}
