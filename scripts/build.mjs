// Genera dist/ listo para publicar: `npm run build`
// Copia la web y versiona CSS/JS con un hash del contenido (adiós a la caché vieja).
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DIST = join(ROOT, "dist");
const COPY = ["css", "js", "assets", ".nojekyll"];

const t0 = performance.now();
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

for (const item of COPY) {
  await cp(join(ROOT, item), join(DIST, item), { recursive: true }).catch((err) => {
    if (err.code !== "ENOENT") throw err;
  });
}

let html = await readFile(join(ROOT, "index.html"), "utf8");
const assets = [...html.matchAll(/(?:href|src)="((?:css|js)\/[^"?]+)(?:\?v=[^"]*)?"/g)].map((m) => m[1]);
for (const file of new Set(assets)) {
  const hash = createHash("sha256").update(await readFile(join(ROOT, file))).digest("hex").slice(0, 8);
  html = html.replace(new RegExp(`((?:href|src)="${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?:\\?v=[^"]*)?"`, "g"), `$1?v=${hash}"`);
  console.log(`  ${file.padEnd(20)} ?v=${hash}`);
}
await writeFile(join(DIST, "index.html"), html);

console.log(`\n  ✓ dist/ generado en ${Math.round(performance.now() - t0)} ms\n  Pruébalo con: npm run preview\n`);
