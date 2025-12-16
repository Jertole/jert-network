import { ethers } from "hardhat";
import { AddressRegistry } from "../config/address-registry";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);

  const treasury = AddressRegistry.treasuryMultisig;
  if (!treasury || !treasury.startsWith("0x")) {
    throw new Error("Treasury address missing/invalid in AddressRegistry");
  }
  console.log("Treasury (owner):", treasury);

  const JERT = await ethers.getContractFactory("JERTToken");
  const jert = await JERT.deploy(treasury);
  await jert.waitForDeployment();

  const addr = await jert.getAddress();
  console.log("JERTToken deployed to:", addr);

  // sanity checks
  const owner = await jert.owner();
  console.log("Owner set to:", owner);

  if (owner.toLowerCase() !== treasury.toLowerCase()) {
    throw new Error("Owner is not Treasury! Aborting.");
  }

  console.log("✅ Deployment OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
