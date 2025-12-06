import { ethers } from "ethers";
import addresses from "../../../docs/contract-addresses.json";

// Load ABIs
import TreasuryMultisigABI from "../abi/TreasuryMultisig.json";
import JERTTokenABI from "../abi/JERTToken.json";

// RPC endpoint
export const JERT_RPC_URL =
  process.env.REACT_APP_JERT_RPC_URL || "http://127.0.0.1:8545";

// Provider for read operations
export const provider = new ethers.JsonRpcProvider(JERT_RPC_URL);

// -------------------------------
//  JERT Token Contract
// -------------------------------
export function getJERTTokenContract(signerOrProvider?: any) {
  const p = signerOrProvider || provider;
  return new ethers.Contract(
    addresses.JERTToken,
    JERTTokenABI,
    p
  );
}

// -------------------------------
//  Treasury Multisig Contract
// -------------------------------
export function getTreasuryMultisigContract(signerOrProvider?: any) {
  const p = signerOrProvider || provider;
  return new ethers.Contract(
    addresses.TreasuryMultisig,
    TreasuryMultisigABI,
    p
  );
}

