
// smart-contracts/scripts/export-abi.ts
import { artifacts } from "hardhat";
import { promises as fs } from "fs";
import path from "path";

async function exportABIs() {
  // Папка, куда складываем ABI
  const outputDir = path.join(__dirname, "..", "abi");

  // Создаём папку, но без ошибки, если она уже есть
  await fs.mkdir(outputDir, { recursive: true });

  // Список контрактов, ABI которых нужно выгружать
  const CONTRACTS = [
    "JERTToken",
    "ComplianceGateway",
    "KYCRegistry",
    "LeaseContract",
    "TreasuryMultisig",
  ];

  for (const name of CONTRACTS) {
    const artifact = await artifacts.readArtifact(name);
    const abi = artifact.abi;

    const outFile = path.join(outputDir, `${name}.json`);
    await fs.writeFile(outFile, JSON.stringify(abi, null, 2), "utf-8");

    console.log(`✅ ABI for ${name} written to ${outFile}`);
  }
}

exportABIs()
  .then(() => {
    console.log("✅ All ABIs exported successfully");
  })
  .catch((err) => {
    console.error("❌ Error exporting ABIs:", err);
    process.exit(1);
  });
