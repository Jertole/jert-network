import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// ENV-переменные (могут быть пустыми — это не сломает CI)
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const RAW_SEPOLIA_PK = process.env.SEPOLIA_TREASURY_PRIVATE_KEY || "";

/**
 * Безопасно формируем массив аккаунтов для Sepolia.
 * Если ключ пустой или в неверном формате — возвращаем [], Hardhat НЕ падает.
 */
function getSepoliaAccounts(): string[] {
  if (!RAW_SEPOLIA_PK) {
    return [];
  }

  const pk = RAW_SEPOLIA_PK.trim();

  // ожидаем строку вида 0x + 64 hex символа
  const isValid = /^0x[0-9a-fA-F]{64}$/.test(pk);
  if (!isValid) {
    console.warn(
      "[Hardhat] SEPOLIA_TREASURY_PRIVATE_KEY is invalid or not a private key. Ignoring it."
    );
    return [];
  }

  return [pk];
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20", // если в контрактах другая pragma, можно поменять на неё
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      // если SEPOLIA_RPC_URL не задан, Hardhat просто не сможет подключиться к сети,
      // но КОМПИЛЯЦИЯ и CI всё равно пройдут
      url: SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/KEY_PLACEHOLDER",
      accounts: getSepoliaAccounts(),
      chainId: 11155111,
    },
  },
};

export default config;
