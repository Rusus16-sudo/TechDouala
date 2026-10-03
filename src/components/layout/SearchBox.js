"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Smartphone, Tag, X } from "lucide-react";
import { formatFCFA } from "@/lib/format";
import styles from "./SearchBox.module.css";

const MIN_CHARS = 2;
const DELAY = 150;
const EMPTY = { products: [], categories: [], brands: [] };

const strip = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Met en gras la partie du nom qui correspond à la saisie. */
function Highlight({ text, query }) {
  const i = strip(text).indexOf(strip(query.trim()));
  if (!query.trim() || i < 0) return text;
  const end = i + query.trim().length;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, end)}</mark>
      {text.slice(end)}
    </>
  );
}

/**
 * Barre de recherche avec suggestions dès 2 lettres : produits (photo, prix), rayons et marques.
 * Modèle « combobox » : flèches pour parcourir, Entrée pour ouvrir, Échap pour refermer la liste.
 */
export default function SearchBox({ autoFocus = false, onNavigate }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const listId = useId();
  const [q, setQ] = useState("");
  const [data, setData] = useState(EMPTY);
  const [forQuery, setForQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Suggestions : requête différée de 150 ms, l'ancienne est annulée à chaque frappe.
  useEffect(() => {
    const query = q.trim();
    if (query.length < MIN_CHARS) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recherche?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        if (res.ok) {
          setData(await res.json());
          setForQuery(query);
          setActive(-1);
        }
      } catch {
        // Requête annulée par une frappe plus récente : rien à faire.
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, DELAY);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  const tooShort = q.trim().length < MIN_CHARS;
  const shown = tooShort ? EMPTY : data;

  // Liste à plat pour la navigation au clavier : produits, rayons, marques, puis « voir tous les résultats ».
  const items = [
    ...shown.products.map((p) => ({ key: `p-${p.id}`, href: `/produit/${p.id}` })),
    ...shown.categories.map((c) => ({ key: `c-${c.slug}`, href: `/categories/${c.slug}` })),
    ...shown.brands.map((b) => ({ key: `b-${b.slug}`, href: `/marques/${b.slug}` })),
    ...(tooShort ? [] : [{ key: "all", href: `/recherche?q=${encodeURIComponent(q.trim())}` }]),
  ];
  const indexOf = (key) => items.findIndex((it) => it.key === key);
  const optionId = (key) => `${listId}-${key}`;
  const expanded = open && !tooShort;
  const nothing = !loading && forQuery === q.trim() && items.length === 1;

  function go(href) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function onKeyDown(e) {
    if (!expanded) {
      if (e.key === "ArrowDown" && !tooShort) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(items[active].href);
    } else if (e.key === "Escape") {
      // La liste se ferme d'abord ; un second Échap referme la recherche (géré par l'en-tête).
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      setOpen(false);
      setActive(-1);
    }
  }

  const option = (key, extra = "") => ({
    id: optionId(key),
    role: "option",
    "aria-selected": items[active]?.key === key,
    className: `${extra} ${items[active]?.key === key ? styles.active : ""}`,
    onPointerMove: () => setActive(indexOf(key)),
    onPointerDown: (e) => e.preventDefault(),
    onClick: () => go(items[indexOf(key)].href),
  });

  return (
    <form
      action="/recherche"
      role="search"
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) go(`/recherche?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <div className={styles.field}>
        <Search size={20} aria-hidden className={styles.icon} />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder="Rechercher un téléphone, une marque…"
          aria-label="Rechercher un produit"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded && active >= 0 ? optionId(items[active].key) : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        {q && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Effacer la recherche"
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => {
              setQ("");
              setActive(-1);
              inputRef.current?.focus();
            }}
          >
            <X size={18} aria-hidden />
          </button>
        )}
        <button type="submit" className={styles.submit}>
          Rechercher
        </button>
      </div>

      {expanded && (
        <div className={styles.panel}>
          <ul id={listId} role="listbox" aria-label="Suggestions" className={styles.list}>
            {shown.products.length > 0 && (
              <li role="presentation" className={styles.groupTitle}>
                Produits
              </li>
            )}
            {shown.products.map((p) => (
              <li key={p.id} {...option(`p-${p.id}`, styles.product)}>
                <span className={styles.thumb}>
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt="" fill sizes="48px" className={styles.thumbImg} />
                  ) : (
                    <Smartphone size={20} strokeWidth={1.5} aria-hidden />
                  )}
                </span>
                <span className={styles.productText}>
                  <span className={styles.name}>
                    <Highlight text={p.name} query={q} />
                  </span>
                  <span className={styles.meta}>
                    {p.brandName}
                    {p.condition !== "Neuf" && ` · ${p.condition}`}
                    {!p.inStock && " · Rupture"}
                  </span>
                </span>
                <span className={styles.price}>
                  {p.fromPrice && <small>dès </small>}
                  {formatFCFA(p.price)}
                </span>
              </li>
            ))}

            {(shown.categories.length > 0 || shown.brands.length > 0) && (
              <li role="presentation" className={styles.groupTitle}>
                Rayons et marques
              </li>
            )}
            {shown.categories.map((c) => (
              <li key={c.slug} {...option(`c-${c.slug}`, styles.chipRow)}>
                <Tag size={16} aria-hidden />
                <span>
                  <Highlight text={c.name} query={q} />
                </span>
              </li>
            ))}
            {shown.brands.map((b) => (
              <li key={b.slug} {...option(`b-${b.slug}`, styles.chipRow)}>
                <Tag size={16} aria-hidden />
                <span>
                  Marque <Highlight text={b.name} query={q} />
                </span>
              </li>
            ))}

            {nothing && (
              <li role="presentation" className={styles.empty}>
                Aucun produit ne correspond à « {q.trim()} ». Essaie un autre mot, ou écris-nous sur WhatsApp.
              </li>
            )}

            <li {...option("all", styles.all)}>
              <span>Voir tous les résultats pour « {q.trim()} »</span>
              <ArrowRight size={16} aria-hidden />
            </li>
          </ul>
        </div>
      )}
    </form>
  );
}
