import Link from "next/link";
import Status from "@/components/admin/Status";
import { requireStaff } from "@/lib/auth";
import { listCredits } from "@/lib/data/credit";
import { creditProgress } from "@/lib/credit";
import { formatFCFA } from "@/lib/format";
import { normalizeCmPhone } from "@/lib/checkout";
import a from "@/components/admin/admin.module.css";
import styles from "./credits.module.css";

export const metadata = { title: "Crédits & relances - TechDouala" };

const dateFr = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });

// Filtres de la maquette (cahier 6.4).
const FILTERS = [
  { value: "", label: "Tous" },
  { value: "a-jour", label: "À jour" },
  { value: "1-7", label: "1-7 j de retard" },
  { value: "8-30", label: "8-30 j" },
  { value: "30+", label: "30 j et plus" },
];

const bucket = (late) => (late === 0 ? "a-jour" : late <= 7 ? "1-7" : late <= 30 ? "8-30" : "30+");

export default async function AdminCreditsPage({ searchParams }) {
  await requireStaff();
  const sp = await searchParams;
  const filter = typeof sp.retard === "string" ? sp.retard : "";

  const all = (await listCredits()).map((c) => ({ ...c, progress: creditProgress(c) }));
  const active = all.filter((c) => c.status === "en_cours");
  const counts = Object.fromEntries(FILTERS.map((f) => [f.value, 0]));
  counts[""] = active.length;
  active.forEach((c) => (counts[bucket(c.progress.lateDays)] += 1));

  const rows = (filter ? active.filter((c) => bucket(c.progress.lateDays) === filter) : all).sort(
    (x, y) => y.progress.lateDays - x.progress.lateDays,
  );
  const dueTotal = active.reduce((n, c) => n + c.progress.due, 0);
  const lateTotal = active.reduce((n, c) => n + c.progress.overdue, 0);

  return (
    <>
      <header className={a.head}>
        <div>
          <h1 className={a.title}>Crédits & relances</h1>
          <p className={a.subtitle}>
            {active.length} crédit{active.length > 1 ? "s" : ""} en cours · {formatFCFA(dueTotal)} restant à encaisser ·{" "}
            {formatFCFA(lateTotal)} en retard
          </p>
        </div>
      </header>

      <nav className={styles.filters} aria-label="Filtrer par retard">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/gerant/credits?retard=${f.value}` : "/gerant/credits"}
            className={filter === f.value ? styles.filterActive : ""}
            aria-current={filter === f.value ? "page" : undefined}
          >
            {f.label} <span>{counts[f.value]}</span>
          </Link>
        ))}
      </nav>

      <div className={a.tableWrap}>
        {rows.length === 0 ? (
          <div className={a.empty}>
            <strong>Aucun crédit ici</strong>
            Les achats à crédit apparaîtront dans cette liste.
          </div>
        ) : (
          <table className={a.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Commande</th>
                <th>Progression</th>
                <th>Prochaine échéance</th>
                <th className={a.num}>Reste à payer</th>
                <th>Retard</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/gerant/credits/${c.id}`} className={a.strong}>
                      {c.client?.full_name ?? c.order?.customer_name ?? "Client"}
                    </Link>
                    <p className={a.muted}>{normalizeCmPhone(c.client?.phone ?? c.order?.customer_phone ?? "") ?? "—"}</p>
                  </td>
                  <td>
                    <Link href={`/gerant/credits/${c.id}`}>{c.order?.number}</Link>
                    <p className={a.muted}>{c.order?.items?.[0]?.product_name}</p>
                  </td>
                  <td>
                    <div className={styles.progress}>
                      <span style={{ width: `${c.progress.percent}%` }} />
                    </div>
                    <p className={a.muted}>
                      {c.progress.paid}/{c.progress.total} · acompte {c.down_paid_at ? "encaissé" : "à encaisser"}
                    </p>
                  </td>
                  <td>
                    {c.status !== "en_cours" ? (
                      <Status tone={c.status === "solde" ? "done" : "off"}>{c.status === "solde" ? "Soldé" : "Annulé"}</Status>
                    ) : c.progress.next ? (
                      <>
                        {dateFr.format(new Date(c.progress.next.due_date))}
                        <p className={a.muted}>{formatFCFA(c.progress.next.amount)}</p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`${a.num} ${a.strong}`}>{formatFCFA(c.status === "en_cours" ? c.progress.due : c.progress.remaining)}</td>
                  <td>
                    {c.progress.lateDays > 0 ? (
                      <Status tone={c.progress.lateDays > 30 ? "critical" : "wait"}>{c.progress.lateDays} j de retard</Status>
                    ) : (
                      <Status tone="done">À jour</Status>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
