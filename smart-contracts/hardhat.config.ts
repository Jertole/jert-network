
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // локальная/дев сеть JERT (private EVM)
    jert: {
      url: "http://127.0.0.1:8545", // поменяете под свой RPC gateway
      chainId: 7777
      // accounts: [ "0x..." ]  // добавят девы через .env
    }
  }
};

