
import addresses from "../../../docs/contract-addresses.json";

export const JERT_RPC_URL =
  process.env.REACT_APP_JERT_RPC_URL || "http://127.0.0.1:8545";

export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

export const CONTRACTS = {
  JERTToken: addresses.JERTToken,
  TreasuryMultisig: addresses.TreasuryMultisig,
  KYCRegistry: addresses.KYCRegistry,
  ComplianceGateway: addresses.ComplianceGateway,
  LeaseContract: addresses.LeaseContract
};
