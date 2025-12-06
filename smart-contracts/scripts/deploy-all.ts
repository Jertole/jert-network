import { ethers } from "hardhat";

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

  // --- 2. Deploy ComplianceGateway with KYCRegistry address ---
  const ComplianceGateway = await ethers.getContractFactory(
    "ComplianceGateway"
  );
  const complianceGateway = await ComplianceGateway.deploy(kycAddress);
  await complianceGateway.waitForDeployment();
  const gatewayAddress = await complianceGateway.getAddress();
  console.log("ComplianceGateway deployed at:", gatewayAddress);

  // --- 3. Deploy TreasuryMultisig (3-of-3, using ownerA, ownerB, ownerC) ---
  const owners = [ownerA.address, ownerB.address, ownerC.address];
  const threshold = 3;

  const TreasuryMultisig = await ethers.getContractFactory(
    "TreasuryMultisig"
  );
  const treasuryMultisig = await TreasuryMultisig.deploy(owners, threshold);
  await treasuryMultisig.waitForDeployment();
  const treasuryAddress = await treasuryMultisig.getAddress();
  console.log("TreasuryMultisig deployed at:", treasuryAddress);

  // --- 4. Deploy JERTToken with TreasuryMultisig as initialTreasury ---
  const JERTToken = await ethers.getContractFactory("JERTToken");

  const name = "JERT Utility Token";
  const symbol = "JERT";
  const decimals = 18;

  // Example: 1 billion JERT with 18 decimals
  const initialSupply = ethers.parseUnits("1000000000", decimals);

  const jertToken = await JERTToken.deploy(
    name,
    symbol,
    decimals,
    treasuryAddress,
    initialSupply
  );
  await jertToken.waitForDeployment();
  const jertAddress = await jertToken.getAddress();
  console.log("JERTToken deployed at:", jertAddress);

  // --- 5. Deploy LeaseContract ---
  const LeaseContract = await ethers.getContractFactory("LeaseContract");
  const leaseContract = await LeaseContract.deploy();
  await leaseContract.waitForDeployment();
  const leaseAddress = await leaseContract.getAddress();
  console.log("LeaseContract deployed at:", leaseAddress);

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
--
