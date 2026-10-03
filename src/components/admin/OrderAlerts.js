"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { formatFCFA } from "@/lib/format";
import styles from "./OrderAlerts.module.css";

// Alertes « nouvelle commande » de l'espace gérant : compteur du menu à jour sans recharger,
// bulle à l'écran, petit son, nombre dans l'onglet et notification Windows/téléphone si autorisée.
const POLL_MS = 20000;
const TOAST_MS = 12000;
const Ctx = createContext(0);

export const useWaitingOrders = () => useContext(Ctx);

/** Deux notes courtes (Web Audio, aucun fichier) ; muet si le navigateur bloque le son. */
function chime() {
  try {
    const ac = new AudioContext();
    [880, 1320].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const t = ac.currentTime + i * 0.16;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
    setTimeout(() => ac.close(), 1000);
  } catch {}
}

export default function OrderAlertsProvider({ initialWaiting = 0, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [waiting, setWaiting] = useState(initialWaiting);
  const [toasts, setToasts] = useState([]);
  const cursor = useRef(null);

  // Le layout recalcule le compteur après chaque action (confirmation, annulation) : on le reprend.
  const [prevInitial, setPrevInitial] = useState(initialWaiting);
  if (prevInitial !== initialWaiting) {
    setPrevInitial(initialWaiting);
    setWaiting(initialWaiting);
  }

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const announce = useCallback(
    (orders) => {
      chime();
      setToasts((list) => [...list, ...orders].slice(-3));
      orders.forEach((o) => setTimeout(() => dismiss(o.id), TOAST_MS));
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        orders.forEach((o) => {
          const n = new Notification(`Nouvelle commande ${o.number}`, {
            body: `${o.customer_name} · ${formatFCFA(o.total)}`,
            tag: o.id,
          });
          n.onclick = () => {
            window.focus();
            router.push(`/gerant/commandes/${o.id}`);
            n.close();
          };
        });
      }
    },
    [dismiss, router],
  );

  useEffect(() => {
    let stopped = false;
    let timer;
    async function poll() {
      try {
        const q = cursor.current ? `?depuis=${encodeURIComponent(cursor.current)}` : "";
        const res = await fetch(`/gerant/alertes${q}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setWaiting(data.waiting);
          if (cursor.current && data.fresh.length) {
            announce(data.fresh);
            router.refresh(); // listes et tableau de bord à jour
          }
          cursor.current = data.cursor;
        }
      } catch {}
      if (!stopped) timer = setTimeout(poll, POLL_MS);
    }
    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [announce, router]);

  // « (2) Espace gérant » dans l'onglet, comme une pastille d'application ; réappliqué si Next.js
  // réécrit le titre (navigation, rafraîchissement).
  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(/^\(\d+\)\s*/, "");
      const want = waiting > 0 ? `(${waiting}) ${base}` : base;
      if (document.title !== want) document.title = want;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [waiting, pathname]);

  return (
    <Ctx.Provider value={waiting}>
      {children}
      {toasts.length > 0 && (
        <div className={styles.stack} role="status" aria-live="polite">
          {toasts.map((o) => (
            <div key={o.id} className={styles.toast}>
              <span className={styles.icon}>
                <Bell size={18} aria-hidden />
              </span>
              <div className={styles.body}>
                <strong>Nouvelle commande {o.number}</strong>
                <span>
                  {o.customer_name} · {formatFCFA(o.total)}
                </span>
              </div>
              <Link href={`/gerant/commandes/${o.id}`} className={styles.open} onClick={() => dismiss(o.id)}>
                Voir
              </Link>
              <button type="button" className={styles.close} onClick={() => dismiss(o.id)} aria-label="Fermer">
                <X size={16} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
}

const noopSubscribe = () => () => {};
const readPermission = () => ("Notification" in window ? Notification.permission : "unsupported");

/** Bouton du menu : autorise les notifications du système (affiché tant qu'on ne l'a pas fait). */
export function EnableAlerts({ className, labelClassName }) {
  const initial = useSyncExternalStore(noopSubscribe, readPermission, () => "unsupported");
  const [permission, setPermission] = useState(null);
  const current = permission ?? initial;
  if (current !== "default") return null;

  return (
    <button
      type="button"
      className={className}
      title="Activer les alertes"
      onClick={async () => {
        setPermission(await Notification.requestPermission());
        chime(); // aperçu du son
      }}
    >
      <Bell size={16} aria-hidden /> <span className={labelClassName}>Activer les alertes</span>
    </button>
  );
}
