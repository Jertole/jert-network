--import { ethers } from "hardhat";

async function main() {
  const treasury = "0x0617f015f91fb711b64deede795c2179ab8488a3"; // твой MetaMask JERT Treasury

  console.log("Deploying JERTToken to Sepolia...");
  console.log("Treasury address:", treasury);

  const JERT = await ethers.getContractFactory("JERTToken");
  const jert = await JERT.deploy(treasury);

  await jert.deployed();

  console.log("JERTToken deployed at:", jert.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
