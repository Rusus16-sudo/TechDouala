// Captures pleine page avec Edge piloté (protocole DevTools), en émulant l'ordinateur et le mobile.
// Usage : node scripts/captures.mjs [dossier] [adresse de base]
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = process.argv[2] ?? "captures";
const BASE = process.argv[3] ?? "http://localhost:3100";
const PORT = 9334;

const PAGES = [
  ["accueil", "/"],
  ["catalogue", "/categories/smartphones"],
  ["fiche-produit", "/produit/galaxy-s25-ultra"],
  ["ventes-flash", "/ventes-flash"],
  ["credit", "/credit"],
  ["panier", "/panier"],
  ["commande", "/commande"],
  ["connexion", "/connexion"],
  ["categories", "/categories"],
];

const DEVICES = [
  ["bureau", 1440, 900, false],
  ["mobile", 390, 844, true],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), "edge-td-"));
const edge = spawn(EDGE, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "about:blank",
]);

async function targetUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const pages = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).filter((t) => t.type === "page");
      if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Edge injoignable");
}

const ws = new WebSocket(await targetUrl());
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id;
    pending.set(n, resolve);
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Page.enable");

for (const [device, w, h, mobile] of DEVICES) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
  for (const [name, path] of PAGES) {
    await send("Page.navigate", { url: `${BASE}${path}` });
    await sleep(2200);
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    const file = `${OUT}/${name}-${device}.png`;
    writeFileSync(file, Buffer.from(shot.data, "base64"));
    console.log(`✓ ${file}`);
  }
}

ws.close();
edge.kill();
