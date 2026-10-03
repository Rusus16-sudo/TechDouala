import Link from "next/link";
import InfoPage from "@/components/content/InfoPage";
import { STORE } from "@/lib/store";

export const metadata = {
  title: "À propos - TechDouala",
  description: "TechDouala, boutique de téléphones et d'accessoires à Douala : appareils garantis en boutique, payables à crédit 40/60.",
};

export default function AboutPage() {
  return (
    <InfoPage
      crumb="À propos"
      title={`${STORE.name}, la tech qui te comprend`}
      lead={`Une boutique de téléphones et d'accessoires à ${STORE.address}, pensée pour acheter en confiance et à son rythme.`}
    >
      <h2>Ce qu&apos;on fait</h2>
      <p>
        On vend des smartphones neufs et d&apos;occasion, des téléphones à touches, des tablettes et des accessoires :
        écouteurs, montres, chargeurs, powerbanks, coques. Chaque commande passée sur le site est confirmée par un
        conseiller sur WhatsApp, qui convient avec toi du paiement et de la remise.
      </p>

      <h2>Nos engagements</h2>
      <ul>
        <li>
          <strong>Des appareils vérifiés.</strong> Chaque téléphone est contrôlé avant la vente.
        </li>
        <li>
          <strong>Une garantie en boutique.</strong> En cas de panne, on s&apos;en occupe nous-mêmes, à Douala. Voir{" "}
          <Link href="/garantie">Garantie & SAV</Link>.
        </li>
        <li>
          <strong>Payer à son rythme.</strong> Comptant ou avec le <Link href="/credit">crédit 40/60</Link> : 40 % à la
          remise, le reste en 6 mois, sans pénalité.
        </li>
        <li>
          <strong>Des prix discutés.</strong> Tu peux négocier depuis chaque fiche produit et faire reprendre ton ancien
          téléphone.
        </li>
        <li>
          <strong>Un vrai conseil.</strong> Dis-nous ton budget et ton usage : on t&apos;aide à choisir, sans pousser au
          plus cher.
        </li>
      </ul>

      <h2>Nous trouver</h2>
      <p>
        Boutique à {STORE.address}. Écris-nous sur WhatsApp ou appelle le {STORE.phone} avant de passer : on met ton
        appareil de côté. Toutes nos coordonnées sont sur la page <Link href="/contact">Contact</Link>.
      </p>
    </InfoPage>
  );
}
