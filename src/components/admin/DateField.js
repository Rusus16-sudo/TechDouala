"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import styles from "./DateField.module.css";

/**
 * Champ date de l'espace gérant.
 * Le calendrier natif du navigateur n'est ni traduisible ni stylable : celui-ci
 * l'est, s'ouvre au clic sur tout le champ et se pilote au clavier (flèches,
 * Entrée, Échap). La valeur reste au format AAAA-MM-JJ attendu par la base.
 */

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
const COURT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const LONG = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// Conversions sans passer par UTC : un fuseau à +1 décalerait l'affichage d'un jour.
const parse = (v) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v ?? "")) return null;
  const [y, m, d] = v.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfDay = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

export default function DateField({ id, label, value, onChange, min, hint, error, optional = false }) {
  const auto = useId();
  const fieldId = id ?? auto;
  const hintId = `${fieldId}-aide`;
  const errorId = `${fieldId}-erreur`;

  const selected = parse(value);
  const minDate = parse(min);
  const today = startOfDay();

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => selected ?? today);
  const [focusDay, setFocusDay] = useState(() => selected ?? today);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const gridRef = useRef(null);

  // Fermeture au clic extérieur et à Échap : un calendrier ouvert ne doit jamais rester coincé.
  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Le jour survolé au clavier reçoit le focus réel (lecteurs d'écran compris).
  useEffect(() => {
    if (open) gridRef.current?.querySelector('[data-focus="true"]')?.focus();
  }, [open, focusDay]);

  const openAt = () => {
    const base = selected ?? (minDate && minDate > today ? minDate : today);
    setMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setFocusDay(base);
    setOpen(true);
  };

  const disabled = (d) => minDate && d < minDate;

  const choose = (d) => {
    if (disabled(d)) return;
    onChange(iso(d));
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onGridKey = (e) => {
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (moves[e.key]) {
      e.preventDefault();
      const next = addDays(focusDay, moves[e.key]);
      setFocusDay(next);
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const next = addMonths(focusDay, e.key === "PageUp" ? -1 : 1);
      setFocusDay(next);
      setMonth(next);
    }
  };

  // Grille du mois, lundi en première colonne comme dans un calendrier français.
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));

  const described = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <span className={styles.label} id={`${fieldId}-label`}>
        {label}
        {optional && <span className={styles.optional}> · facultatif</span>}
      </span>

      <div className={`${styles.control} ${error ? styles.invalid : ""}`}>
        <button
          type="button"
          ref={triggerRef}
          id={fieldId}
          className={styles.trigger}
          onClick={() => (open ? setOpen(false) : openAt())}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={`${fieldId}-label ${fieldId}`}
          aria-describedby={described}
        >
          <CalendarDays size={17} aria-hidden />
          <span className={selected ? styles.value : styles.placeholder}>{selected ? COURT.format(selected) : "Choisir une date"}</span>
        </button>
        {selected && (
          <button type="button" className={styles.clear} onClick={() => onChange("")} aria-label={`Effacer ${label.toLowerCase()}`}>
            <X size={15} />
          </button>
        )}
      </div>

      {open && (
        <div className={styles.popover} role="dialog" aria-label={`${label} : choisir une date`}>
          <div className={styles.header}>
            <button type="button" className={styles.nav} onClick={() => setMonth(addMonths(month, -1))} aria-label="Mois précédent">
              <ChevronLeft size={17} />
            </button>
            <strong aria-live="polite">
              {MOIS[month.getMonth()]} {month.getFullYear()}
            </strong>
            <button type="button" className={styles.nav} onClick={() => setMonth(addMonths(month, 1))} aria-label="Mois suivant">
              <ChevronRight size={17} />
            </button>
          </div>

          <div className={styles.weekdays} aria-hidden>
            {JOURS.map((j, i) => (
              <span key={`${j}-${i}`}>{j.slice(0, 1).toUpperCase()}</span>
            ))}
          </div>

          <div className={styles.grid} ref={gridRef} onKeyDown={onGridKey} role="grid" aria-label="Jours du mois">
            {cells.map((d, i) =>
              d === null ? (
                <span key={`v-${i}`} />
              ) : (
                <button
                  key={iso(d)}
                  type="button"
                  data-focus={iso(d) === iso(focusDay) ? "true" : undefined}
                  tabIndex={iso(d) === iso(focusDay) ? 0 : -1}
                  className={`${styles.day} ${selected && iso(d) === iso(selected) ? styles.selected : ""} ${iso(d) === iso(today) ? styles.today : ""}`}
                  onClick={() => choose(d)}
                  disabled={disabled(d)}
                  aria-label={LONG.format(d)}
                  aria-pressed={selected ? iso(d) === iso(selected) : false}
                  aria-current={iso(d) === iso(today) ? "date" : undefined}
                >
                  {d.getDate()}
                </button>
              ),
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.quick} onClick={() => choose(minDate && minDate > today ? minDate : today)}>
              Aujourd&apos;hui
            </button>
            <button type="button" className={styles.quick} onClick={() => choose(addDays(today, 7))}>
              Dans 7 jours
            </button>
          </div>
        </div>
      )}

      {hint && !error && (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
