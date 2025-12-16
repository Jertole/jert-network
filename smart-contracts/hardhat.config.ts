import { AddressRegistry } from "../config/address-registry";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import * as dotenv from "dotenv";
dotenv.config();

const sepoliaUrl = process.env.SEPOLIA_RPC_URL || "";
const pkRaw = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const hasValidPk = /^[0-9a-fA-F]{64}$/.test(pkRaw);

const networks: any = {
  hardhat: {},
};

if (sepoliaUrl && hasValidPk) {
  networks.sepolia = {
    url: sepoliaUrl,
    accounts: [`0x${pkRaw}`],
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  
networks: {
  hardhat: {},
  sepolia: {
    url: process.env.INFURA_SEPOLIA_RPC!,
    accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
  },
},
};

export default config;
