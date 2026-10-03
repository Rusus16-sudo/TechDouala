"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { PRICE_RANGES } from "@/lib/listing";
import styles from "./FiltersPanel.module.css";

// Paramètres conservés quand on change un filtre (la page revient à 1).
const KEEP = ["q", "tri"];

/**
 * Filtres de la liste. Chaque changement met à jour l'URL (partageable, retour arrière OK).
 * Sur mobile, le panneau s'ouvre en tiroir via le bouton « Filtres ».
 */
export default function FiltersPanel({ facets, hide = [], activeCount }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function onChange(e) {
    const next = new URLSearchParams();
    KEEP.forEach((k) => params.get(k) && next.set(k, params.get(k)));
    for (const [k, v] of new FormData(e.currentTarget)) if (v) next.append(k, v);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const checked = (key, value) => params.getAll(key).includes(value);

  const groups = [
    { key: "marque", title: "Marque", options: facets.marque },
    { key: "etat", title: "État", options: facets.etat },
    { key: "stockage", title: "Stockage", options: facets.stockage },
    { key: "ram", title: "Mémoire RAM", options: facets.ram },
  ].filter((g) => !hide.includes(g.key) && g.options.length > 1);

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        <SlidersHorizontal size={18} aria-hidden />
        Filtres
        {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
      </button>

      <div className={`${styles.backdrop} ${open ? styles.show : ""}`} onClick={() => setOpen(false)} aria-hidden />

      <aside className={`${styles.panel} ${open ? styles.open : ""}`} aria-label="Filtres">
        <div className={styles.head}>
          <p className={styles.title}>Filtres</p>
          <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Fermer les filtres">
            <X size={20} />
          </button>
        </div>

        {/* La clé force la resynchronisation des cases quand l'URL change ailleurs (pastilles, retour arrière). */}
        <form key={params.toString()} onChange={onChange} onSubmit={(e) => e.preventDefault()} className={styles.form}>
          {groups.map(({ key, title, options }) => (
            <fieldset key={key} className={styles.group}>
              <legend>{title}</legend>
              {options.map((o) => (
                <label key={o.value} className={styles.check}>
                  <input type="checkbox" name={key} value={o.value} defaultChecked={checked(key, o.value)} />
                  <span className={styles.box} aria-hidden />
                  <span className={styles.label}>{o.label}</span>
                  <span className={styles.count}>{o.count}</span>
                </label>
              ))}
            </fieldset>
          ))}

          {!hide.includes("prix") && (
            <fieldset className={styles.group}>
              <legend>Prix</legend>
              <label className={styles.check}>
                <input type="radio" name="prix" value="" defaultChecked={!params.get("prix")} />
                <span className={`${styles.box} ${styles.radio}`} aria-hidden />
                <span className={styles.label}>Tous les prix</span>
              </label>
              {PRICE_RANGES.map((r) => (
                <label key={r.value} className={styles.check}>
                  <input type="radio" name="prix" value={r.value} defaultChecked={params.get("prix") === r.value} />
                  <span className={`${styles.box} ${styles.radio}`} aria-hidden />
                  <span className={styles.label}>{r.label}</span>
                </label>
              ))}
            </fieldset>
          )}

          <fieldset className={styles.group}>
            <legend>Autres</legend>
            {facets.has5G && !hide.includes("reseau") && (
              <label className={styles.switch}>
                <span>Compatible 5G</span>
                <input type="checkbox" name="reseau" value="5g" defaultChecked={params.get("reseau") === "5g"} />
                <span className={styles.track} aria-hidden />
              </label>
            )}
            <label className={styles.switch}>
              <span>En stock uniquement</span>
              <input type="checkbox" name="dispo" value="1" defaultChecked={params.get("dispo") === "1"} />
              <span className={styles.track} aria-hidden />
            </label>
          </fieldset>
        </form>

        <div className={styles.foot}>
          <button type="button" className={styles.apply} onClick={() => setOpen(false)}>
            Voir les résultats
          </button>
        </div>
      </aside>
    </>
  );
}
