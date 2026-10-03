"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import styles from "./Select.module.css";

const toOption = (o) => (typeof o === "string" ? { value: o, label: o } : o);
const GAP = 6;
const MAX_HEIGHT = 300;

/**
 * Liste déroulante au style du site, à la place du <select> natif du navigateur.
 * Modèle « combobox en lecture seule » (WAI-ARIA) : flèches, Début/Fin, Entrée, Espace, Échap,
 * Tab et saisie des premières lettres. Avec `name`, la valeur part dans le formulaire.
 *
 * options : [{ value, label }] ou ["Libellé"] ; value / onChange(value) ou defaultValue.
 * variant : "field" (formulaires), "pill" (tri des listes) ; size : "md" (44 px) ou "lg" (48 px).
 */
export default function Select({
  id,
  name,
  value,
  defaultValue,
  onChange,
  options = [],
  placeholder = "Choisir…",
  icon: Icon,
  variant = "field",
  size = "md",
  className = "",
  invalid = false,
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}) {
  const opts = options.map(toOption);
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? opts[0]?.value ?? "");
  const current = controlled ? value : inner;
  const selectedIndex = opts.findIndex((o) => String(o.value) === String(current));

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: "", at: 0 });
  const autoId = useId();
  const triggerId = id ?? `select-${autoId}`;
  const listId = `${triggerId}-liste`;

  function choose(index) {
    const opt = opts[index];
    if (!opt) return;
    if (!controlled) setInner(opt.value);
    if (String(opt.value) !== String(current)) onChange?.(opt.value);
  }

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  function openList(startIndex) {
    if (disabled || opts.length === 0) return;
    setActive(startIndex ?? (selectedIndex >= 0 ? selectedIndex : 0));
    setOpen(true);
  }

  // Position de la liste (fixe, sous le bouton ; au-dessus s'il manque de place en bas).
  const place = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - GAP - 8;
    const above = r.top - GAP - 8;
    const up = below < Math.min(MAX_HEIGHT, 220) && above > below;
    setPos({
      left: r.left,
      width: Math.max(r.width, 200),
      top: up ? undefined : r.bottom + GAP,
      bottom: up ? window.innerHeight - r.top + GAP : undefined,
      maxHeight: Math.min(MAX_HEIGHT, up ? above : below),
      up,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Clic en dehors : fermeture sans reprendre le focus.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      close(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  // L'option active reste visible quand on se déplace au clavier.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function typeahead(key) {
    const now = Date.now();
    typed.current = { text: (now - typed.current.at < 600 ? typed.current.text : "") + key.toLowerCase(), at: now };
    const start = open ? active : selectedIndex;
    const order = [...opts.keys()].map((i) => (i + Math.max(start, 0) + (typed.current.text.length === 1 ? 1 : 0)) % opts.length);
    return order.find((i) => String(opts[i].label).toLowerCase().startsWith(typed.current.text)) ?? -1;
  }

  function onKeyDown(e) {
    const last = opts.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList(e.key === "ArrowUp" ? Math.max(selectedIndex, 0) : undefined);
      } else if (e.key.length === 1 && /\S/.test(e.key)) {
        const i = typeahead(e.key);
        if (i >= 0) choose(i);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(i + 1, last));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Home":
      case "PageUp":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
      case "PageDown":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        close();
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        choose(active);
        close(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const i = typeahead(e.key);
          if (i >= 0) setActive(i);
        }
    }
  }

  const label = selectedIndex >= 0 ? opts[selectedIndex].label : placeholder;

  return (
    <>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className={`${styles.trigger} ${styles[variant]} ${styles[size]} ${className}`}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {Icon && <Icon size={16} aria-hidden className={styles.lead} />}
        <span className={selectedIndex >= 0 ? styles.value : styles.placeholder}>{label}</span>
        <ChevronDown size={16} aria-hidden className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>
      {name && <input type="hidden" name={name} value={current ?? ""} />}

      {open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={ariaLabelledby ?? triggerId}
            tabIndex={-1}
            className={`${styles.list} ${pos.up ? styles.up : ""}`}
            style={{ left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.width, maxHeight: pos.maxHeight }}
          >
            {opts.map((o, i) => {
              const selected = i === selectedIndex;
              return (
                <li
                  key={`${o.value}-${i}`}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={selected}
                  className={`${styles.option} ${i === active ? styles.active : ""} ${selected ? styles.selected : ""}`}
                  onPointerMove={() => setActive(i)}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => {
                    choose(i);
                    close();
                  }}
                >
                  <span>{o.label}</span>
                  {selected && <Check size={16} aria-hidden className={styles.check} />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
