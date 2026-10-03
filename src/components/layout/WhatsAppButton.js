import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/store";
import styles from "./WhatsAppButton.module.css";

/** Bouton flottant « Commander sur WhatsApp » : canal de secours pour les clients qui préfèrent discuter. */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Bonjour TechDouala, j'ai une question sur un produit.")}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.btn}
      aria-label="Commander ou poser une question sur WhatsApp"
    >
      <MessageCircle size={26} strokeWidth={2.25} aria-hidden />
      <span className={styles.label}>Commander sur WhatsApp</span>
    </a>
  );
}
