"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import SearchBox from "./SearchBox";
import { categoryIcon } from "@/lib/catalog";
import styles from "./SiteHeader.module.css";

const NAV_LINKS = [
  { href: "/categories/smartphones", label: "Smartphones" },
  { href: "/reconditionnes", label: "Occasions" },
  { href: "/accessoires", label: "Accessoires" },
  { href: "/credit", label: "Crédit 40/60" },
  { href: "/reprise", label: "Reprise" },
  { href: "/ventes-flash", label: "Ventes flash", accent: true },
];

export default function SiteHeader({ categories = [], brands = [], accountName = null, accountHref = "/connexion" }) {
  const { count, setOpen } = useCart();
  const pathname = usePathname();
  const megaRef = useRef(null);

  // Méga-menu et recherche sont liés à la page où ils ont été ouverts : ils se ferment à chaque navigation.
  const [megaPath, setMegaPath] = useState(null);
  const [searchPath, setSearchPath] = useState(null);
  const megaOpen = megaPath === pathname;
  const searchOpen = searchPath === pathname;

  // Ferme le méga-menu au clic extérieur ; Échap ferme menu et recherche.
  useEffect(() => {
    if (!megaOpen && !searchOpen) return;
    const onDown = (e) => megaOpen && megaRef.current && !megaRef.current.contains(e.target) && setMegaPath(null);
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setMegaPath(null);
      setSearchPath(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen, searchOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.bar} ref={megaRef}>
        <div className={`${styles.container} ${styles.row}`}>
          <Link href="/" className={styles.logo} aria-label="TechDouala, accueil">
            Tech<span>Douala</span>
          </Link>

          <nav className={styles.nav} aria-label="Rayons">
            <Link href="/" className={styles.navLink} aria-current={pathname === "/" ? "page" : undefined}>
              Accueil
            </Link>
            <button
              type="button"
              className={styles.navLink}
              onClick={() => setMegaPath(megaOpen ? null : pathname)}
              aria-expanded={megaOpen}
              aria-controls="mega-menu"
            >
              Catégories
              <ChevronDown size={15} aria-hidden className={megaOpen ? styles.rotate : ""} />
            </button>
            {NAV_LINKS.map(({ href, label, accent }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${accent ? styles.accent : ""}`}
                aria-current={pathname === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.icon}
              onClick={() => setSearchPath(searchOpen ? null : pathname)}
              aria-expanded={searchOpen}
              aria-controls="site-search"
              aria-label={searchOpen ? "Fermer la recherche" : "Rechercher"}
            >
              {searchOpen ? <X size={21} aria-hidden /> : <Search size={21} aria-hidden />}
            </button>
            <Link
              href={accountHref}
              className={styles.icon}
              aria-label={!accountName ? "Connexion" : accountHref === "/gerant" ? "Espace gérant" : `Mon compte (${accountName})`}
              title={accountName ?? "Connexion"}
            >
              <User size={21} aria-hidden />
            </Link>
            <button
              type="button"
              className={styles.icon}
              onClick={() => setOpen(true)}
              aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}
            >
              <ShoppingBag size={21} aria-hidden />
              {count > 0 && <span className={styles.cartCount}>{count}</span>}
            </button>
          </div>
        </div>

        <div id="mega-menu" className={styles.mega} hidden={!megaOpen}>
          <div className={`${styles.container} ${styles.megaGrid}`}>
            <div>
              <p className={styles.megaTitle}>Catégories</p>
              <ul className={styles.megaCats}>
                {categories.map(({ slug, name }) => {
                  const Icon = categoryIcon(slug);
                  return (
                    <li key={slug}>
                      <Link href={`/categories/${slug}`} className={styles.megaCat}>
                        <Icon size={18} strokeWidth={1.75} aria-hidden />
                        {name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className={styles.megaTitle}>Marques</p>
              <ul className={styles.megaBrands}>
                {brands
                  .filter((b) => b.slug !== "autre")
                  .map(({ slug, name }) => (
                    <li key={slug}>
                      <Link href={`/marques/${slug}`}>{name}</Link>
                    </li>
                  ))}
              </ul>
            </div>
            <Link href="/credit" className={styles.megaPromo}>
              <strong>Crédit 40/60</strong>
              <span>Paie 40 % à la remise, le reste en 6 mois. Sans pénalité ni frais cachés.</span>
            </Link>
          </div>
        </div>
      </div>

      <div id="site-search" className={styles.searchPanel} hidden={!searchOpen}>
        <div className={styles.container}>
          <SearchBox autoFocus={searchOpen} onNavigate={() => setSearchPath(null)} />
        </div>
      </div>
    </header>
  );
}
