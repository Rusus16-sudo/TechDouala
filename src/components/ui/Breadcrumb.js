import Link from "next/link";
import { ChevronRight } from "lucide-react";
import styles from "./Breadcrumb.module.css";

/** Fil d'Ariane : items = [{ label, href? }]. Le dernier élément est la page courante. */
export default function Breadcrumb({ items = [] }) {
  const all = [{ label: "Accueil", href: "/" }, ...items];
  return (
    <nav aria-label="Fil d'Ariane" className={styles.nav}>
      <ol>
        {all.map((item, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${item.label}-${i}`}>
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined}>{item.label}</span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
              {!last && <ChevronRight size={14} aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
