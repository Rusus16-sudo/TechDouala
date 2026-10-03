import Status from "@/components/admin/Status";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import PromoForm from "@/components/admin/PromoForm";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFCFA } from "@/lib/format";
import { deletePromo, setPromoActive } from "./actions";
import a from "@/components/admin/admin.module.css";

export const metadata = { title: "Codes promo - TechDouala" };

const day = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Douala" });

function state(p, now) {
  if (!p.is_active) return { label: "Désactivé", tone: "off" };
  if (p.starts_at && p.starts_at > now) return { label: "Programmé", tone: "wait" };
  if (p.ends_at && p.ends_at <= now) return { label: "Expiré", tone: "off" };
  return { label: "Actif", tone: "done" };
}

export default async function PromosPage() {
  await requireOwner();
  const supabase = await createClient();
  const [{ data: promos }, { data: uses }, { data: categories }] = await Promise.all([
    supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("promo_code, discount").not("promo_code", "is", null).neq("status", "annulee"),
    supabase.from("categories").select("slug, name").order("position"),
  ]);

  const stats = new Map();
  (uses ?? []).forEach((u) => {
    const s = stats.get(u.promo_code) ?? { count: 0, discount: 0 };
    stats.set(u.promo_code, { count: s.count + 1, discount: s.discount + u.discount });
  });
  const now = new Date().toISOString();
  const catName = (slug) => categories?.find((c) => c.slug === slug)?.name;

  return (
    <>
      <header className={a.head}>
        <div>
          <h1 className={a.title}>Codes promo</h1>
          <p className={a.subtitle}>Les clients saisissent le code au moment de la commande.</p>
        </div>
      </header>

      <section className={a.card}>
        <h2 className={a.cardTitle}>Nouveau code</h2>
        <PromoForm categories={categories ?? []} />
      </section>

      <section className={a.card}>
        <h2 className={a.cardTitle}>Codes existants</h2>
        {!promos?.length ? (
          <p className={a.muted}>Aucun code pour le moment.</p>
        ) : (
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Remise</th>
                  <th>Conditions</th>
                  <th>Période</th>
                  <th className={a.num}>Utilisations</th>
                  <th>État</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => {
                  const s = stats.get(p.code) ?? { count: 0, discount: 0 };
                  const st = state(p, now);
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className={a.strong}>{p.code}</span>
                        {p.description && <p className={a.muted}>{p.description}</p>}
                      </td>
                      <td className={a.strong}>{p.kind === "pourcentage" ? `-${p.value} %` : `-${formatFCFA(p.value)}`}</td>
                      <td className={a.muted}>
                        {p.min_order > 0 ? `Dès ${formatFCFA(p.min_order)}` : "Sans minimum"}
                        {p.category_slug && ` · ${catName(p.category_slug)}`}
                        {p.max_uses_per_phone && ` · ${p.max_uses_per_phone}× par client`}
                      </td>
                      <td className={a.muted}>
                        {p.starts_at ? day.format(new Date(p.starts_at)) : "Dès maintenant"} →{" "}
                        {p.ends_at ? day.format(new Date(p.ends_at)) : "sans fin"}
                      </td>
                      <td className={a.num}>
                        {s.count}
                        {p.max_uses ? ` / ${p.max_uses}` : ""}
                        {s.discount > 0 && <p className={a.muted}>-{formatFCFA(s.discount)}</p>}
                      </td>
                      <td>
                        <Status tone={st.tone}>{st.label}</Status>
                      </td>
                      <td>
                        <div className={a.actions}>
                          <form action={setPromoActive.bind(null, p.id, !p.is_active)}>
                            <button type="submit" className={a.linkBtn}>
                              {p.is_active ? "Désactiver" : "Activer"}
                            </button>
                          </form>
                          {s.count === 0 && (
                            <form action={deletePromo.bind(null, p.id)}>
                              <ConfirmSubmit message={`Supprimer le code ${p.code} ?`} className={a.linkBtn}>
                                Supprimer
                              </ConfirmSubmit>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
