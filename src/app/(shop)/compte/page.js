import Link from "next/link";
import { ChevronRight, CreditCard, LogOut, Package, Phone, Star } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import ProfileForm from "@/components/account/ProfileForm";
import Badges from "@/components/account/Badges";
import LiveRefresh from "@/components/account/LiveRefresh";
import RatePrompt, { productsToRate } from "@/components/account/RatePrompt";
import { requireClient } from "@/lib/auth";
import { getMyCredits } from "@/lib/data/credit";
import { createClient } from "@/lib/supabase/server";
import { formatFCFA } from "@/lib/format";
import { ORDER_STATUSES, clientStatusLabel, formatDateTime } from "@/lib/orders";
import { CREDIT_STATUS_BADGE, creditProgress } from "@/lib/credit";
import styles from "@/components/account/account.module.css";

export const metadata = { title: "Mon compte - TechDouala", robots: { index: false } };

export default async function AccountPage() {
  const { user, profile } = await requireClient("/compte");
  const supabase = await createClient();
  const [{ data: badges }, { credits, state, eligibility }, { data: received }, { data: reviewed }] = await Promise.all([
    supabase.rpc("my_badges"),
    getMyCredits(user.id),
    // Produits des commandes remises : seuls ceux-là peuvent être notés.
    supabase
      .from("order_items")
      .select("product_id, product_name, product:products(images:product_images(url, position)), order:orders!inner(status, user_id)")
      .eq("order.user_id", user.id)
      .eq("order.status", "livree")
      .not("product_id", "is", null),
    supabase.from("reviews").select("product_id").eq("user_id", user.id),
  ]);
  const { data: orders } = await supabase
    .from("orders")
    .select("id, number, created_at, status, total, order_items(product_name, qty)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const firstName = (profile.full_name ?? "").split(" ")[0] || "toi";
  const toRate = productsToRate(received, reviewed);
  const hasReviews = (reviewed ?? []).length > 0;

  // Crédit : le plus urgent des crédits en cours (prochaine échéance la plus proche).
  const active = credits.filter((c) => c.status === "en_cours").map((c) => ({ c, p: creditProgress(c) }));
  const nextDue = active
    .filter(({ p }) => p.next)
    .sort((a, b) => a.p.next.due_date.localeCompare(b.p.next.due_date))[0]?.p.next;

  return (
    <div className="container">
      {(orders ?? []).some((o) => !["livree", "annulee"].includes(o.status)) && <LiveRefresh />}
      <Breadcrumb items={[{ label: "Mon compte" }]} />

      <header className={styles.head}>
        <div>
          <h1>Bonjour {firstName} !</h1>
          <p className={styles.muted}>
            Statut crédit :{" "}
            <Badge variant={CREDIT_STATUS_BADGE[state?.statut] ?? "violet-soft"}>{state?.statut ?? "Nouveau client"}</Badge>
          </p>
        </div>
        <div className={styles.headActions}>
          <form action="/auth/deconnexion" method="post">
            <Button type="submit" variant="ghost" icon={LogOut}>
              Se déconnecter
            </Button>
          </form>
        </div>
      </header>

      {!profile.phone && (
        <p className={styles.notice}>
          <Phone size={18} aria-hidden />
          <span>
            <strong>Ajoute ton numéro de téléphone</strong> dans « Mes informations » : la boutique s&apos;en sert pour te
            répondre sur WhatsApp et suivre tes commandes.
          </span>
        </p>
      )}

      <div className={styles.grid}>
        <section className={styles.card} aria-labelledby="orders-title">
          <h2 id="orders-title">Mes commandes</h2>
          {!orders?.length ? (
            <div className={styles.empty}>
              <Package size={40} strokeWidth={1.5} aria-hidden />
              <p className={styles.emptyTitle}>Aucune commande pour le moment</p>
              <p>Tes achats effectués avec ce compte apparaîtront ici.</p>
              <Button href="/categories/smartphones">Découvrir le catalogue</Button>
            </div>
          ) : (
            <ul className={styles.orders}>
              {orders.map((o) => {
                const items = o.order_items.map((i) => i.product_name);
                return (
                  <li key={o.id}>
                    <Link href={`/compte/commandes/${o.id}`} className={styles.order}>
                      <div>
                        <p className={styles.orderTitle}>
                          {items.slice(0, 2).join(", ")}
                          {items.length > 2 && ` +${items.length - 2}`}
                        </p>
                        <p className={styles.muted}>
                          {o.number} · {formatDateTime(o.created_at)}
                        </p>
                      </div>
                      <Badge variant={ORDER_STATUSES[o.status].badge}>{clientStatusLabel(o.status)}</Badge>
                      <strong className={styles.orderTotal}>{formatFCFA(o.total)}</strong>
                      <ChevronRight size={18} aria-hidden className={styles.chev} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className={styles.side}>
          <RatePrompt products={toRate} />

          <section className={styles.card} aria-labelledby="badges-title">
            <h2 id="badges-title">Mes badges</h2>
            <Badges earned={badges ?? []} />
            {hasReviews && (
              <Button href="/compte/avis" variant="secondary" size="sm" icon={Star} className={styles.reviewsLink}>
                Mes avis
              </Button>
            )}
          </section>

          <section className={styles.card} aria-labelledby="profile-title">
            <h2 id="profile-title">Mes informations</h2>
            <ProfileForm profile={profile} email={user.email} />
          </section>

          <section className={`${styles.card} ${styles.credit}`} aria-labelledby="credit-title">
            <CreditCard size={24} aria-hidden />
            <h2 id="credit-title">Crédit 40/60</h2>
            {active.length > 0 ? (
              <p>
                {active.length} crédit{active.length > 1 ? "s" : ""} en cours.
                {nextDue && (
                  <>
                    {" "}
                    Prochaine échéance : <strong>{formatFCFA(nextDue.amount)}</strong> le{" "}
                    {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(nextDue.due_date))}.
                  </>
                )}
              </p>
            ) : eligibility?.ok ? (
              <p>Tu peux acheter à crédit : 40 % à la remise, le reste en 6 mois, sans pénalité.</p>
            ) : (
              <p>{eligibility?.message ?? "Paie 40 % à la remise et le reste en 6 mois, sans pénalité."}</p>
            )}
            <Button href="/credit" variant="light" size="sm">
              {active.length > 0 ? "Voir mon échéancier" : "Comment ça marche"}
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
