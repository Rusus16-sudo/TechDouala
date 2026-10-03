import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import SalesChart from "@/components/admin/SalesChart";
import { requireOwner } from "@/lib/auth";
import { getDashboard } from "@/lib/data/dashboard";
import { formatFCFA } from "@/lib/format";
import { CHANNEL_LABELS, paymentLabel } from "@/lib/orders";
import a from "@/components/admin/admin.module.css";
import styles from "./dashboard.module.css";

export const metadata = { title: "Tableau de bord - TechDouala" };

const PERIODS = [7, 30, 90];
// Couleurs d'identité des canaux (validées : écart CVD ΔE 44 ; valeurs toujours écrites à côté).
const CHANNEL_COLORS = { en_ligne: "var(--violet)", boutique: "#C98500" };

function Delta({ now, before }) {
  if (!before) return <span className={styles.deltaNeutral}>Pas de période précédente</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const Icon = pct > 0 ? ArrowUpRight : pct < 0 ? ArrowDownRight : Minus;
  const cls = pct > 0 ? styles.deltaUp : pct < 0 ? styles.deltaDown : styles.deltaNeutral;
  return (
    <span className={cls}>
      <Icon size={14} aria-hidden /> {pct > 0 ? "+" : ""}
      {pct} % vs période précédente
    </span>
  );
}

export default async function DashboardPage({ searchParams }) {
  await requireOwner();
  const sp = await searchParams;
  const days = PERIODS.includes(Number(sp.periode)) ? Number(sp.periode) : 30;
  const d = await getDashboard(days);
  const { current: c, previous: p } = d;

  const channelTotal = [...d.channels.values()].reduce((n, v) => n + v, 0);
  const payments = [...d.payments.entries()].sort((x, y) => y[1] - x[1]);
  const payMax = Math.max(1, ...payments.map(([, v]) => v));

  return (
    <>
      <header className={a.head}>
        <div>
          <h1 className={a.title}>Tableau de bord</h1>
          <p className={a.subtitle}>Ventes confirmées, en ligne et en boutique.</p>
        </div>
        <nav className={styles.periods} aria-label="Période">
          {PERIODS.map((n) => (
            <Link key={n} href={`/gerant?periode=${n}`} className={n === days ? styles.periodActive : ""} aria-current={n === days ? "page" : undefined}>
              {n} derniers jours
            </Link>
          ))}
        </nav>
      </header>

      {d.waiting.count > 0 && (
        <Link href="/gerant/commandes?statut=en_attente" className={styles.waiting}>
          <strong>
            {d.waiting.count} commande{d.waiting.count > 1 ? "s" : ""} à confirmer
          </strong>
          <span>
            {formatFCFA(d.waiting.total)} en attente de ta réponse sur WhatsApp · pas encore comptées dans les ventes
          </span>
        </Link>
      )}

      <section className={styles.kpis} aria-label="Indicateurs">
        <div className={`${a.card} ${styles.hero}`}>
          <p className={styles.kpiLabel}>Chiffre d&apos;affaires</p>
          <p className={styles.heroValue}>{formatFCFA(c.revenue)}</p>
          <Delta now={c.revenue} before={p.revenue} />
        </div>
        <div className={a.card}>
          <p className={styles.kpiLabel}>Commandes</p>
          <p className={styles.kpiValue}>{c.count}</p>
          <Delta now={c.count} before={p.count} />
        </div>
        <div className={a.card}>
          <p className={styles.kpiLabel}>Panier moyen</p>
          <p className={styles.kpiValue}>{formatFCFA(c.basket)}</p>
          <Delta now={c.basket} before={p.basket} />
        </div>
        <div className={a.card}>
          <p className={styles.kpiLabel}>Encaissé</p>
          <p className={styles.kpiValue}>{formatFCFA(c.paid)}</p>
          <span className={c.pending > 0 ? styles.pending : styles.deltaNeutral}>
            {c.pending > 0 ? `${formatFCFA(c.pending)} encore à encaisser` : "Tout est encaissé"}
          </span>
        </div>
      </section>

      <section className={a.card}>
        <h2 className={a.cardTitle}>Chiffre d&apos;affaires par jour</h2>
        <SalesChart series={d.series} />
      </section>

      <div className={styles.grid}>
        <section className={a.card}>
          <h2 className={a.cardTitle}>En ligne ou en boutique</h2>
          {channelTotal === 0 ? (
            <p className={a.muted}>Aucune vente sur la période.</p>
          ) : (
            <>
              <div className={styles.share} role="img" aria-label="Répartition du chiffre d'affaires par canal">
                {Object.keys(CHANNEL_LABELS).map((k) =>
                  d.channels.get(k) ? (
                    <span key={k} style={{ flexGrow: d.channels.get(k), background: CHANNEL_COLORS[k] }} />
                  ) : null,
                )}
              </div>
              <ul className={styles.legend}>
                {Object.entries(CHANNEL_LABELS).map(([k, label]) => {
                  const v = d.channels.get(k) ?? 0;
                  return (
                    <li key={k}>
                      <span className={styles.swatch} style={{ background: CHANNEL_COLORS[k] }} aria-hidden />
                      <span>{label}</span>
                      <strong>{formatFCFA(v)}</strong>
                      <span className={a.muted}>{Math.round((v / channelTotal) * 100)} %</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <section className={a.card}>
          <h2 className={a.cardTitle}>Par moyen de paiement</h2>
          {payments.length === 0 ? (
            <p className={a.muted}>Aucune vente sur la période.</p>
          ) : (
            <ul className={styles.bars}>
              {payments.map(([k, v]) => (
                <li key={k}>
                  <span className={styles.barLabel}>{paymentLabel(k)}</span>
                  <span className={styles.barTrack}>
                    <span className={styles.bar} style={{ width: `${(v / payMax) * 100}%` }} />
                  </span>
                  <strong className={styles.barValue}>{formatFCFA(v)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={a.card}>
          <h2 className={a.cardTitle}>Produits les plus vendus</h2>
          {d.top.length === 0 ? (
            <p className={a.muted}>Aucune vente sur la période.</p>
          ) : (
            <ol className={styles.top}>
              {d.top.map((t, i) => (
                <li key={t.name}>
                  <span className={styles.rank}>{i + 1}</span>
                  <span className={styles.topName}>{t.name}</span>
                  <span className={a.muted}>{t.qty} vendu{t.qty > 1 ? "s" : ""}</span>
                  <strong>{formatFCFA(t.revenue)}</strong>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={a.card}>
          <h2 className={a.cardTitle}>Stock</h2>
          <p className={styles.stockLine}>
            <strong>{d.stock.units}</strong> unités en stock · valeur de vente <strong>{formatFCFA(d.stock.value)}</strong>
          </p>
          {d.stock.low.length === 0 ? (
            <p className={a.muted}>Aucune alerte de stock.</p>
          ) : (
            <ul className={styles.alerts}>
              {d.stock.low.map((s, i) => (
                <li key={`${s.productId}-${s.label}-${i}`}>
                  <Link href={`/gerant/produits/${s.productId}`}>
                    {s.name}
                    {s.label && ` · ${s.label}`}
                  </Link>
                  <span className={s.stock === 0 || s.forced ? styles.out : styles.low}>
                    {s.forced ? "Rupture" : s.stock === 0 ? "Épuisé" : `${s.stock} restant${s.stock > 1 ? "s" : ""}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
