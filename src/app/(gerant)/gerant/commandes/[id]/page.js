import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Smartphone } from "lucide-react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import Status from "@/components/admin/Status";
import Button from "@/components/ui/Button";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFCFA } from "@/lib/format";
import {
  CASH_METHODS, CHANNEL_LABELS, ORDER_STATUSES, PAYMENT_STATUSES, clientStatusLabel, formatDateTime, nextStatuses, paymentLabel,
} from "@/lib/orders";
import { staffOrderMessage, waLink } from "@/lib/whatsapp";
import { advanceOrder, cancelOrder, convertToCredit, markPaid } from "../actions";
import a from "@/components/admin/admin.module.css";
import styles from "./commande.module.css";

export const metadata = { title: "Commande - TechDouala" };

const NEXT_LABELS = {
  confirmee: "Confirmer la commande",
  livree: "Marquer remise au client",
};

const initials = (name) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

// « 691845626 » → « 6 91 84 56 26 », comme on l'écrit au Cameroun.
const formatPhone = (p) => String(p).replace(/^(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");

const firstPhoto = (product) => [...(product?.images ?? [])].sort((x, y) => x.position - y.position)[0]?.url ?? null;

export default async function AdminOrderPage({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  // Contrôle d'accès et lecture en parallèle (les règles RLS protègent déjà la commande).
  const [, { data: o }] = await Promise.all([
    requireStaff(),
    supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(images:product_images(url, position))), credit:credits(id), seller:profiles!orders_seller_id_fkey(full_name)")
      .eq("id", id)
      .maybeSingle(),
  ]);
  if (!o) notFound();

  const next = nextStatuses(o);
  const cancellable = !["livree", "annulee"].includes(o.status);
  const creditId = (Array.isArray(o.credit) ? o.credit[0] : o.credit)?.id ?? null;
  const isCredit = o.payment_method === "credit";
  const payable = o.payment_status !== "paye" && o.status !== "annulee" && !isCredit;

  // Crédit 40/60 : possible sur une commande en ligne liée à un compte, pas encore payée.
  const creditPossible = o.channel === "en_ligne" && payable && o.status !== "livree";
  let creditEligibility = null;
  if (creditPossible && o.user_id) {
    const { data } = await supabase.rpc("credit_eligibility", { p_user: o.user_id });
    creditEligibility = data ?? null;
  }

  return (
    <>
      <header className={a.head}>
        <div>
          <p className={a.subtitle}>
            <Link href="/gerant/commandes">← Commandes</Link>
          </p>
          <h1 className={a.title}>Commande {o.number}</h1>
          <p className={a.subtitle}>
            {formatDateTime(o.created_at)} · {CHANNEL_LABELS[o.channel]}
            {o.seller?.full_name && ` · vendue par ${o.seller.full_name}`}
          </p>
        </div>
        <div className={styles.status}>
          <Status tone={ORDER_STATUSES[o.status].tone}>{ORDER_STATUSES[o.status].label}</Status>
          <Status tone={PAYMENT_STATUSES[o.payment_status].tone}>{PAYMENT_STATUSES[o.payment_status].label}</Status>
        </div>
      </header>

      {(next.length > 0 || payable || cancellable) && (
        <div className={`${a.card} ${styles.actions}`}>
          {next.map((s) => (
            <form key={s} action={advanceOrder.bind(null, o.id, s)}>
              <Button type="submit">{NEXT_LABELS[s]}</Button>
            </form>
          ))}
          {payable && (
            <div className={styles.pay}>
              <span className={a.muted}>Encaissé ({formatFCFA(o.total)}) :</span>
              {CASH_METHODS.map((m) => (
                <form key={m.id} action={markPaid.bind(null, o.id, m.id)}>
                  <button type="submit" className={styles.payBtn}>
                    {m.label}
                  </button>
                </form>
              ))}
            </div>
          )}
          {creditPossible && creditEligibility?.ok && (
            <form action={convertToCredit.bind(null, o.id)}>
              <Button type="submit" variant="secondary">
                Passer en crédit 40/60
              </Button>
            </form>
          )}
          {isCredit && creditId && (
            <Button href={`/gerant/credits/${creditId}`} variant="secondary">
              Voir le dossier de crédit
            </Button>
          )}
          {cancellable && (
            <form action={cancelOrder.bind(null, o.id)} className={styles.cancel}>
              <ConfirmSubmit message="Annuler cette commande ? Les articles seront remis en stock." className={`${a.linkBtn} ${styles.cancelBtn}`}>
                Annuler la commande
              </ConfirmSubmit>
            </form>
          )}
        </div>
      )}

      <div className={styles.grid}>
        <section className={a.card}>
          <h2 className={a.cardTitle}>Articles</h2>
          <ul className={styles.items}>
            {o.items.map((i) => {
              const photo = firstPhoto(i.product);
              return (
                <li key={i.id}>
                  <span className={styles.thumb}>
                    {photo ? (
                      <Image src={photo} alt="" fill sizes="64px" className={styles.thumbImg} />
                    ) : (
                      <Smartphone size={24} strokeWidth={1.25} aria-hidden />
                    )}
                  </span>
                  <div className={styles.itemText}>
                    <strong>{i.product_name}</strong>
                    <p className={a.muted}>
                      {[i.variant_label, i.color].filter(Boolean).join(" · ")}
                      {i.qty > 1 && ` · ${formatFCFA(i.unit_price)} l'unité`}
                    </p>
                  </div>
                  <span className={styles.qty}>× {i.qty}</span>
                  <span className={styles.lineTotal}>{formatFCFA(i.total)}</span>
                </li>
              );
            })}
          </ul>
          <dl className={styles.totals}>
            <div>
              <dt>Sous-total</dt>
              <dd>{formatFCFA(o.subtotal)}</dd>
            </div>
            {o.discount > 0 && (
              <div>
                <dt>{o.promo_code ? `Code promo ${o.promo_code}` : "Remise négociée"}</dt>
                <dd>-{formatFCFA(o.discount)}</dd>
              </div>
            )}
            {o.delivery_fee > 0 && (
              <div>
                <dt>Livraison</dt>
                <dd>{formatFCFA(o.delivery_fee)}</dd>
              </div>
            )}
            <div className={styles.total}>
              <dt>Total</dt>
              <dd>{formatFCFA(o.total)}</dd>
            </div>
          </dl>
        </section>

        <div>
          <section className={a.card}>
            <h2 className={a.cardTitle}>Client</h2>
            <div className={styles.person}>
              <span className={styles.avatar} aria-hidden>
                {initials(o.customer_name)}
              </span>
              <div>
                <p className={styles.personName}>{o.customer_name}</p>
                <p className={a.muted}>
                  {o.channel === "boutique" ? "Client en boutique" : o.user_id ? "Compte client" : "Commande sans compte"}
                </p>
              </div>
            </div>

            {(o.customer_phone || o.customer_email) && (
              <ul className={styles.contact}>
                {o.customer_phone && (
                  <li>
                    <Phone size={16} aria-hidden />
                    <a href={`tel:+237${o.customer_phone}`}>+237 {formatPhone(o.customer_phone)}</a>
                  </li>
                )}
                {o.customer_email && (
                  <li>
                    <Mail size={16} aria-hidden />
                    <a href={`mailto:${o.customer_email}`}>{o.customer_email}</a>
                  </li>
                )}
              </ul>
            )}

            {o.notes && (
              <figure className={styles.message}>
                <figcaption>{o.channel === "boutique" ? "Note" : "Message du client"}</figcaption>
                <blockquote>{o.notes}</blockquote>
              </figure>
            )}

            {o.customer_phone && (
              <div className={styles.reach}>
                <a
                  className={styles.whatsapp}
                  href={waLink(
                    staffOrderMessage({
                      number: o.number,
                      customerName: o.customer_name,
                      status: clientStatusLabel(o.status),
                    }),
                    o.customer_phone,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon size={18} className={styles.whatsappIcon} /> WhatsApp
                </a>
                <a className={styles.call} href={`tel:+237${o.customer_phone}`}>
                  <Phone size={17} aria-hidden /> Appeler
                </a>
              </div>
            )}
          </section>

          <section className={a.card}>
            <h2 className={a.cardTitle}>Règlement</h2>
            <dl className={styles.facts}>
              <div>
                <dt>Moyen</dt>
                <dd>{paymentLabel(o.payment_method)}</dd>
              </div>
              <div>
                <dt>Statut</dt>
                <dd>
                  <Status tone={PAYMENT_STATUSES[o.payment_status].tone}>{PAYMENT_STATUSES[o.payment_status].label}</Status>
                </dd>
              </div>
              {o.paid_at && (
                <div>
                  <dt>Encaissé le</dt>
                  <dd>{formatDateTime(o.paid_at)}</dd>
                </div>
              )}
            </dl>
            {o.credit_requested && !isCredit && (
              <p className={styles.request}>
                Le client demande un achat à crédit 40/60.{" "}
                {!o.user_id
                  ? "Il n'a pas de compte : il doit en créer un et repasser commande."
                  : creditEligibility && !creditEligibility.ok
                    ? creditEligibility.message
                    : "Ouvre le dossier une fois l'accord conclu sur WhatsApp."}
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
