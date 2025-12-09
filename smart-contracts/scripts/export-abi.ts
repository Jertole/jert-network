
import fs from "fs";
import path from "path";

const rootDir = path.join(__dirname, "..");
const artifactsDir = path.join(rootDir, "artifacts", "contracts");
const abiDir = path.join(rootDir, "abi");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function exportABIs() {
  ensureDir(abiDir);

  function processDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        processDir(fullPath);
        continue;
      }

      if (!entry.name.endsWith(".json")) continue;

      const artifact = JSON.parse(fs.readFileSync(fullPath, "utf8"));

      if (!artifact.contractName || !artifact.abi) continue;

      const abiPath = path.join(abiDir, `${artifact.contractName}.json`);
      fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));

      console.log(`✔ Exported ABI: ${artifact.contractName}.json`);
    }
  }

  processDir(artifactsDir);
  console.log("🎉 ABI export completed.");
}

exportABIs();
