"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CalendarClock, Handshake, MessageCircle, Package } from "lucide-react";
import Button from "@/components/ui/Button";
import TekoMessage from "@/components/ui/Teko";
import { formatFCFA } from "@/lib/format";
import { orderMessage, waLink } from "@/lib/whatsapp";
import { LAST_ORDER_KEY } from "./CheckoutForm";
import styles from "./OrderConfirmation.module.css";

const CONFETTI_COLORS = ["var(--violet)", "var(--soleil)", "var(--succes)", "#9D82FF", "var(--alerte)"];

const noopSubscribe = () => () => {};
function readOrder() {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

/** Étapes suivantes : tout se conclut avec la boutique sur WhatsApp. */
function nextSteps(order) {
  const steps = [
    {
      icon: MessageCircle,
      text: "Envoie ta commande sur WhatsApp : le message contient déjà son numéro et son détail.",
    },
    {
      icon: Handshake,
      text: "Un conseiller confirme la disponibilité et convient avec toi du paiement et de la remise de ton appareil.",
    },
  ];
  if (order.credit) {
    steps.push({
      icon: CalendarClock,
      text: `Crédit 40/60 : acompte de ${formatFCFA(order.credit.downPayment)}, puis ${order.credit.months} mensualités de ${formatFCFA(order.credit.monthly)}. La boutique ouvre ton dossier, suivi ensuite dans ton espace crédit.`,
    });
  }
  steps.push({ icon: Package, text: "Vérifie l'état de ton téléphone à la réception et garde ta facture." });
  return steps;
}

export default function OrderConfirmation() {
  const raw = useSyncExternalStore(noopSubscribe, readOrder, () => undefined);
  const order = useMemo(() => {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [raw]);

  if (raw === undefined) return <div className={styles.loading} aria-busy="true" />;

  // État « Aucune commande » (cahier 7.5).
  if (!order) {
    return (
      <div className={styles.none}>
        <span className={styles.noneIcon}>
          <Package size={40} strokeWidth={1.5} aria-hidden />
        </span>
        <h1>Aucune commande pour le moment</h1>
        <p>Une fois tes achats effectués, ils apparaîtront ici.</p>
        <Button href="/categories/smartphones" size="lg">
          Découvrir le catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.confetti} aria-hidden>
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              style={{
                "--x": `${(i * 37) % 100}%`,
                "--delay": `${(i % 7) * 90}ms`,
                "--drift": `${((i % 5) - 2) * 18}px`,
                "--rot": `${(i * 47) % 360}deg`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              }}
            />
          ))}
        </div>

        <svg className={styles.check} viewBox="0 0 96 96" aria-hidden>
          <circle className={styles.checkCircle} cx="48" cy="48" r="44" />
          <path className={styles.checkMark} d="M29 49 l13 13 l26 -28" />
        </svg>

        <h1 className={styles.title}>Commande enregistrée !</h1>
        <p className={styles.lead}>Merci pour ta confiance, {order.customer.fullName.split(" ")[0]}.</p>
        <p className={styles.number}>
          N° de commande <strong>{order.number}</strong>
        </p>
      </div>

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="next-title">
          <h2 id="next-title">Et maintenant ?</h2>
          <ol className={styles.steps}>
            {nextSteps(order).map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className={styles.stepIcon}>
                  <Icon size={18} aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ol>
          <TekoMessage title="Dernière étape">Envoie le message WhatsApp pour qu&apos;on s&apos;occupe de toi.</TekoMessage>
        </section>

        <section className={styles.card} aria-labelledby="recap-title">
          <h2 id="recap-title">Récapitulatif</h2>
          <ul className={styles.lines}>
            {order.lines.map((l) => (
              <li key={`${l.id}-${l.storage}-${l.color}`}>
                <span>
                  {l.qty} × {l.name}
                  <small>{[l.storage, l.color].filter(Boolean).join(" · ")}</small>
                </span>
                <strong>{formatFCFA(l.total)}</strong>
              </li>
            ))}
          </ul>
          <dl className={styles.amounts}>
            <div>
              <dt>Sous-total</dt>
              <dd>{formatFCFA(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div>
                <dt>Remise ({order.promoCode})</dt>
                <dd>-{formatFCFA(order.discount)}</dd>
              </div>
            )}
            <div className={styles.totalRow}>
              <dt>Total</dt>
              <dd>{formatFCFA(order.total)}</dd>
            </div>
            {order.credit && (
              <>
                <div>
                  <dt>Acompte (40 %)</dt>
                  <dd>{formatFCFA(order.credit.downPayment)}</dd>
                </div>
                <div>
                  <dt>{order.credit.months} mensualités</dt>
                  <dd>{formatFCFA(order.credit.monthly)}</dd>
                </div>
              </>
            )}
            <div>
              <dt>Règlement</dt>
              <dd>{order.credit ? "Crédit 40/60 (demande)" : "Comptant"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className={styles.actions}>
        <Button
          href={waLink(orderMessage(order))}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          className={styles.wa}
        >
          <MessageCircle size={18} aria-hidden /> Envoyer ma commande sur WhatsApp
        </Button>
        <Button href="/categories/smartphones" size="lg" variant="secondary">
          Continuer mes achats
        </Button>
        <Button href="/compte" size="lg" variant="ghost">
          Suivre mes commandes
        </Button>
      </div>
    </div>
  );
}
