import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import CreditCard from "@/components/credit/CreditCard";
import { getSession } from "@/lib/auth";
import { getMyCredits } from "@/lib/data/credit";
import { CREDIT_STATUS_BADGE, creditPlan } from "@/lib/credit";
import { formatFCFA } from "@/lib/format";
import styles from "./credit.module.css";

export const metadata = {
  title: "Crédit 40/60 - TechDouala",
  description: "Paie 40 % à l'achat et le reste en 6 mensualités, sans pénalité. Téléphones garantis en boutique à Douala.",
};

const RULES = [
  { title: "L'acompte", text: "40 % du prix, réglés à l'achat en MTN MoMo, Orange Money ou cash." },
  { title: "Les mensualités", text: "Le reste en 6 mensualités égales, à date fixe, sans intérêt ni frais de dossier." },
  { title: "En cas de retard", text: "On te relance sur WhatsApp. Aucune pénalité financière." },
  { title: "Bon payeur", text: "Après 3 échéances payées à temps, tu peux ouvrir un deuxième crédit." },
];

// Exemple chiffré : un téléphone à 300 000 FCFA.
const EXAMPLE_PRICE = 300000;

export default async function CreditPage() {
  const session = await getSession();
  const data = session ? await getMyCredits(session.user.id) : null;
  const credits = data?.credits ?? [];
  const statut = data?.state?.statut;
  const example = creditPlan(EXAMPLE_PRICE);

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Crédit 40/60" }]} />

      <header className={styles.head}>
        <div>
          <h1>{credits.length ? "Mon crédit" : "Achète maintenant, paie en 6 mois"}</h1>
          <p className={styles.lead}>
            Paie 40 % à l&apos;achat, puis le reste en 6 mensualités. Sans pénalité et sans frais cachés.
          </p>
        </div>
        {statut && (
          <p className={styles.statut}>
            Ton statut : <Badge variant={CREDIT_STATUS_BADGE[statut] ?? "neutral"}>{statut}</Badge>
          </p>
        )}
      </header>

      {credits.length > 0 && (
        <div className={styles.credits}>
          {credits.map((c) => (
            <CreditCard key={c.id} credit={c} />
          ))}
        </div>
      )}

      <section className={styles.example} aria-labelledby="example-title">
        <h2 id="example-title">Pour un téléphone à {formatFCFA(EXAMPLE_PRICE)}</h2>
        <ol className={styles.timeline}>
          <li className={styles.now}>
            <span className={styles.when}>Aujourd&apos;hui · 40 %</span>
            <strong>{formatFCFA(example.downPayment)}</strong>
          </li>
          {Array.from({ length: example.months }, (_, i) => (
            <li key={i}>
              <span className={styles.when}>Mois {i + 1}</span>
              <strong>{formatFCFA(example.monthly)}</strong>
            </li>
          ))}
        </ol>
      </section>

      <dl className={styles.rules}>
        {RULES.map(({ title, text }) => (
          <div key={title}>
            <dt>{title}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>

      <section className={styles.cta}>
        {!session ? (
          <>
            <h2>Un compte est nécessaire pour acheter à crédit</h2>
            <p>Il te faut un compte pour suivre ton échéancier et tes paiements.</p>
            <div className={styles.ctaActions}>
              <Button href="/connexion?mode=inscription&suite=/credit" variant="light" size="lg">
                Créer mon compte
              </Button>
              <Button href="/connexion?suite=/credit" variant="outline-light" size="lg">
                J&apos;ai déjà un compte
              </Button>
            </div>
          </>
        ) : data.eligibility?.ok ? (
          <>
            <h2>Tu peux acheter à crédit</h2>
            <p>Choisis ton téléphone, puis sélectionne « Crédit 40/60 » au moment de commander.</p>
            <div className={styles.ctaActions}>
              <Button href="/categories/smartphones" variant="light" size="lg">
                Voir les smartphones
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2>Nouveau crédit indisponible</h2>
            <p>{data.eligibility?.message}</p>
            <div className={styles.ctaActions}>
              <Button href="/compte" variant="light" size="lg">
                Voir mon compte
              </Button>
            </div>
          </>
        )}
        <p className={styles.legal}>
          Le crédit engage l&apos;acheteur. La boutique vérifie ton identité et ton numéro avant de l&apos;accorder. Des
          questions ? <Link href="/contact">Contacte-nous</Link>.
        </p>
      </section>
    </div>
  );
}
