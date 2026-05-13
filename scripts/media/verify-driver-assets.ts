import fs from "fs";
import path from "path";

const ASSET_DIR = "apps/web/public/assets/drivers";
const MAX_SIZE_KB = 500;

async function verify() {
  if (!fs.existsSync(ASSET_DIR)) {
    console.error("Asset directory not found.");
    return;
  }

  const drivers = fs.readdirSync(ASSET_DIR).filter(f => fs.lstatSync(path.join(ASSET_DIR, f)).isDirectory());
  console.log(`🔍 Verifying ${drivers.length} driver asset folders...`);

  let errors = 0;

  for (const driver of drivers) {
    const dir = path.join(ASSET_DIR, driver);
    const required = ["hero.webp", "casual.webp", "blur.webp"];

    for (const file of required) {
      const filePath = path.join(dir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Missing: ${driver}/${file}`);
        errors++;
        continue;
      }

      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      if (sizeKB > MAX_SIZE_KB) {
        console.warn(`🚨 OVERSPEC: ${driver}/${file} is ${sizeKB.toFixed(1)}KB (Max: ${MAX_SIZE_KB}KB)`);
        errors++;
      }
    }
  }

  if (errors === 0) {
    console.log("✅ All assets verified and within budget.");
  } else {
    console.log(`❌ Verification failed with ${errors} issues.`);
  }
}

verify().catch(console.error);
