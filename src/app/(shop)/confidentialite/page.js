import InfoPage from "@/components/content/InfoPage";
import { STORE } from "@/lib/store";

export const metadata = {
  title: "Confidentialité - TechDouala",
  description: "Quelles données TechDouala collecte, pourquoi, avec qui elles sont partagées et comment exercer tes droits.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      crumb="Confidentialité"
      title="Politique de confidentialité"
      lead="On collecte le minimum nécessaire pour traiter tes commandes, et on ne vend jamais tes données."
      updated="2 octobre 2026"
    >
      <h2>Les données qu&apos;on collecte</h2>
      <ul>
        <li>
          <strong>À la commande :</strong> ton nom, ton numéro de téléphone, ton e-mail si tu le donnes, les produits
          commandés et ton éventuel message.
        </li>
        <li>
          <strong>Si tu crées un compte :</strong> ton e-mail, ton nom et ton numéro, ton historique de commandes et tes
          avis.
        </li>
        <li>
          <strong>Si tu achètes à crédit :</strong> ton échéancier et l&apos;historique de tes paiements.
        </li>
      </ul>

      <h2>Pourquoi</h2>
      <ul>
        <li>traiter et suivre tes commandes, et te contacter à leur sujet ;</li>
        <li>gérer ton crédit 40/60 et te rappeler tes échéances ;</li>
        <li>assurer la garantie et le service après-vente ;</li>
        <li>afficher tes avis et tes avantages de fidélité.</li>
      </ul>

      <h2>Avec qui elles sont partagées</h2>
      <p>
        Tes données ne sont ni vendues, ni louées. Elles sont stockées chez notre prestataire d&apos;hébergement de base
        de données (Supabase), qui les conserve pour notre compte. Quand tu nous écris sur WhatsApp, l&apos;échange passe
        par ce service et suit ses propres règles de confidentialité.
      </p>

      <h2>Cookies et stockage dans ton navigateur</h2>
      <p>
        Le site utilise uniquement ce qui est nécessaire à son fonctionnement : un cookie pour garder ta session quand tu
        es connecté, et le stockage de ton navigateur pour retenir ton panier. Il n&apos;y a ni publicité, ni outil de
        suivi publicitaire.
      </p>

      <h2>Combien de temps</h2>
      <p>
        On garde tes données tant que ton compte est actif ou qu&apos;une commande, un crédit ou une garantie est en
        cours, puis le temps exigé par la loi pour les factures.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux demander à consulter, corriger ou supprimer tes données, sauf celles qu&apos;on doit garder pour une
        obligation légale ou un crédit en cours. Écris-nous sur WhatsApp au {STORE.phone} ou par e-mail à{" "}
        {STORE.email}.
      </p>
    </InfoPage>
  );
}
