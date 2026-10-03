import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import OrderAlertsProvider, { EnableAlerts } from "@/components/admin/OrderAlerts";
import { ROLE_LABELS, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import styles from "./gerant.module.css";

export const metadata = { title: "Espace gérant - TechDouala", robots: { index: false } };

export default async function GerantLayout({ children }) {
  const { profile, user } = await requireStaff();
  const name = profile.full_name || user.email;

  // Commandes en ligne qui attendent une confirmation : compteur dans le menu, sur toutes les pages
  // (tenu à jour sans recharger par OrderAlertsProvider).
  const supabase = await createClient();
  const { count: waiting } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "en_attente");

  return (
    <OrderAlertsProvider initialWaiting={waiting ?? 0}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Link href="/gerant" className={styles.logo}>
            Tech<span>Douala</span>
          </Link>
          <AdminNav role={profile.role} />
          <div className={styles.me}>
            <span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span>
            <div className={styles.meText}>
              <strong>{name}</strong>
              <span>{ROLE_LABELS[profile.role]}</span>
            </div>
          </div>
          <div className={styles.sideActions}>
            <EnableAlerts className={styles.sideLink} labelClassName={styles.sideLabel} />
            <Link href="/" target="_blank" className={styles.sideLink} title="Voir la boutique">
              <ExternalLink size={16} aria-hidden /> <span className={styles.sideLabel}>Voir la boutique</span>
            </Link>
            <form action="/auth/deconnexion" method="post">
              <button type="submit" className={styles.sideLink} title="Se déconnecter">
                <LogOut size={16} aria-hidden /> <span className={styles.sideLabel}>Se déconnecter</span>
              </button>
            </form>
          </div>
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
    </OrderAlertsProvider>
  );
}
