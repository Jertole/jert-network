
import { ethers } from "hardhat";

async function main() {
  // ✅ Replace with your 3 owner EOAs (public addresses only)
  const owners = [
    "0xOWNER1...",
    "0xOWNER2...",
    "0xOWNER3...",
  ];

  const requiredConfirmations = 2;

  const Multisig = await ethers.getContractFactory("TreasuryMultisig");
  const multisig = await Multisig.deploy(owners, requiredConfirmations);

  await multisig.waitForDeployment();

  const addr = await multisig.getAddress();
  console.log("TreasuryMultisig deployed to:", addr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
