
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

type AddrFile = {
  network?: string;
  chainId?: number;
  contracts?: {
    TreasuryMultisig?: { address?: string };
    JERTToken?: { address?: string };
    KYCRegistry?: { address?: string };
    ComplianceGateway?: { address?: string };
  };
};

function requireAddress(label: string, addr?: string) {
  if (!addr || !ethers.isAddress(addr) || addr === ethers.ZeroAddress) {
    throw new Error(`Missing/invalid address for ${label}: "${addr ?? ""}"`);
  }
  return addr;
}

async function main() {
  // Default: docs/contract-addresses.json at repo root
  const fileFromEnv = process.env.ADDRESSES_FILE;
  const filePath = fileFromEnv
    ? path.resolve(fileFromEnv)
    : path.resolve(__dirname, "..", "..", "docs", "contract-addresses.json");

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Addresses file not found: ${filePath}\n` +
        `Tip: set ADDRESSES_FILE=path/to/contract-addresses.json`
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const cfg = JSON.parse(raw) as AddrFile;

  const treasury = requireAddress(
    "TreasuryMultisig",
    cfg.contracts?.TreasuryMultisig?.address
  );
  const tokenAddr = requireAddress("JERTToken", cfg.contracts?.JERTToken?.address);
  const kycAddr = requireAddress("KYCRegistry", cfg.contracts?.KYCRegistry?.address);
  const gwAddr = requireAddress(
    "ComplianceGateway",
    cfg.contracts?.ComplianceGateway?.address
  );

  // Attach contracts (assumes artifacts exist in this package)
  const JERT = await ethers.getContractAt("JERTToken", tokenAddr);
  const KYC = await ethers.getContractAt("KYCRegistry", kycAddr);
  const GW = await ethers.getContractAt("ComplianceGateway", gwAddr);

  const [chainId, net] = await Promise.all([
    ethers.provider.getNetwork().then((n) => Number(n.chainId)),
    ethers.provider.getNetwork().then((n) => n.name),
  ]);

  console.log("== JERT Network Post-Deploy Check ==");
  console.log(`Network: ${net} (chainId=${chainId})`);
  console.log(`TreasuryMultisig: ${treasury}`);
  console.log(`JERTToken:        ${tokenAddr}`);
  console.log(`KYCRegistry:      ${kycAddr}`);
  console.log(`ComplianceGW:     ${gwAddr}`);
  console.log("");

  // Owner checks (must be TreasuryMultisig)
  const tokenOwner = await (JERT as any).owner();
  const kycOwner = await (KYC as any).owner();
  const gwOwner = await (GW as any).owner();

  if (tokenOwner.toLowerCase() !== treasury.toLowerCase()) {
    throw new Error(`Owner mismatch: JERTToken.owner=${tokenOwner} expected=${treasury}`);
  }
  if (kycOwner.toLowerCase() !== treasury.toLowerCase()) {
    throw new Error(`Owner mismatch: KYCRegistry.owner=${kycOwner} expected=${treasury}`);
  }
  if (gwOwner.toLowerCase() !== treasury.toLowerCase()) {
    throw new Error(
      `Owner mismatch: ComplianceGateway.owner=${gwOwner} expected=${treasury}`
    );
  }

  // Supply checks
  const maxSupply = await (JERT as any).MAX_SUPPLY();
  const totalSupply = await JERT.totalSupply();
  const treasuryBal = await JERT.balanceOf(treasury);

  if (totalSupply !== maxSupply) {
    throw new Error(`Supply mismatch: totalSupply=${totalSupply} MAX_SUPPLY=${maxSupply}`);
  }
  if (treasuryBal !== maxSupply) {
    throw new Error(`Treasury balance mismatch: bal=${treasuryBal} MAX_SUPPLY=${maxSupply}`);
  }

  // ComplianceGateway points to KYCRegistry (public var)
  const gwRegistry = await (GW as any).kycRegistry();
  if (gwRegistry.toLowerCase() !== kycAddr.toLowerCase()) {
    throw new Error(
      `Gateway registry mismatch: ComplianceGateway.kycRegistry=${gwRegistry} expected=${kycAddr}`
    );
  }

  console.log("✅ DEPLOYMENT OK");
  console.log(" - owners: token/kyc/gateway -> TreasuryMultisig");
  console.log(" - supply: totalSupply == MAX_SUPPLY and Treasury holds MAX_SUPPLY");
  console.log(" - gateway: kycRegistry wired correctly");
}

main().catch((e) => {
  console.error("❌ DEPLOYMENT FAILED");
  console.error(e);
  process.exit(1);
});
