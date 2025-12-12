import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

const networks: HardhatUserConfig["networks"] = {
  hardhat: {},
};

// ⬇️ добавляем sepolia ТОЛЬКО если есть ключ
if (SEPOLIA_RPC_URL && DEPLOYER_PRIVATE_KEY) {
  networks.sepolia = {
    url: SEPOLIA_RPC_URL,
    accounts: [DEPLOYER_PRIVATE_KEY],
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks,
};

export default config;
