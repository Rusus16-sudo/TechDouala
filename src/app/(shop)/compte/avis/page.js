import Link from "next/link";
import { Star } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import ReviewForm from "@/components/account/ReviewForm";
import { requireClient } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import styles from "@/components/account/account.module.css";

export const metadata = { title: "Mes avis - TechDouala", robots: { index: false } };

export default async function ReviewsPage() {
  const { user } = await requireClient("/compte/avis");
  const supabase = await createClient();

  // Produits des commandes remises (seules à ouvrir droit à un avis) et avis déjà déposés.
  const [{ data: items }, { data: reviews }] = await Promise.all([
    supabase
      .from("order_items")
      .select("product_id, product_name, variant_label, order:orders!inner(id, status, created_at, user_id)")
      .eq("order.user_id", user.id)
      .eq("order.status", "livree")
      .not("product_id", "is", null)
      .order("created_at", { ascending: false, referencedTable: "orders" }),
    supabase.from("reviews").select("id, product_id, rating, comment, is_published").eq("user_id", user.id),
  ]);

  const byProduct = new Map();
  (items ?? []).forEach((i) => byProduct.has(i.product_id) || byProduct.set(i.product_id, i));
  const reviewOf = new Map((reviews ?? []).map((r) => [r.product_id, r]));
  const products = [...byProduct.values()];

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Mon compte", href: "/compte" }, { label: "Mes avis" }]} />

      <header className={styles.head}>
        <div>
          <h1>Mes avis</h1>
          <p className={styles.muted}>Note les appareils que tu as achetés : ça aide les prochains clients.</p>
        </div>
      </header>

      {products.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.empty}>
            <Star size={40} strokeWidth={1.5} aria-hidden />
            <p className={styles.emptyTitle}>Rien à noter pour l&apos;instant</p>
            <p>Tu pourras noter chaque appareil une fois ta commande remise.</p>
            <Button href="/categories/smartphones">Découvrir le catalogue</Button>
          </div>
        </div>
      ) : (
        <div className={styles.side}>
          {products.map((p) => {
            const existing = reviewOf.get(p.product_id);
            return (
              <section key={p.product_id} id={`p-${p.product_id}`} className={`${styles.card} ${styles.reviewTarget}`}>
                <h2>
                  {p.product_name}
                  {p.variant_label ? ` ${p.variant_label}` : ""}
                </h2>
                {existing && !existing.is_published && (
                  <p className={styles.muted}>La boutique a masqué ton avis : il n&apos;apparaît plus sur le site.</p>
                )}
                <ReviewForm product={{ id: p.product_id, name: p.product_name }} existing={existing} />
              </section>
            );
          })}
        </div>
      )}

      <p className={styles.muted} style={{ marginTop: 16 }}>
        <Link href="/compte">Retour à mon compte</Link>
      </p>
    </div>
  );
}
