import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  const treasury = process.env.TREASURY_ADDRESS;
  if (!treasury) throw new Error("Missing TREASURY_ADDRESS in .env");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Treasury:", treasury);

  const JERT = await ethers.getContractFactory("JERTToken");
  const jert = await JERT.deploy(treasury);

  await jert.waitForDeployment();
  const addr = await jert.getAddress();

  console.log("JERTToken deployed to:", addr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
