import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { STORE, whatsappLink } from "@/lib/store";
import styles from "./SiteFooter.module.css";

const HELP = [
  { href: "/credit", label: "Crédit 40/60" },
  { href: "/reprise", label: "Reprise d'ancien appareil" },
  { href: "/garantie", label: "Garantie & SAV" },
  { href: "/faq", label: "Questions fréquentes" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/a-propos", label: "À propos" },
  { href: "/cgv", label: "Conditions générales de vente" },
  { href: "/confidentialite", label: "Confidentialité" },
];

const PAYMENTS = ["MTN MoMo", "Orange Money", "Cash", "Crédit 40/60"];

export default function SiteFooter({ categories = [] }) {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.grid}`}>
        <div className={styles.brand}>
          <p className={styles.logo}>
            Tech<span>Douala</span>
          </p>
          <p className={styles.about}>
            Téléphones et électronique neufs ou d&apos;occasion, garantis en boutique, à Douala.
          </p>
        </div>

        <nav aria-label="Catégories">
          <p className={styles.title}>Catégories</p>
          <ul className={styles.links}>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informations">
          <p className={styles.title}>Informations</p>
          <ul className={styles.links}>
            {HELP.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className={styles.title}>Contact</p>
          <ul className={styles.contact}>
            <li>
              <Phone size={16} aria-hidden /> <a href={`tel:${STORE.phone.replace(/\s/g, "")}`}>{STORE.phone}</a>
            </li>
            <li>
              <MessageCircle size={16} aria-hidden />{" "}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                Écrire sur WhatsApp
              </a>
            </li>
            <li>
              <Mail size={16} aria-hidden /> <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
            </li>
            <li>
              <MapPin size={16} aria-hidden /> {STORE.address}
            </li>
          </ul>
        </div>
      </div>

      <div className={`${styles.container} ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} TechDouala. Tous droits réservés.</p>
        <ul className={styles.legal}>
          {LEGAL.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
        <ul className={styles.pay} aria-label="Paiements acceptés">
          {PAYMENTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
