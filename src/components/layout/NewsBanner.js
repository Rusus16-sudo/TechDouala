import Link from "next/link";
import { MessageCircle, Package, Phone } from "lucide-react";
import { STORE, whatsappLink } from "@/lib/store";
import styles from "./NewsBanner.module.css";

/**
 * Barre utilitaire en haut du site : l'actualité « bandeau » à gauche (s'il y en a une),
 * les accès utiles à droite.
 */
export default function NewsBanner({ news = null, signedIn = false }) {
  const message = news ? (
    <>
      <strong>{news.title}</strong>
      {news.body && <span className={styles.body}>{news.body}</span>}
      {news.cta_label && <span className={styles.cta}>{news.cta_label}</span>}
    </>
  ) : (
    <span>Commande en ligne, finalisée avec un conseiller sur WhatsApp</span>
  );

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {news?.cta_href ? (
          <Link href={news.cta_href} className={styles.news}>
            {message}
          </Link>
        ) : (
          <p className={styles.news}>{message}</p>
        )}
        <ul className={styles.links}>
          <li>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={14} aria-hidden /> Aide sur WhatsApp
            </a>
          </li>
          <li>
            <Link href={signedIn ? "/compte" : "/connexion?suite=/compte"}>
              <Package size={14} aria-hidden /> Suivi de commande
            </Link>
          </li>
          <li>
            <a href={`tel:${STORE.phone.replace(/\s/g, "")}`} className={styles.phone}>
              <Phone size={14} aria-hidden /> {STORE.phone}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
