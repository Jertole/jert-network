
// scripts/export-abi.ts
import { promises as fs } from "fs";
import path from "path";
import { artifacts } from "hardhat";

async function exportABIs() {
  // Папка, куда складываем ABI
  const outputDir = path.join(__dirname, "..", "abi");

  // Создаём каталог, если его нет
  await fs.mkdir(outputDir, { recursive: true });

  // Список контрактов, ABI которых нужно выгрузить
  const contracts = [
    "ComplianceGateway",
    "JERTToken",
    "KYCRegistry",
    "LeaseContract",
  ];

  for (const name of contracts) {
    const artifact = await artifacts.readArtifact(name);
    const abi = artifact.abi;

    const filePath = path.join(outputDir, `${name}.json`);

    await fs.writeFile(filePath, JSON.stringify(abi, null, 2), "utf8");
    console.log(`✅ ABI for ${name} written to ${filePath}`);
  }
}

exportABIs()
  .then(() => {
    console.log("🎉 All ABIs exported successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error exporting ABIs:", error);
    process.exit(1);
  });
