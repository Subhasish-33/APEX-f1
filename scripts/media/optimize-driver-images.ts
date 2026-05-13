import sharp from "sharp";
import fs from "fs";
import path from "path";

const SOURCE_DIR = "scratch/driver_uploads";
const TARGET_DIR = "apps/web/public/assets/drivers";

const DRIVER_MAPPING: Record<string, string> = {
  max: "verstappen",
  lewis: "hamilton",
  charles: "leclerc",
  lando: "norris",
  sergio: "perez",
  carlos: "sainz",
  george: "russell",
  geoge: "russell", // typo fix
  oscar: "piastri",
  fernando: "alonso",
  lance: "stroll",
  alexander: "albon",
  pierre: "gasly",
  esteban: "ocon",
  nico: "hulkenberg",
  valtteri: "bottas",
  liam: "lawson",
  kimi: "antonelli",
  oliver: "bearman",
  franco: "colapinto",
  gabriel: "bortoleto",
  gabrial: "bortoleto", // typo fix
  isack: "hadjar",
  iscak: "hadjar", // typo fix
  arvind: "arvind", // dummy/custom
};

async function optimize() {
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Source directory ${SOURCE_DIR} not found. Please upload images there.`);
    return;
  }

  const files = fs.readdirSync(SOURCE_DIR);
  console.log(`🚀 Optimizing ${files.length} files...`);

  for (const file of files) {
    if (!file.match(/\.(jpg|jpeg|png|webp|avif)$/i)) continue;

    const [uploadName, typeWithExt] = file.toLowerCase().split("_");
    const typeRaw = typeWithExt.split(".")[0]; 
    
    // Normalize type: headshot -> hero
    const type = typeRaw === "headshot" ? "hero" : 
                 typeRaw === "causal" ? "casual" : typeRaw; // fix "causal" typo too

    const driverRef = DRIVER_MAPPING[uploadName] || uploadName;
    
    const driverDir = path.join(TARGET_DIR, driverRef);
    if (!fs.existsSync(driverDir)) {
      fs.mkdirSync(driverDir, { recursive: true });
    }

    const inputPath = path.join(SOURCE_DIR, file);
    const outputPath = path.join(driverDir, `${type}.webp`);
    const blurPath = path.join(driverDir, `blur.webp`);

    console.log(`Processing ${uploadName} -> ${driverRef} (${type})...`);

    try {
      // 1. Optimize Main Image
      let pipeline = sharp(inputPath).webp({ quality: 80 });
      
      if (type === "hero") {
        pipeline = pipeline.resize({ height: 1400, withoutEnlargement: true });
      } else if (type === "casual") {
        pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
      }

      await pipeline.toFile(outputPath);

      // 2. Generate Blur Placeholder (only for hero usually, or both?)
      if (type === "hero") {
        await sharp(inputPath)
          .resize(20)
          .webp({ quality: 20 })
          .toFile(blurPath);
      }

      console.log(`✅ ${driverRef} ${type} optimized.`);
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err);
    }
  }
}

optimize().catch(console.error);
