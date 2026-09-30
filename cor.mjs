// cor.mjs
import fs from "node:fs/promises";
import sharp from "sharp";

const INPUT = "input.txt";
const OUTPUT = "comandos.txt";
const WITH_HASH = true; // false = sem "#"

const TIERS = [
  { minS: 0.30, minV: 0.45, maxV: 0.95 }, // normal
  { minS: 0.15, minV: 0.20, maxV: 0.98 }, // imagens escuras/dessaturadas
  { minS: 0.00, minV: 0.06, maxV: 1.01 }, // último recurso: qualquer cor que não seja preto puro
];

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  return { s: max === 0 ? 0 : d / max, v: max };
}

function pickColor(pixels, tier) {
  const buckets = new Map();
  for (const [r, g, b] of pixels) {
    const { s, v } = rgbToHsv(r, g, b);
    if (s < tier.minS || v < tier.minV || v > tier.maxV) continue;

    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bk = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0, s: 0, v: 0 };
    bk.n++; bk.r += r; bk.g += g; bk.b += b; bk.s += s; bk.v += v;
    buckets.set(key, bk);
  }

  let best = null, bestScore = -1;
  for (const bk of buckets.values()) {
    const score = bk.n * Math.pow(bk.s / bk.n + 0.05, 1.5) * (bk.v / bk.n);
    if (score > bestScore) { bestScore = score; best = bk; }
  }
  return best;
}

async function dominantColor(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const { data } = await sharp(buf)
    .resize(80, 80, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] >= 128) pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  for (let t = 0; t < TIERS.length; t++) {
    const best = pickColor(pixels, TIERS[t]);
    if (!best) continue;
    if (t > 0) console.error(`  (fallback nível ${t + 1})`);
    const hex = [best.r, best.g, best.b]
      .map(c => Math.round(c / best.n).toString(16).padStart(2, "0"))
      .join("");
    return (WITH_HASH ? "#" : "") + hex;
  }
  throw new Error("nenhuma cor válida encontrada");
}

const lines = (await fs.readFile(INPUT, "utf8")).split(/\r?\n/).filter(l => l.trim());
const out = [];

for (const line of lines) {
  const url = line.match(/https?:\/\/\S+/)?.[0];
  const name = line.split("·")[0].trim();
  if (!url || !name) { console.error("Linha ignorada:", line); continue; }
  try {
    const hex = await dominantColor(url);
    out.push(`$embedcolor ${name}$${hex}`);
    console.error(`${name} -> ${hex}`);
  } catch (e) {
    console.error(`Erro em ${name}: ${e.message}`);
  }
}

console.log("\n" + out.join("\n"));
await fs.writeFile(OUTPUT, out.join("\n"), "utf8");