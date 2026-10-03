import InfoPage from "@/components/content/InfoPage";
import TradeInForm from "@/components/content/TradeInForm";

export const metadata = {
  title: "Reprise de ton ancien téléphone - TechDouala",
  description: "Fais estimer ton ancien téléphone sur WhatsApp : sa valeur est déduite de ton achat ou de ton acompte chez TechDouala.",
};

export default async function TradeInPage({ searchParams }) {
  const pour = (await searchParams)?.pour;
  const target = typeof pour === "string" ? pour.slice(0, 80) : "";

  return (
    <InfoPage
      crumb="Reprise"
      title="Fais reprendre ton ancien téléphone"
      lead="Sa valeur est déduite de ton nouvel achat, ou de ton acompte si tu achètes à crédit. Estimation gratuite et sans engagement."
    >
      <h2>Comment ça marche</h2>
      <ol>
        <li>
          <strong>Décris ton téléphone</strong> ci-dessous : WhatsApp s&apos;ouvre avec ta demande, tu ajoutes trois
          photos.
        </li>
        <li>
          <strong>Un conseiller t&apos;envoie une estimation</strong>, selon le modèle, l&apos;état et ce qui est fourni
          avec.
        </li>
        <li>
          <strong>On contrôle l&apos;appareil en boutique</strong> le jour de ton achat : état et fonctionnement.
          Le montant confirmé est déduit sur-le-champ.
        </li>
      </ol>
      <p>
        On ne reprend pas un téléphone bloqué, signalé perdu ou volé. Avant de venir, sauvegarde tes données et retire
        ton compte Google ou iCloud.
      </p>

      <h2>Ton téléphone</h2>
      <TradeInForm target={target} />
    </InfoPage>
  );
}
