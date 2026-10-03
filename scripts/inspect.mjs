// Inspection du rendu avec Edge piloté (protocole DevTools) : capture pleine page
// et repérage des éléments qui dépassent la largeur de l'écran.
// Usage : node scripts/inspect.mjs <url> <largeur> <hauteur> [fichier.png]
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const [url = "http://localhost:3100/", width = "390", height = "844", out] = process.argv.slice(2);
const PORT = 9333;

const profile = mkdtempSync(join(tmpdir(), "edge-td-"));
const edge = spawn(EDGE, [
  "--headless=new",
  "--disable-gpu",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const pages = (await res.json()).filter((t) => t.type === "page");
      if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Edge injoignable");
}

const ws = new WebSocket(await target());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id;
    pending.set(n, resolve);
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: Number(width),
  height: Number(height),
  deviceScaleFactor: 1,
  mobile: Number(width) < 700,
});
await send("Page.navigate", { url });
await sleep(3500);

// Éléments plus larges que l'écran (cause des débordements horizontaux)
const { result } = await send("Runtime.evaluate", {
  returnByValue: true,
  expression: `(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || getComputedStyle(el).position === "fixed") continue;
      if (r.right > vw + 1 || r.left < -1 || r.width > vw + 1) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 60),
          text: (el.textContent || "").trim().slice(0, 30),
          left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
        });
      }
    }
    return { vw, scrollWidth: document.documentElement.scrollWidth, count: out.length, items: out.slice(0, 25) };
  })()`,
});
console.log(JSON.stringify(result.value, null, 1));

if (out) {
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("capture :", out);
}

ws.close();
edge.kill();
