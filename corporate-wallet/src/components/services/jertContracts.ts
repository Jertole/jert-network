import { ethers } from "ethers";
import addresses from "../../../docs/contract-addresses.json";

// ABIs
import TreasuryMultisigABI from "../../abi/TreasuryMultisig.json";
import JERTTokenABI from "../../abi/JERTToken.json";

// -------------------------------
//  RPC / Providers
// -------------------------------
export const JERT_RPC_URL =
  (import.meta as any).env?.VITE_JERT_RPC_URL ||
  (import.meta as any).env?.REACT_APP_JERT_RPC_URL ||
  "http://127.0.0.1:8545";

// read-only provider
export const provider = new ethers.JsonRpcProvider(JERT_RPC_URL);

// optional browser provider (MetaMask) – на будущее
export async function getBrowserProvider() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No injected wallet provider (MetaMask) found");
  }
  // ethers v6
  const browserProvider = new ethers.BrowserProvider(
    (window as any).ethereum
  );
  return browserProvider;
}

// -------------------------------
//  JERT Token Contract
// -------------------------------
export function getJERTTokenContract(signerOrProvider?: any) {
  const p = signerOrProvider || provider;
  return new ethers.Contract(addresses.JERTToken, JERTTokenABI as any, p);
}

// -------------------------------
//  Treasury Multisig Contract
// -------------------------------
export function getTreasuryMultisigContract(signerOrProvider?: any) {
  const p = signerOrProvider || provider;
  return new ethers.Contract(
    addresses.TreasuryMultisig,
    TreasuryMultisigABI as any,
    p
  );
}
