
import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    jert: {
      url: process.env.JERT_RPC_URL || "http://127.0.0.1:8545",
      chainId: 7777,
      accounts: process.env.JERT_DEPLOYER_PRIVATE_KEY
        ? [process.env.JERT_DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};

export default config;
