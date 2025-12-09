
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying JERT core contracts...");

  const [deployer, ownerA, ownerB, ownerC] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);
  console.log("Owner A:", ownerA.address);
  console.log("Owner B:", ownerB.address);
  console.log("Owner C:", ownerC.address);

  // --- 1. Deploy KYCRegistry ---
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await KYCRegistry.deploy();
  await kycRegistry.waitForDeployment();
  const kycAddress = await kycRegistry.getAddress();
  console.log("KYCRegistry deployed at:", kycAddress);

  // --- 2. Deploy ComplianceGateway ---
  const ComplianceGateway = await ethers.getContractFactory("ComplianceGateway");
  const gateway = await ComplianceGateway.deploy(kycAddress);
  await gateway.waitForDeployment();
  const gatewayAddress = await gateway.getAddress();
  console.log("ComplianceGateway deployed at:", gatewayAddress);

  // --- 3. Deploy TreasuryMultisig ---
  const owners = [ownerA.address, ownerB.address, ownerC.address];
  const requiredConfirmations = 3;
  const TreasuryMultisig = await ethers.getContractFactory("TreasuryMultisig");
  const treasury = await TreasuryMultisig.deploy(owners, requiredConfirmations);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("TreasuryMultisig deployed at:", treasuryAddress);

  // --- 4. Deploy JERTToken ---
  const JERTToken = await ethers.getContractFactory("JERTToken");
  const token = await JERTToken.deploy(treasuryAddress);
  await token.waitForDeployment();
  const jertAddress = await token.getAddress();
  console.log("JERTToken deployed at:", jertAddress);

  // --- 5. Deploy LeaseContract ---
  const LeaseContract = await ethers.getContractFactory("LeaseContract");
  const lease = await LeaseContract.deploy();
  await lease.waitForDeployment();
  const leaseAddress = await lease.getAddress();
  console.log("LeaseContract deployed at:", leaseAddress);

  // --- 6. Save addresses to deployments/addresses.json ---
  const rootDir = path.join(__dirname, "..");
  const deploymentsDir = path.join(rootDir, "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const outPath = path.join(deploymentsDir, "addresses.json");
  const addresses = {
    network: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    owners,
    contracts: {
      JERTToken: jertAddress,
      TreasuryMultisig: treasuryAddress,
      KYCRegistry: kycAddress,
      ComplianceGateway: gatewayAddress,
      LeaseContract: leaseAddress
    }
  };

  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2), "utf-8");
  console.log("\n📄 Saved contract addresses to:", outPath);

  console.log("\n✅ Deployment summary:");
  console.log("  JERTToken:         ", jertAddress);
  console.log("  TreasuryMultisig:  ", treasuryAddress);
  console.log("  KYCRegistry:       ", kycAddress);
  console.log("  ComplianceGateway: ", gatewayAddress);
  console.log("  LeaseContract:     ", leaseAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
