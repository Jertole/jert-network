import "dotenv/config";
import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

function ensureDir(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
      throw new Error(`Path exists but is not a directory: ${dirPath}`);
    }
    return;
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

async function main() {
  console.log("🚀 Deploying JERT core contracts...");

  const [deployer, owner1, owner2, owner3] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);
  console.log("Owner 1:", owner1.address);
  console.log("Owner 2:", owner2.address);
  console.log("Owner 3:", owner3.address);

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

  // --- 3. Deploy TreasuryMultisig (canonical 2-of-3) ---
  const owners = [
    process.env.MULTISIG_OWNER_1 ?? owner1.address,
    process.env.MULTISIG_OWNER_2 ?? owner2.address,
    process.env.MULTISIG_OWNER_3 ?? owner3.address,
  ];
  const requiredConfirmations = 2; // canonical 2-of-3

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

  // --- 6. Save addresses (CI-safe) to deployments/addresses/<network>.json ---
  const rootDir = path.join(__dirname, "..");
  const deploymentsDir = path.join(rootDir, "deployments");
  const addressesDir = path.join(deploymentsDir, "addresses");

  // Ensure directories exist (and are directories, not files)
  ensureDir(deploymentsDir);
  ensureDir(addressesDir);

  const net = await ethers.provider.getNetwork();
  const networkName = network.name || `chain-${net.chainId.toString()}`;

  const outPath = path.join(addressesDir, `${networkName}.json`);

  const addresses = {
    network: {
      name: networkName,
      chainId: net.chainId.toString(),
    },
    deployer: deployer.address,
    owners,
    requiredConfirmations,
    contracts: {
      JERTToken: jertAddress,
      TreasuryMultisig: treasuryAddress,
      KYCRegistry: kycAddress,
      ComplianceGateway: gatewayAddress,
      LeaseContract: leaseAddress,
    },
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

