import { notFound } from "next/navigation";
import { Check, CircleX, MessageCircle, PackageCheck, ReceiptText } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import LiveRefresh from "@/components/account/LiveRefresh";
import RatePrompt, { productsToRate } from "@/components/account/RatePrompt";
import { requireClient } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFCFA } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_STATUSES, clientStatusLabel, formatDateTime, paymentLabel } from "@/lib/orders";
import { orderFollowUpMessage, waLink } from "@/lib/whatsapp";
import styles from "@/components/account/account.module.css";

export const metadata = { title: "Suivi de commande - TechDouala", robots: { index: false } };

/** Étapes affichées au client : paiement et remise se conviennent sur WhatsApp. */
function steps(order) {
  return [
    { key: "en_attente", icon: ReceiptText, title: "Commande reçue", text: "Un conseiller te contacte sur WhatsApp" },
    { key: "confirmee", icon: Check, title: "Confirmée", text: "La boutique prépare ton appareil." },
    {
      key: "livree",
      icon: PackageCheck,
      title: "Remise",
      text: "Vérifie ton appareil et garde ta facture.",
    },
  ];
}

export default async function AccountOrderPage({ params }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { user } = await requireClient(`/compte/commandes/${id}`);

  const supabase = await createClient();
  const [{ data: o }, { data: reviewed }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(images:product_images(url, position)))")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("reviews").select("product_id").eq("user_id", user.id),
  ]);
  if (!o) notFound();
  // Commande remise : on invite à noter les produits qui n'ont pas encore d'avis.
  const toRate = o.status === "livree" ? productsToRate(o.items.filter((i) => i.product_id), reviewed) : [];

  const list = steps(o).map((s) => ({ ...s, time: s.key === "en_attente" ? o.created_at : null }));
  // Anciennes étapes « prête » et « en livraison » : affichées comme « confirmée ».
  const status = o.status === "prete" || o.status === "en_livraison" ? "confirmee" : o.status;
  const reached = status === "annulee" ? -1 : list.findIndex((s) => s.key === status);

  return (
    <div className="container">
      {/* Le suivi avance sans recharger tant que la boutique traite la commande. */}
      {!["livree", "annulee"].includes(o.status) && <LiveRefresh />}
      <Breadcrumb items={[{ label: "Mon compte", href: "/compte" }, { label: o.number }]} />
      <header className={styles.head}>
        <div>
          <h1>Commande {o.number}</h1>
          <p className={styles.muted}>Passée le {formatDateTime(o.created_at)}</p>
        </div>
        <Badge variant={ORDER_STATUSES[o.status].badge}>{clientStatusLabel(o.status)}</Badge>
      </header>

      <div className={styles.grid}>
        <div className={styles.side}>
          <section className={styles.card} aria-labelledby="track-title">
            <h2 id="track-title">Suivi</h2>
            {o.status === "annulee" ? (
              <p className={styles.alert}>
                <CircleX size={16} aria-hidden /> Cette commande a été annulée. Contacte-nous sur WhatsApp pour toute question.
              </p>
            ) : (
              <ol className={styles.timeline}>
                {list.map((s, i) => {
                  const Icon = s.icon;
                  const done = i < reached || (i === reached && s.key === "livree");
                  const current = i === reached && !done;
                  return (
                    <li key={s.key} className={`${styles.step} ${done || i < reached ? styles.stepDone : ""} ${current ? styles.stepCurrent : ""}`}>
                      <span className={styles.stepIcon}>
                        <Icon size={16} aria-hidden />
                      </span>
                      <div className={styles.stepText}>
                        <strong>{s.title}</strong>
                        {i <= reached && <span>{s.time ? `${s.text} · ${formatDateTime(s.time)}` : s.text}</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <RatePrompt products={toRate} />
        </div>

        <div className={styles.side}>
          <section className={styles.card} aria-labelledby="items-title">
            <h2 id="items-title">Articles</h2>
            <ul className={styles.lines}>
              {o.items.map((i) => (
                <li key={i.id}>
                  <span>
                    {i.qty} × {i.product_name}
                    <small>{[i.variant_label, i.color].filter(Boolean).join(" · ")}</small>
                  </span>
                  <strong>{formatFCFA(i.total)}</strong>
                </li>
              ))}
            </ul>
            <dl className={styles.totals}>
              {o.discount > 0 && (
                <div>
                  <dt>Remise{o.promo_code ? ` (${o.promo_code})` : ""}</dt>
                  <dd>-{formatFCFA(o.discount)}</dd>
                </div>
              )}
              {o.delivery_fee > 0 && (
                <div>
                  <dt>Livraison</dt>
                  <dd>{formatFCFA(o.delivery_fee)}</dd>
                </div>
              )}
              <div className={styles.totalRow}>
                <dt>Total</dt>
                <dd>{formatFCFA(o.total)}</dd>
              </div>
            </dl>
          </section>

          <section className={`${styles.card} ${styles.info}`} aria-labelledby="info-title">
            <h2 id="info-title">Règlement</h2>
            <p>
              {paymentLabel(o.payment_method)} · {PAYMENT_STATUSES[o.payment_status].label}
            </p>
            <p className={styles.muted}>Paiement et remise se conviennent avec la boutique sur WhatsApp.</p>
            {o.status !== "annulee" && o.status !== "livree" && (
              <div className={styles.infoAction}>
                <Button
                  href={waLink(orderFollowUpMessage({ number: o.number, status: o.status, items: o.items, total: o.total }))}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                >
                  <MessageCircle size={16} aria-hidden /> {o.status === "en_attente" ? "Envoyer ma commande sur WhatsApp" : "Écrire à la boutique"}
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
