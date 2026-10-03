import Link from "next/link";
import InfoPage from "@/components/content/InfoPage";
import { STORE } from "@/lib/store";
import styles from "./faq.module.css";

export const metadata = {
  title: "Questions fréquentes - TechDouala",
  description: "Commande sur WhatsApp, paiement, crédit 40/60, garantie, reprise : les réponses aux questions les plus courantes.",
};

const GROUPS = [
  {
    title: "Commander",
    items: [
      {
        q: "Comment passer commande ?",
        a: (
          <>
            Ajoute tes produits au panier, puis clique sur « Passer la commande ». Tu indiques ton nom et ton numéro : la
            commande est enregistrée et WhatsApp s&apos;ouvre avec son détail. Un conseiller confirme la disponibilité et
            convient avec toi du paiement et de la remise.
          </>
        ),
      },
      {
        q: "Faut-il créer un compte ?",
        a: (
          <>
            Non pour une commande simple. Un compte te permet de suivre tes commandes, de laisser un avis et il est
            nécessaire pour acheter à crédit.
          </>
        ),
      },
      {
        q: "Comment je récupère mon téléphone ?",
        a: (
          <>
            En boutique, à {STORE.address}, ou selon ce que tu conviens avec le conseiller sur WhatsApp. Pense à
            vérifier l&apos;appareil à la remise.
          </>
        ),
      },
      {
        q: "Puis-je annuler une commande ?",
        a: <>Oui, tant qu&apos;elle n&apos;est pas remise : écris-nous sur WhatsApp avec ton numéro de commande.</>,
      },
    ],
  },
  {
    title: "Payer",
    items: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: <>Cash, MTN Mobile Money et Orange Money, au moment de la remise. Il n&apos;y a pas de paiement par carte en ligne.</>,
      },
      {
        q: "Le prix est-il négociable ?",
        a: (
          <>
            Oui. Sur la fiche produit, clique sur « Négocier le prix » et propose ton montant : la discussion continue sur
            WhatsApp avec un conseiller.
          </>
        ),
      },
      {
        q: "Où saisir un code promo ?",
        a: (
          <>
            Dans le récapitulatif, au moment de passer commande. Un code promo ne s&apos;applique pas aux produits déjà en
            vente flash.
          </>
        ),
      },
    ],
  },
  {
    title: "Crédit 40/60",
    items: [
      {
        q: "Comment fonctionne le crédit 40/60 ?",
        a: (
          <>
            Tu paies 40 % du prix à la remise, puis le reste en 6 mensualités égales, sans intérêt ni frais de dossier.
            Tout est expliqué sur la page <Link href="/credit">Crédit 40/60</Link>.
          </>
        ),
      },
      {
        q: "Qui peut en profiter ?",
        a: (
          <>
            Toute personne avec un compte TechDouala, après vérification de son identité. On peut avoir un crédit en cours
            à la fois, deux pour un « Bon payeur ». Une échéance en retard de plus de 30 jours bloque un nouveau crédit.
          </>
        ),
      },
      {
        q: "Que se passe-t-il en cas de retard ?",
        a: <>Aucune pénalité financière : on te relance et on cherche une solution avec toi.</>,
      },
    ],
  },
  {
    title: "Appareils et garantie",
    items: [
      {
        q: "Quelle différence entre neuf et occasion ?",
        a: (
          <>
            Un neuf est scellé dans sa boîte. Une occasion a déjà servi : nos techniciens la testent (écran, batterie,
            boutons, caméras) avant la vente. Les deux sont garantis en boutique.
          </>
        ),
      },
      {
        q: "Quelle est la durée de la garantie ?",
        a: (
          <>
            Elle est indiquée sur chaque fiche produit : 12 mois en général pour un neuf. Le détail est sur la page{" "}
            <Link href="/garantie">Garantie & SAV</Link>.
          </>
        ),
      },
      {
        q: "Reprenez-vous mon ancien téléphone ?",
        a: (
          <>
            Oui : sa valeur est déduite de ton achat ou de ton acompte. Fais estimer ton appareil sur la page{" "}
            <Link href="/reprise">Reprise</Link>.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <InfoPage
      crumb="Questions fréquentes"
      title="Questions fréquentes"
      lead="Commande, paiement, crédit, garantie : les réponses aux questions qu'on nous pose le plus souvent."
    >
      {GROUPS.map((g) => (
        <section key={g.title} className={styles.group}>
          <h2>{g.title}</h2>
          {g.items.map(({ q, a }) => (
            <details key={q} className={styles.item}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      ))}
    </InfoPage>
  );
}
