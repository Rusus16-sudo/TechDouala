import Link from "next/link";
import InfoPage from "@/components/content/InfoPage";
import { STORE } from "@/lib/store";

export const metadata = {
  title: "Conditions générales de vente - TechDouala",
  description: "Conditions de vente de TechDouala : commande, prix, paiement, crédit 40/60, remise des appareils, garantie.",
};

export default function TermsPage() {
  return (
    <InfoPage
      crumb="Conditions de vente"
      title="Conditions générales de vente"
      lead="Les règles qui s'appliquent à chaque achat chez TechDouala, sur le site comme en boutique."
      updated="2 octobre 2026"
    >
      <h2>1. Le vendeur</h2>
      <p>
        Les ventes sont conclues avec {STORE.name}, boutique située à {STORE.address} (Cameroun). Contact : WhatsApp et
        téléphone au {STORE.phone}, e-mail {STORE.email}.
      </p>

      <h2>2. Les produits</h2>
      <p>
        Chaque fiche indique l&apos;état de l&apos;appareil (neuf, occasion ou reconditionné), ses caractéristiques
        principales et la durée de sa garantie. Les photos
        illustrent le produit et peuvent différer légèrement de l&apos;appareil remis (coloris, accessoires).
      </p>

      <h2>3. Les prix</h2>
      <p>
        Les prix sont indiqués en francs CFA (FCFA). Le prix retenu est celui affiché au moment de la commande, sauf
        accord différent conclu avec un conseiller (prix négocié). Un code promo s&apos;applique selon ses conditions et
        ne s&apos;applique pas aux produits déjà en vente flash.
      </p>

      <h2>4. La commande</h2>
      <p>
        La commande passée sur le site est enregistrée avec un numéro et réserve les articles. Elle est ensuite
        confirmée par un conseiller sur WhatsApp, qui vérifie la disponibilité et convient avec toi du paiement et de la
        remise. La vente est conclue à cette confirmation. Tu peux annuler ta commande tant qu&apos;elle n&apos;est pas
        remise ; {STORE.name} peut l&apos;annuler si un article n&apos;est plus disponible, en te prévenant.
      </p>

      <h2>5. Le paiement</h2>
      <p>
        Le paiement se fait à la remise, en espèces, par MTN Mobile Money ou par Orange Money. Il n&apos;y a pas de
        paiement par carte sur le site.
      </p>

      <h2>6. Le crédit 40/60</h2>
      <ul>
        <li>Il est réservé aux clients ayant un compte TechDouala, après vérification de leur identité.</li>
        <li>L&apos;acompte de 40 % est payé à la remise ; le reste est réglé en 6 mensualités égales, à date fixe.</li>
        <li>Il n&apos;y a ni intérêt, ni frais de dossier, ni pénalité de retard.</li>
        <li>
          Un client peut avoir un crédit en cours, deux s&apos;il a le statut « Bon payeur ». Une échéance impayée depuis
          plus de 30 jours empêche d&apos;ouvrir un nouveau crédit.
        </li>
        <li>L&apos;échéancier et les paiements sont suivis dans l&apos;espace crédit du client.</li>
      </ul>

      <h2>7. La remise de l&apos;appareil</h2>
      <p>
        L&apos;appareil est remis en boutique ou selon les modalités convenues avec le conseiller. À la remise, vérifie
        son état. Garde ta facture : elle sert de
        preuve d&apos;achat et de garantie.
      </p>

      <h2>8. La garantie</h2>
      <p>
        Les appareils sont garantis en boutique pour la durée indiquée sur la fiche produit et la facture. La garantie
        couvre les pannes de fonctionnement, pas la casse, le contact avec un liquide ni les réparations faites
        ailleurs. Le détail et la démarche sont sur la page <Link href="/garantie">Garantie & SAV</Link>.
      </p>

      <h2>9. Les données personnelles</h2>
      <p>
        Les informations données lors d&apos;une commande servent à la traiter et à assurer le suivi. Voir la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>10. Les litiges</h2>
      <p>
        Ces conditions sont soumises au droit camerounais. En cas de désaccord, écris-nous d&apos;abord : on cherche une
        solution à l&apos;amiable. À défaut, les tribunaux de Douala sont compétents.
      </p>
    </InfoPage>
  );
}
