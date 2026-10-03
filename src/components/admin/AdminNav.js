"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LayoutDashboard, Megaphone, Package, ReceiptText, ShoppingCart, Star, TicketPercent } from "lucide-react";
import { useWaitingOrders } from "./OrderAlerts";
import styles from "./AdminNav.module.css";

// Menu de l'espace gérant (maquette, parcours gérant). `owner` : réservé au propriétaire (cahier 12).
const ITEMS = [
  { href: "/gerant", label: "Tableau de bord", icon: LayoutDashboard, owner: true, exact: true },
  { href: "/gerant/vente", label: "Nouvelle vente", icon: ShoppingCart },
  { href: "/gerant/produits", label: "Catalogue & stock", icon: Package },
  { href: "/gerant/commandes", label: "Commandes", icon: ReceiptText },
  { href: "/gerant/credits", label: "Crédits & relances", icon: CreditCard },
  { href: "/gerant/avis", label: "Avis clients", icon: Star },
  { href: "/gerant/promos", label: "Codes promo", icon: TicketPercent, owner: true },
  { href: "/gerant/actualites", label: "Actualités", icon: Megaphone, owner: true },
];

export default function AdminNav({ role }) {
  const pathname = usePathname();
  const waiting = useWaitingOrders();
  const navRef = useRef(null);

  // Sur téléphone les onglets défilent : l'onglet ouvert est ramené à l'écran.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector("[aria-current='page']");
    if (!active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
  }, [pathname]);
  const items = ITEMS.filter((i) => !i.owner || role === "proprietaire");

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Espace gérant">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`${styles.item} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined}>
            <Icon size={19} aria-hidden />
            <span>{label}</span>
            {href === "/gerant/commandes" && waiting > 0 && (
              <span className={styles.count} aria-label={`${waiting} à confirmer`}>
                {waiting}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
