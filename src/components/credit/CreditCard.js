import { Banknote, CalendarClock, Check, Smartphone } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatFCFA } from "@/lib/format";
import { creditProgress, daysUntil, installmentState } from "@/lib/credit";
import { STORE, whatsappLink } from "@/lib/store";
import styles from "./credit.module.css";

const dateFr = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dateShort = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

/** Un crédit du client : jauge, prochaine échéance, échéancier (cahier 5.5). */
export default function CreditCard({ credit }) {
  const p = creditProgress(credit);
  const product = credit.order?.items?.[0];
  const days = p.next ? daysUntil(p.next.due_date) : null;

  return (
    <section className={styles.card} aria-labelledby={`credit-${credit.id}`}>
      <header className={styles.cardHead}>
        <div>
          <h2 id={`credit-${credit.id}`}>
            {product ? `${product.product_name}${product.variant_label ? ` · ${product.variant_label}` : ""}` : "Crédit"}
          </h2>
          <p className={styles.muted}>
            Commande {credit.order?.number} · {formatFCFA(credit.total_amount)}
          </p>
        </div>
        {credit.status === "solde" ? (
          <Badge variant="success">Crédit soldé</Badge>
        ) : p.lateDays > 0 ? (
          <Badge variant="danger">En retard de {p.lateDays} j</Badge>
        ) : (
          <Badge variant="violet-soft">En cours</Badge>
        )}
      </header>

      {/* Jauge : mensualités payées sur le total */}
      <div className={styles.gauge}>
        <div className={styles.gaugeHead}>
          <strong>
            {p.paid}/{p.total} mensualités payées
          </strong>
          <span>{p.percent} %</span>
        </div>
        <div className={styles.bar} role="img" aria-label={`${p.paid} mensualités payées sur ${p.total}`}>
          <span style={{ width: `${p.percent}%` }} />
        </div>
        <p className={styles.muted}>
          Acompte de {formatFCFA(credit.down_payment)}{" "}
          {credit.down_paid_at ? "encaissé" : "à régler à la boutique"} · reste à payer {formatFCFA(p.due)}
        </p>
      </div>

      {/* Prochaine échéance */}
      {p.next && credit.status === "en_cours" && (
        <div className={`${styles.next} ${days < 0 ? styles.nextLate : ""}`}>
          <CalendarClock size={22} aria-hidden />
          <div>
            <p className={styles.nextLabel}>Prochaine échéance</p>
            <p className={styles.nextAmount}>{formatFCFA(p.next.amount)}</p>
            <p className={styles.muted}>
              {dateFr.format(new Date(p.next.due_date))} ·{" "}
              {days < 0 ? `en retard de ${-days} jour${-days > 1 ? "s" : ""}` : days === 0 ? "aujourd'hui" : `dans ${days} jour${days > 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            href={whatsappLink(
              `Bonjour TechDouala, je veux payer mon échéance de ${formatFCFA(p.next.amount)} (commande ${credit.order?.number}).`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Payer maintenant
          </Button>
        </div>
      )}

      {/* Comment payer : tant que le paiement en ligne n'est pas branché */}
      {credit.status === "en_cours" && (
        <ul className={styles.how}>
          <li>
            <Smartphone size={16} aria-hidden /> Mobile Money ou Orange Money au {STORE.phone}, puis envoie le reçu sur WhatsApp.
          </li>
          <li>
            <Banknote size={16} aria-hidden /> Ou en cash à la boutique. La boutique valide le paiement et la jauge avance.
          </li>
        </ul>
      )}

      {/* Échéancier */}
      <div className={styles.schedule}>
        <p className={styles.scheduleTitle}>Échéancier</p>
        <ul>
          {credit.installments.map((i) => {
            const st = installmentState(i);
            return (
              <li key={i.id}>
                <span className={i.paid_at ? styles.dotDone : styles.dot}>{i.paid_at ? <Check size={12} /> : i.number}</span>
                <span className={styles.scheduleDate}>{dateShort.format(new Date(i.due_date))}</span>
                <span className={styles.scheduleAmount}>{formatFCFA(i.amount)}</span>
                <Badge variant={st.badge}>{st.label}</Badge>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
