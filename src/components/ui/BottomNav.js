"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, ShoppingBag, CreditCard, User } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import styles from "./BottomNav.module.css";

const ITEMS = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/categories", label: "Catégories", icon: LayoutGrid },
  { key: "cart", label: "Panier", icon: ShoppingBag },
  { href: "/credit", label: "Crédit", icon: CreditCard },
  { href: "/compte", label: "Compte", icon: User },
];

/** Navigation mobile du site (masquée sur ordinateur, où l'en-tête prend le relais). */
export default function BottomNav({ accountHref = "/compte" }) {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const items = ITEMS.map((i) => (i.href === "/compte" ? { ...i, href: accountHref } : i));

  return (
    <nav className={styles.nav} aria-label="Navigation principale">
      {items.map(({ href, key, label, icon: Icon }) => {
        if (key === "cart") {
          return (
            <button key={key} type="button" className={styles.item} onClick={() => setOpen(true)}>
              <span className={styles.iconWrap}>
                <Icon size={22} strokeWidth={2} aria-hidden />
                {count > 0 && <span className={styles.count}>{count}</span>}
              </span>
              <span>{label}</span>
            </button>
          );
        }
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.item} ${active ? styles.active : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
