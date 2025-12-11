
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function getBrowserSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected Ethereum provider (MetaMask) found.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  // Запросить доступ к аккаунту
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return signer;
}
