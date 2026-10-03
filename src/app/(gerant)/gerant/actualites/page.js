import Status from "@/components/admin/Status";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import NewsForm from "@/components/admin/NewsForm";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteNews, setNewsPublished } from "./actions";
import a from "@/components/admin/admin.module.css";

export const metadata = { title: "Actualités - TechDouala" };

const day = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Douala" });

function state(n, now) {
  if (!n.is_published) return { label: "Brouillon", tone: "off" };
  if (n.starts_at && n.starts_at > now) return { label: "Programmée", tone: "wait" };
  if (n.ends_at && n.ends_at <= now) return { label: "Terminée", tone: "off" };
  return { label: "En ligne", tone: "done" };
}

export default async function NewsAdminPage() {
  await requireOwner();
  const supabase = await createClient();
  const [{ data: news }, { data: categories }] = await Promise.all([
    supabase.from("news").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("slug, name").order("position"),
  ]);
  const now = new Date().toISOString();

  return (
    <>
      <header className={a.head}>
        <div>
          <h1 className={a.title}>Actualités</h1>
          <p className={a.subtitle}>
            Annonces affichées côté client : bandeau en haut du site ou cartes sur la page d&apos;accueil.
          </p>
        </div>
      </header>

      <section className={a.card}>
        <h2 className={a.cardTitle}>Nouvelle actualité</h2>
        <NewsForm categories={categories ?? []} />
      </section>

      <section className={a.card}>
        <h2 className={a.cardTitle}>Actualités publiées et brouillons</h2>
        {!news?.length ? (
          <p className={a.muted}>Aucune actualité pour le moment.</p>
        ) : (
          <div className={a.tableWrap}>
            <table className={a.table}>
              <thead>
                <tr>
                  <th>Actualité</th>
                  <th>Emplacement</th>
                  <th>Période</th>
                  <th>État</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {news.map((n) => {
                  const st = state(n, now);
                  return (
                    <tr key={n.id}>
                      <td>
                        <span className={a.strong}>{n.title}</span>
                        {n.body && <p className={a.muted}>{n.body.slice(0, 90)}</p>}
                      </td>
                      <td>{n.placement === "bandeau" ? "Bandeau" : "Accueil"}</td>
                      <td className={a.muted}>
                        {n.starts_at ? day.format(new Date(n.starts_at)) : "Dès publication"} →{" "}
                        {n.ends_at ? day.format(new Date(n.ends_at)) : "sans fin"}
                      </td>
                      <td>
                        <Status tone={st.tone}>{st.label}</Status>
                      </td>
                      <td>
                        <div className={a.actions}>
                          <form action={setNewsPublished.bind(null, n.id, !n.is_published)}>
                            <button type="submit" className={a.linkBtn}>
                              {n.is_published ? "Dépublier" : "Publier"}
                            </button>
                          </form>
                          <form action={deleteNews.bind(null, n.id)}>
                            <ConfirmSubmit message={`Supprimer « ${n.title} » ?`} className={a.linkBtn}>
                              Supprimer
                            </ConfirmSubmit>
                          </form>
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
