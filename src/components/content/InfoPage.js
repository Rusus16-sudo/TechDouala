import { MessageCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { whatsappLink } from "@/lib/store";
import styles from "./InfoPage.module.css";

/**
 * Page d'information (contact, garantie, FAQ, conditions…) : titre, chapeau, texte courant
 * et, en bas, un renvoi vers un conseiller sur WhatsApp.
 */
export default function InfoPage({ crumb, title, lead, updated, children, help = true, wide = false }) {
  return (
    <div className="container">
      <Breadcrumb items={[{ label: crumb ?? title }]} />
      <article className={`${styles.page} ${wide ? styles.wide : ""}`}>
        <header className={styles.head}>
          <h1>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
          {updated && <p className={styles.updated}>Mise à jour : {updated}</p>}
        </header>

        <div className={styles.prose}>{children}</div>

        {help && (
          <aside className={styles.help} aria-label="Besoin d'aide">
            <div>
              <h2>Une question ?</h2>
              <p>Un conseiller te répond sur WhatsApp.</p>
            </div>
            <Button href={whatsappLink("Bonjour TechDouala, j'ai une question.")} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} aria-hidden /> Écrire sur WhatsApp
            </Button>
          </aside>
        )}
      </article>
    </div>
  );
}
