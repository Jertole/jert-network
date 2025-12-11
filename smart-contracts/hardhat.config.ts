
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const SEPOLIA_TREASURY_PRIVATE_KEY =
  process.env.SEPOLIA_TREASURY_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.20", // или та версия, что у тебя в контрактах
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: SEPOLIA_TREASURY_PRIVATE_KEY
        ? [SEPOLIA_TREASURY_PRIVATE_KEY]
        : [],
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;

