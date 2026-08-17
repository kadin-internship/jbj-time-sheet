import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { BRAND_COLORS } from "../lib/constants/brand";

const OUT_DIR = "public/icons";
mkdirSync(OUT_DIR, { recursive: true });

function svgIcon(size: number, cornerRadius: number): Buffer {
  const fontSize = Math.round(size * 0.38);
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="${BRAND_COLORS.maroon}" />
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif" font-weight="700"
        font-size="${fontSize}" fill="${BRAND_COLORS.white}">JBJ</text>
    </svg>
  `;
  return Buffer.from(svg);
}

async function main() {
  await sharp(svgIcon(192, 24)).png().toFile(`${OUT_DIR}/icon-192.png`);
  await sharp(svgIcon(512, 64)).png().toFile(`${OUT_DIR}/icon-512.png`);
  // Apple touch icons should not have rounded corners baked in (iOS applies its own mask).
  await sharp(svgIcon(180, 0)).png().toFile(`${OUT_DIR}/apple-touch-icon.png`);
  console.log("Generated icons in public/icons/");
}

main();
