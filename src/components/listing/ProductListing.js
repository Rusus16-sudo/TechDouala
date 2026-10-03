import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX, X } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import FiltersPanel from "./FiltersPanel";
import SortSelect from "./SortSelect";
import { activeFilters, facets as buildFacets, parseFilters, runListing } from "@/lib/listing";
import styles from "./ProductListing.module.css";

/** Construit une URL de la liste en partant des paramètres actuels. */
function hrefWith(basePath, sp, { remove, set } = {}) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    for (const value of Array.isArray(v) ? v : [v]) {
      if (k === "page") continue;
      if (remove && remove.key === k && remove.value === value) continue;
      next.append(k, value);
    }
  }
  if (set) Object.entries(set).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
  const qs = next.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Page de liste générique : catégorie, marque, recherche, reconditionnés, ventes flash.
 * `hide` masque les filtres qui n'ont pas de sens (ex. « marque » sur une page marque).
 */
export default function ProductListing({ title, description, crumbs, products, searchParams, basePath, hide = [] }) {
  const f = parseFilters(searchParams);
  const fct = buildFacets(products);
  const { items, total, page, pages } = runListing(products, f);
  const active = activeFilters(f, fct);
  const keepQ = f.q ? { q: f.q } : {};

  return (
    <div className="container">
      <Breadcrumb items={crumbs} />

      <header className={styles.head}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.desc}>{description}</p>}
      </header>

      <div className={styles.layout}>
        <FiltersPanel facets={fct} hide={hide} activeCount={active.length} />

        <section className={styles.results} aria-label="Résultats">
          <div className={styles.toolbar}>
            <p className={styles.total} aria-live="polite">
              <strong>{total}</strong> produit{total > 1 ? "s" : ""}
            </p>
            <SortSelect />
          </div>

          {active.length > 0 && (
            <ul className={styles.chips}>
              {active.map((a) => (
                <li key={`${a.key}-${a.value}`}>
                  <Link href={hrefWith(basePath, searchParams, { remove: a })} className={styles.chip}>
                    {a.label} <X size={14} aria-label="Retirer" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={hrefWith(basePath, keepQ)} className={styles.clear}>
                  Tout effacer
                </Link>
              </li>
            </ul>
          )}

          {items.length === 0 ? (
            <div className={styles.empty}>
              <SearchX size={48} strokeWidth={1.25} aria-hidden />
              <h2>Aucun résultat trouvé</h2>
              <p>Aucun produit ne correspond à la recherche. Essaie d&apos;autres mots-clés ou retire un filtre.</p>
              <Button href="/categories/smartphones">Voir tous les produits</Button>
            </div>
          ) : (
            <div className={styles.grid}>
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <nav className={styles.pagination} aria-label="Pagination">
              {page > 1 ? (
                <Link href={hrefWith(basePath, searchParams, { set: { page: String(page - 1) } })} aria-label="Page précédente">
                  <ChevronLeft size={18} />
                </Link>
              ) : (
                <span className={styles.disabled} aria-hidden>
                  <ChevronLeft size={18} />
                </span>
              )}
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={hrefWith(basePath, searchParams, { set: { page: n === 1 ? "" : String(n) } })}
                  className={n === page ? styles.current : ""}
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </Link>
              ))}
              {page < pages ? (
                <Link href={hrefWith(basePath, searchParams, { set: { page: String(page + 1) } })} aria-label="Page suivante">
                  <ChevronRight size={18} />
                </Link>
              ) : (
                <span className={styles.disabled} aria-hidden>
                  <ChevronRight size={18} />
                </span>
              )}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
