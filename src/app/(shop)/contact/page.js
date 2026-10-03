import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import InfoPage from "@/components/content/InfoPage";
import { STORE, whatsappLink } from "@/lib/store";
import styles from "./contact.module.css";

export const metadata = {
  title: "Contact - TechDouala",
  description: `Écris à TechDouala sur WhatsApp, appelle le ${STORE.phone} ou passe en boutique à ${STORE.address}.`,
};

const telHref = `tel:${STORE.phone.replace(/\s/g, "")}`;

export default function ContactPage() {
  const channels = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      text: "Le plus rapide : commande, conseil, négociation ou suivi.",
      action: STORE.phone,
      href: whatsappLink("Bonjour TechDouala !"),
      external: true,
    },
    { icon: Phone, title: "Téléphone", text: "Pour parler directement à un conseiller.", action: STORE.phone, href: telHref },
    { icon: Mail, title: "E-mail", text: "Pour les demandes écrites et les factures.", action: STORE.email, href: `mailto:${STORE.email}` },
    {
      icon: MapPin,
      title: "Boutique",
      text: "Préviens-nous sur WhatsApp avant de passer : on met ton appareil de côté.",
      action: STORE.address,
    },
  ];

  return (
    <InfoPage
      crumb="Contact"
      title="Contacte-nous"
      lead="Une question sur un téléphone, une commande ou un crédit ? On te répond sur WhatsApp, au téléphone ou en boutique."
      help={false}
      wide
    >
      <ul className={styles.grid}>
        {channels.map(({ icon: Icon, title, text, action, href, external }) => (
          <li key={title} className={styles.card}>
            <span className={styles.icon}>
              <Icon size={20} strokeWidth={1.75} aria-hidden />
            </span>
            <h2>{title}</h2>
            <p>{text}</p>
            {href ? (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {action}
              </a>
            ) : (
              <strong>{action}</strong>
            )}
          </li>
        ))}
      </ul>
    </InfoPage>
  );
}
