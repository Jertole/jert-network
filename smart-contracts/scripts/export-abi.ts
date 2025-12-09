

// scripts/export-abi.ts
import { promises as fs } from "fs";
import path from "path";
import { artifacts } from "hardhat";

async function exportABIs() {
  const outputDir = path.join(__dirname, "..", "abi");

  // ✔ Создание директории без ошибки EEXIST
  await fs.mkdir(outputDir, { recursive: true });

  const contracts = [
    "ComplianceGateway",
    "JERTToken",
    "KYCRegistry",
    "LeaseContract",
  ];

  for (const name of contracts) {
    console.log(`Reading artifact: ${name}`);
    const artifact = await artifacts.readArtifact(name);

    const filePath = path.join(outputDir, `${name}.json`);
    await fs.writeFile(filePath, JSON.stringify(artifact.abi, null, 2));

    console.log(`✅ Written ABI: ${filePath}`);
  }
}

exportABIs()
  .then(() => {
    console.log("🎉 All ABIs exported successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error exporting ABIs:", err);
    process.exit(1);
  });
