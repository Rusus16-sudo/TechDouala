import Link from "next/link";
import InfoPage from "@/components/content/InfoPage";
import { STORE } from "@/lib/store";

export const metadata = {
  title: "Garantie & SAV - TechDouala",
  description: "Chaque appareil TechDouala est garanti en boutique à Douala. Durée, couverture et démarche en cas de panne.",
};

export default function WarrantyPage() {
  return (
    <InfoPage
      crumb="Garantie & SAV"
      title="Garantie et service après-vente"
      lead="Chaque appareil est contrôlé avant la vente et garanti en boutique. En cas de souci, on s'en occupe à Douala, sans t'envoyer ailleurs."
    >
      <h2>Combien de temps dure la garantie ?</h2>
      <p>
        La durée est indiquée sur chaque fiche produit et sur ta facture. En général, <strong>12 mois</strong> pour un
        appareil neuf, et une durée plus courte pour une occasion ou un accessoire. Elle commence le jour où tu reçois
        l&apos;appareil.
      </p>

      <h2>Ce qui est couvert</h2>
      <p>Les pannes de fonctionnement qui ne viennent pas d&apos;un accident ou d&apos;une mauvaise utilisation, par exemple :</p>
      <ul>
        <li>le téléphone ne s&apos;allume plus ou redémarre sans cesse ;</li>
        <li>l&apos;écran, le tactile, le son, le micro ou une caméra cessent de marcher ;</li>
        <li>la charge ou le réseau ne fonctionnent plus normalement.</li>
      </ul>

      <h2>Ce qui n&apos;est pas couvert</h2>
      <ul>
        <li>la casse : écran fissuré, châssis tordu, chute ;</li>
        <li>le contact avec un liquide ou l&apos;oxydation ;</li>
        <li>un appareil ouvert ou réparé ailleurs qu&apos;en boutique ;</li>
        <li>la perte, le vol, et l&apos;usure normale (rayures, batterie qui s&apos;use avec le temps).</li>
      </ul>

      <h2>En cas de panne : la démarche</h2>
      <ol>
        <li>
          <strong>Écris-nous sur WhatsApp</strong> au {STORE.phone} avec ton numéro de commande (ou ta facture) et une
          description de la panne. Une courte vidéo aide beaucoup.
        </li>
        <li>
          <strong>Apporte l&apos;appareil en boutique</strong>, à {STORE.address}, avec son chargeur si la panne touche la
          charge.
        </li>
        <li>
          <strong>On le diagnostique</strong>, puis on le répare. S&apos;il ne peut pas être réparé, on te propose un
          échange contre un appareil équivalent.
        </li>
      </ol>
      <p>
        Avant de le déposer, sauvegarde tes photos et contacts, et retire ton compte Google ou iCloud : on en a besoin
        pour tester l&apos;appareil.
      </p>

      <h2>Après la garantie</h2>
      <p>
        On continue de t&apos;aider : diagnostic, réparation sur devis, ou <Link href="/reprise">reprise de ton
        appareil</Link> contre un nouveau.
      </p>
    </InfoPage>
  );
}
