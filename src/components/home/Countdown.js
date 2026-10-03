"use client";

import { useEffect, useState } from "react";
import styles from "./Countdown.module.css";

// Fin de la vente flash : dimanche 23:59:59, heure de Douala (UTC+1, sans heure d'été).
function nextSundayEndDouala(now = Date.now()) {
  const douala = new Date(now + 60 * 60 * 1000); // heure locale de Douala lue via les champs UTC
  const daysToSunday = (7 - douala.getUTCDay()) % 7;
  const end = Date.UTC(douala.getUTCFullYear(), douala.getUTCMonth(), douala.getUTCDate() + daysToSunday, 23, 59, 59);
  return end - 60 * 60 * 1000;
}

function split(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { j: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export default function Countdown() {
  const [left, setLeft] = useState(null); // null au rendu serveur pour éviter un décalage d'hydratation

  useEffect(() => {
    const end = nextSundayEndDouala();
    const tick = () => setLeft(end - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const t = left === null ? null : split(left);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className={styles.wrap} role="timer" aria-label="Temps restant avant la fin de la vente flash">
      <span className={styles.label}>Se termine dans</span>
      {[
        ["j", "jours"],
        ["h", "h"],
        ["m", "min"],
        ["s", "s"],
      ].map(([k, unit]) => (
        <span key={k} className={styles.unit}>
          <span className={styles.num}>{t ? pad(t[k]) : "--"}</span>
          <span className={styles.suffix}>{unit}</span>
        </span>
      ))}
    </div>
  );
}
