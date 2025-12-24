import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Returns an ethers v6 Signer from the injected wallet (MetaMask).
 * Throws a readable error if MetaMask is not available.
 */
export async function getBrowserSigner(): Promise<ethers.Signer> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available. Please install or enable it.");
  }

  // Request account access if needed
  await window.ethereum.request?.({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

