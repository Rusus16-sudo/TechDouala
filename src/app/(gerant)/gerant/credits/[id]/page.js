import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MessageCircle, Phone, Smartphone } from "lucide-react";
import Status from "@/components/admin/Status";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCredit } from "@/lib/data/credit";
import { CREDIT_STATUS_TONE, creditProgress, daysUntil, installmentState } from "@/lib/credit";
import { formatFCFA } from "@/lib/format";
import { normalizeCmPhone } from "@/lib/checkout";
import { payDownPayment, payInstallment } from "../actions";
import a from "@/components/admin/admin.module.css";
import styles from "../credits.module.css";

export const metadata = { title: "Crédit client - TechDouala" };

const dateFr = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const METHODS = [
  { id: "cash", label: "Cash" },
  { id: "mtn-momo", label: "MoMo" },
  { id: "orange-money", label: "OM" },
];

/** Message de relance au ton de Tekô : bienveillant, avec le montant, la date et où payer (cahier 6.4). */
function relanceMessage({ firstName, amount, dueDate, number }) {
  const days = daysUntil(dueDate);
  const quand =
    days > 0
      ? `prévue le ${dateFr.format(new Date(dueDate))}`
      : days === 0
        ? "prévue aujourd'hui"
        : `attendue depuis le ${dateFr.format(new Date(dueDate))}`;
  return (
    `Bonjour ${firstName}, c'est TechDouala 👋\n` +
    `Ton échéance de ${formatFCFA(amount)} (commande ${number}) est ${quand}.\n` +
    `Tu peux payer par Mobile Money, Orange Money ou passer à la boutique. Ton suivi : ` +
    `techdouala.cm/credit\nMerci et à bientôt !`
  );
}

export default async function AdminCreditPage({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  await requireStaff();

  const credit = await getCredit(id);
  if (!credit) notFound();

  const supabase = await createClient();
  const { data: state } = await supabase.rpc("credit_state", { p_user: credit.client?.id ?? credit.user_id });
  const p = creditProgress(credit);
  const name = credit.client?.full_name ?? credit.order?.customer_name ?? "Client";
  const firstName = name.split(" ")[0];
  const phone = credit.client?.phone ?? credit.order?.customer_phone ?? "";
  const message = p.next ? relanceMessage({ firstName, amount: p.next.amount, dueDate: p.next.due_date, number: credit.order?.number }) : "";
  const waHref = `https://wa.me/237${phone}?text=${encodeURIComponent(message)}`;
  const smsHref = `sms:+237${phone}?&body=${encodeURIComponent(message)}`;

  return (
    <>
      <header className={a.head}>
        <div>
          <p className={a.subtitle}>
            <Link href="/gerant/credits">← Crédits & relances</Link>
          </p>
          <h1 className={a.title}>{name}</h1>
          <p className={a.subtitle}>
            {normalizeCmPhone(phone) ?? "—"} · commande {credit.order?.number} · {formatFCFA(credit.total_amount)}
          </p>
        </div>
        <div className={a.actions}>
          {state?.statut && <Status tone={CREDIT_STATUS_TONE[state.statut] ?? "neutral"}>{state.statut}</Status>}
          {p.lateDays > 0 && <Status tone={p.lateDays > 30 ? "critical" : "wait"}>{p.lateDays} j de retard</Status>}
        </div>
      </header>

      <div className={styles.grid}>
        <section className={a.card}>
          <h2 className={a.cardTitle}>
            Échéancier · {p.paid}/{p.total} payées
          </h2>

          <div className={styles.schedule}>
            <div className={styles.progress}>
              <span style={{ width: `${p.percent}%` }} />
            </div>
          </div>

          <ul className={styles.schedule}>
            <li>
              <span className={credit.down_paid_at ? `${styles.num} ${styles.numPaid}` : styles.num}>
                {credit.down_paid_at ? <Check size={14} /> : "A"}
              </span>
              <span>
                Acompte (40 %)
                <p className={a.muted}>À l&apos;achat</p>
              </span>
              <strong>{formatFCFA(credit.down_payment)}</strong>
              {credit.down_paid_at ? (
                <Status tone="done">Encaissé</Status>
              ) : (
                <div className={styles.pay}>
                  {METHODS.map((m) => (
                    <form key={m.id} action={payDownPayment.bind(null, credit.id, m.id)}>
                      <button type="submit" className={styles.payBtn}>
                        {m.label}
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </li>

            {credit.installments.map((i) => {
              const st = installmentState(i);
              return (
                <li key={i.id}>
                  <span className={i.paid_at ? `${styles.num} ${styles.numPaid}` : styles.num}>
                    {i.paid_at ? <Check size={14} /> : i.number}
                  </span>
                  <span>
                    Mensualité {i.number}
                    <p className={a.muted}>{dateFr.format(new Date(i.due_date))}</p>
                  </span>
                  <strong>{formatFCFA(i.amount)}</strong>
                  {i.paid_at ? (
                    <Status tone="done">Payée</Status>
                  ) : (
                    <div className={styles.pay}>
                      <Status tone={st.tone}>{st.label}</Status>
                      {METHODS.map((m) => (
                        <form key={m.id} action={payInstallment.bind(null, i.id, m.id)}>
                          <button type="submit" className={styles.payBtn}>
                            {m.label}
                          </button>
                        </form>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className={a.hint}>
            Clique sur le moyen de paiement reçu pour valider l&apos;encaissement : la jauge du client avance aussitôt.
          </p>
        </section>

        <div>
          <section className={a.card}>
            <h2 className={a.cardTitle}>Relancer</h2>
            {p.next ? (
              <>
                <div className={styles.relances}>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className={styles.relanceLink}>
                    <MessageCircle size={18} aria-hidden /> Relancer sur WhatsApp
                  </a>
                  <a href={smsHref} className={styles.relanceLink}>
                    <Smartphone size={18} aria-hidden /> Relancer par SMS
                  </a>
                  <a href={`tel:+237${phone}`} className={styles.relanceLink}>
                    <Phone size={18} aria-hidden /> Appeler {normalizeCmPhone(phone)}
                  </a>
                </div>
                <p className={`${styles.message} ${a.muted}`}>{message}</p>
                <p className={a.hint}>
                  Les relances automatiques (J-3, J0, J+1, J+7, J+15) seront envoyées par le système une fois le
                  WhatsApp Business et le fournisseur SMS branchés.
                </p>
              </>
            ) : (
              <p className={a.muted}>Rien à relancer : toutes les échéances sont payées.</p>
            )}
          </section>

          <section className={a.card}>
            <h2 className={a.cardTitle}>Détails</h2>
            <p className={a.muted}>Produit</p>
            <p className={a.strong}>
              {credit.order?.items?.map((i) => `${i.qty} × ${i.product_name}`).join(", ")}
            </p>
            <p className={a.muted} style={{ marginTop: 12 }}>
              Total {formatFCFA(credit.total_amount)} · acompte {formatFCFA(credit.down_payment)} · {credit.months} ×{" "}
              {formatFCFA(credit.monthly_amount)}
            </p>
            <p className={a.muted}>Reste à encaisser : {formatFCFA(p.due)}</p>
            <Link href={`/gerant/commandes/${credit.order_id}`} className={a.linkBtn} style={{ marginTop: 12, display: "inline-block" }}>
              Voir la commande
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
