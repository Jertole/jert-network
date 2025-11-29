import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT || 4000),
  rpcUrl: process.env.JERT_RPC_URL || "http://127.0.0.1:8545",
  networkChainId: Number(process.env.JERT_CHAIN_ID || 7777)
};
