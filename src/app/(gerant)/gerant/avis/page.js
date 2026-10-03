import Link from "next/link";
import { Star } from "lucide-react";
import Status from "@/components/admin/Status";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/orders";
import { deleteReview, setReviewPublished } from "./actions";
import a from "@/components/admin/admin.module.css";
import styles from "./avis.module.css";

export const metadata = { title: "Avis clients - TechDouala" };

function Stars({ value }) {
  return (
    <span className={styles.stars} aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} fill={n <= value ? "currentColor" : "none"} strokeWidth={2} aria-hidden />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage({ searchParams }) {
  await requireStaff();
  const sp = await searchParams;
  const filter = typeof sp.filtre === "string" ? sp.filtre : "";

  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("id, rating, comment, is_published, created_at, product:products(name, slug), author:profiles!reviews_user_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter === "masques") query = query.eq("is_published", false);
  if (filter === "negatifs") query = query.lte("rating", 3);
  const { data: reviews, error } = await query;
  if (error) throw error;

  const average = reviews.length ? (reviews.reduce((n, r) => n + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <>
      <header className={a.head}>
        <div>
          <h1 className={a.title}>Avis clients</h1>
          <p className={a.subtitle}>
            {reviews.length} avis · note moyenne {average} · seuls les clients ayant acheté peuvent noter
          </p>
        </div>
      </header>

      <nav className={styles.filters} aria-label="Filtrer les avis">
        {[
          { value: "", label: "Tous" },
          { value: "negatifs", label: "3 étoiles et moins" },
          { value: "masques", label: "Masqués" },
        ].map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/gerant/avis?filtre=${f.value}` : "/gerant/avis"}
            className={filter === f.value ? styles.filterActive : ""}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <div className={a.tableWrap}>
        {reviews.length === 0 ? (
          <div className={a.empty}>
            <strong>Aucun avis pour le moment</strong>
            Les clients pourront noter leurs achats depuis leur compte.
          </div>
        ) : (
          <ul className={styles.list}>
            {reviews.map((r) => (
              <li key={r.id} className={styles.item}>
                <div className={styles.main}>
                  <div className={styles.head}>
                    <Stars value={r.rating} />
                    <Link href={`/produit/${r.product?.slug}`} target="_blank" className={a.strong}>
                      {r.product?.name}
                    </Link>
                    {!r.is_published && <Status tone="off">Masqué</Status>}
                  </div>
                  {r.comment && <p className={styles.comment}>{r.comment}</p>}
                  <p className={a.muted}>
                    {r.author?.full_name ?? "Client"} · {formatDateTime(r.created_at)}
                  </p>
                </div>
                <div className={a.actions}>
                  <form action={setReviewPublished.bind(null, r.id, !r.is_published)}>
                    <button type="submit" className={a.linkBtn}>
                      {r.is_published ? "Masquer" : "Publier"}
                    </button>
                  </form>
                  <form action={deleteReview.bind(null, r.id)}>
                    <ConfirmSubmit message="Supprimer définitivement cet avis ?" className={a.linkBtn}>
                      Supprimer
                    </ConfirmSubmit>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
