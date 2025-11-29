import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("=== JERT Deployment Script (all contracts) ===");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // --- Load multisig owners from .env ---
  const owner1 = process.env.MULTISIG_OWNER1;
  const owner2 = process.env.MULTISIG_OWNER2;
  const owner3 = process.env.MULTISIG_OWNER3;

  if (!owner1 || !owner2 || !owner3) {
    throw new Error("MULTISIG_OWNER1/2/3 must be set in .env");
  }

  const owners = [owner1, owner2, owner3];
  const threshold = 2; // 2-of-3 multisig

  // 1) Deploy KYCRegistry
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await KYCRegistry.deploy();
  await kycRegistry.deployed();
  console.log("KYCRegistry deployed at:", kycRegistry.address);

  // 2) Deploy ComplianceGateway (uses KYCRegistry)
  const ComplianceGateway = await ethers.getContractFactory("ComplianceGateway");
  const complianceGateway = await ComplianceGateway.deploy(kycRegistry.address);
  await complianceGateway.deployed();
  console.log("ComplianceGateway deployed at:", complianceGateway.address);

  // 3) Deploy TreasuryMultisig config
  const TreasuryMultisig = await ethers.getContractFactory("TreasuryMultisig");
  const treasuryMultisig = await TreasuryMultisig.deploy(owners, threshold);
  await treasuryMultisig.deployed();
  console.log("TreasuryMultisig config deployed at:", treasuryMultisig.address);

  // 4) Deploy JERTToken, sending full supply to treasuryMultisig
  const JERTToken = await ethers.getContractFactory("JERTToken");
  const jertToken = await JERTToken.deploy(treasuryMultisig.address);
  await jertToken.deployed();
  console.log("JERTToken deployed at:", jertToken.address);

  // 5) Deploy LeaseContract (uses JERT + KYC + treasury)
  const LeaseContract = await ethers.getContractFactory("LeaseContract");
  const leaseContract = await LeaseContract.deploy(
    jertToken.address,
    kycRegistry.address,
    treasuryMultisig.address
  );
  await leaseContract.deployed();
  console.log("LeaseContract deployed at:", leaseContract.address);

  console.log("\n=== Deployment summary ===");
  console.log("KYCRegistry:        ", kycRegistry.address);
  console.log("ComplianceGateway:  ", complianceGateway.address);
  console.log("TreasuryMultisig:   ", treasuryMultisig.address);
  console.log("JERTToken:          ", jertToken.address);
  console.log("LeaseContract:      ", leaseContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

