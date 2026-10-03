"use client";

import { useEffect, useRef, useState } from "react";
import { formatFCFA } from "@/lib/format";
import styles from "./SalesChart.module.css";

const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };
const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
const dayLabel = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const dayLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/** Pas « rond » pour les graduations (1, 2, 2,5, 5 × 10^n). */
function niceStep(max, ticks = 4) {
  const raw = Math.max(max, 1) / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
}

/** Chiffre d'affaires par jour : une seule série (aire + ligne), crosshair et info-bulle au survol. */
export default function SalesChart({ series }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = series.length;
  const step = niceStep(Math.max(...series.map((d) => d.revenue)));
  const yMax = step * 4;
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v) => PAD.top + innerH - (v / yMax) * innerH;

  const line = series.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.revenue)}`).join("");
  const area = `${line}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 80))));

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left - PAD.left) / Math.max(innerW, 1);
    setHover(Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1)))));
  }

  function onKey(e) {
    if (e.key === "ArrowRight") setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
    else if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? n) - 1));
    else return;
    e.preventDefault();
  }

  const h = hover !== null ? series[hover] : null;

  return (
    <div className={styles.wrap}>
      <div ref={wrapRef} className={styles.plot}>
        {width > 0 && (
          <svg
            width={width}
            height={H}
            role="img"
            aria-label="Chiffre d'affaires par jour. Utilise les flèches gauche et droite pour parcourir les jours."
            tabIndex={0}
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            onKeyDown={onKey}
            onBlur={() => setHover(null)}
            className={styles.svg}
          >
            {[0, 1, 2, 3, 4].map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t * step)} y2={y(t * step)} className={styles.grid} />
                <text x={PAD.left - 8} y={y(t * step)} className={styles.yTick}>
                  {compact.format(t * step)}
                </text>
              </g>
            ))}
            {series.map((d, i) =>
              i % labelEvery === 0 || i === n - 1 ? (
                <text key={d.day} x={x(i)} y={H - 8} className={styles.xTick}>
                  {dayLabel.format(new Date(d.day))}
                </text>
              ) : null,
            )}
            <path d={area} className={styles.area} />
            <path d={line} className={styles.line} />
            {h && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} className={styles.cross} />
                <circle cx={x(hover)} cy={y(h.revenue)} r={5} className={styles.dot} />
              </g>
            )}
          </svg>
        )}
        {h && (
          <div
            className={styles.tooltip}
            style={{ left: Math.min(Math.max(x(hover), 90), width - 90), top: Math.max(y(h.revenue) - 12, 0) }}
            role="status"
          >
            <strong>{formatFCFA(h.revenue)}</strong>
            <span>
              {dayLong.format(new Date(h.day))} · {h.orders} commande{h.orders > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <details className={styles.table}>
        <summary>Voir les données</summary>
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Commandes</th>
              <th>Chiffre d&apos;affaires</th>
            </tr>
          </thead>
          <tbody>
            {series.map((d) => (
              <tr key={d.day}>
                <td>{dayLong.format(new Date(d.day))}</td>
                <td>{d.orders}</td>
                <td>{formatFCFA(d.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
