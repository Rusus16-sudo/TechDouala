import Link from "next/link";
import { FileSpreadsheet, FileText } from "lucide-react";
import Status from "@/components/admin/Status";
import Button from "@/components/ui/Button";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFCFA } from "@/lib/format";
import { CHANNEL_LABELS, ORDER_PERIODS, ORDER_STATUSES, PAYMENT_STATUSES, formatDateTime, paymentLabel } from "@/lib/orders";
import { orderFiltersQuery, queryOrders, readOrderFilters } from "@/lib/data/orders";
import a from "@/components/admin/admin.module.css";
import Select from "@/components/ui/Select";
import styles from "./commandes.module.css";
import { advanceOrder } from "./actions";

export const metadata = { title: "Commandes - TechDouala" };

export default async function AdminOrdersPage({ searchParams }) {
  await requireStaff();
  const filters = readOrderFilters(await searchParams);
  const { status, channel, period, q } = filters;

  const supabase = await createClient();
  const { data: orders, error } = await queryOrders(supabase, filters, {
    select: "id, number, created_at, channel, status, payment_method, payment_status, customer_name, customer_phone, credit_requested, total, order_items(qty)",
    limit: 200,
  });
  if (error) throw error;
  // Les exports reprennent exactement les filtres affichés (sans la limite de 200 lignes de la liste).
  const filtersQuery = orderFiltersQuery(filters);
  const exportHref = `/gerant/commandes/export${filtersQuery ? `?${filtersQuery}` : ""}`;
  const pdfHref = `/gerant/commandes/pdf${filtersQuery ? `?${filtersQuery}` : ""}`;

  return (
    <>
      <header className={a.head}>
        <div>
          <h1 className={a.title}>Commandes</h1>
          <p className={a.subtitle}>Ventes en ligne et en boutique, les plus récentes en premier.</p>
        </div>
        <div className={a.actions}>
          <Button href={pdfHref} variant="secondary" icon={FileText} prefetch={false}>
            Télécharger en PDF
          </Button>
          <Button href={exportHref} variant="secondary" icon={FileSpreadsheet} prefetch={false}>
            Exporter en Excel
          </Button>
          <Button href="/gerant/vente">Nouvelle vente</Button>
        </div>
      </header>

      <form className={a.toolbar} role="search">
        <input type="search" name="q" defaultValue={q} placeholder="N° de commande, nom ou téléphone…" aria-label="Rechercher" />
        <Select
          name="statut"
          defaultValue={status ?? ""}
          aria-label="Statut"
          className={a.toolbarSelect}
          options={[{ value: "", label: "Tous les statuts" }, ...Object.entries(ORDER_STATUSES).map(([k, v]) => ({ value: k, label: v.label }))]}
        />
        <Select
          name="canal"
          defaultValue={channel ?? ""}
          aria-label="Canal"
          className={a.toolbarSelect}
          options={[{ value: "", label: "En ligne et boutique" }, ...Object.entries(CHANNEL_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
        />
        <Select name="periode" defaultValue={period} aria-label="Période" className={a.toolbarSelect} options={ORDER_PERIODS} />
        <Button type="submit" variant="secondary">
          Filtrer
        </Button>
      </form>

      <div className={a.tableWrap}>
        {orders.length === 0 ? (
          <div className={a.empty}>
            <strong>Aucune commande pour le moment</strong>
            Les commandes en ligne et les ventes en boutique apparaîtront ici.
          </div>
        ) : (
          <table className={`${a.table} ${styles.orders}`}>
            <thead>
              <tr>
                <th>Commande</th>
                <th>Client</th>
                <th>Canal</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th className={a.num}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const items = o.order_items.reduce((n, i) => n + i.qty, 0);
                return (
                  <tr key={o.id} className={a.rowLink}>
                    <td>
                      <Link href={`/gerant/commandes/${o.id}`} className={`${a.strong} ${a.rowTarget}`}>
                        {o.number}
                      </Link>
                      <p className={a.muted}>
                        {formatDateTime(o.created_at)} · {items} article{items > 1 ? "s" : ""}
                      </p>
                    </td>
                    <td>
                      {o.customer_name}
                      {o.customer_phone && <p className={a.muted}>{o.customer_phone}</p>}
                    </td>
                    <td>
                      {CHANNEL_LABELS[o.channel]}
                      <p className={a.muted}>{o.channel === "en_ligne" ? "WhatsApp" : "Comptoir"}</p>
                    </td>
                    <td>
                      <Status tone={ORDER_STATUSES[o.status].tone}>{ORDER_STATUSES[o.status].label}</Status>
                      {o.status === "en_attente" && (
                        <form action={advanceOrder.bind(null, o.id, "confirmee")} className={a.aboveRow}>
                          <Button type="submit" size="sm">
                            Confirmer
                          </Button>
                        </form>
                      )}
                    </td>
                    <td>
                      <Status tone={PAYMENT_STATUSES[o.payment_status].tone}>{PAYMENT_STATUSES[o.payment_status].label}</Status>
                      <p className={a.muted}>
                        {o.credit_requested && !o.payment_method ? "Crédit demandé" : paymentLabel(o.payment_method)}
                      </p>
                    </td>
                    <td className={`${a.num} ${a.strong}`}>{formatFCFA(o.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
