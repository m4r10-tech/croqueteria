// Servidor estático mínimo, sin dependencias.
//   npm run dev      → sirve el código fuente (puerto 5173)
//   npm run preview  → sirve la carpeta dist/ generada por `npm run build` (puerto 4173)
// Uso: node scripts/serve.mjs <carpeta> [puerto]   ·   PORT=xxxx y HOST=0.0.0.0 también valen.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ROOT = resolve(PROJECT, process.argv[2] || ".");
const START_PORT = Number(process.env.PORT) || Number(process.argv[3]) || 4173;
const LABEL = ROOT === PROJECT ? "dev" : "preview";

try {
  await stat(join(ROOT, "index.html"));
} catch {
  console.error(`\n  No existe ${join(ROOT, "index.html")}.\n  Ejecuta primero: npm run build\n`);
  process.exit(1);
}
const HOST = process.env.HOST || "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".md": "text/markdown; charset=utf-8"
};

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^([/\\])+/, "");
  let file = join(ROOT, clean);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null; // fuera de la carpeta
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, "index.html");
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  try {
    const file = await resolveFile(req.url || "/");
    if (!file) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 · No encontrado");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": LABEL === "dev" ? "no-store" : "no-cache"
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("500 · Error del servidor");
    console.error(err);
  }
});

let port = START_PORT;
server.on("error", (err) => {
  if (err.code === "EADDRINUSE" && port < START_PORT + 20) {
    port++;
    server.listen(port, HOST);
  } else {
    console.error(err.message);
    process.exit(1);
  }
});
server.on("listening", () => {
  console.log(`\n  Croquetería · ${LABEL}\n\n  ➜  Local:   http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${port}/\n  ➜  Carpeta: ${ROOT}\n`);
  if (port !== START_PORT) console.log(`  (el puerto ${START_PORT} estaba ocupado)\n`);
});
server.listen(port, HOST);
