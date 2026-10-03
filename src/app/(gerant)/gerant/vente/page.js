import PosForm from "@/components/admin/PosForm";
import { requireStaff } from "@/lib/auth";
import { listPosProducts } from "@/lib/data/admin";
import a from "@/components/admin/admin.module.css";
import styles from "@/components/admin/PosForm.module.css";

export const metadata = { title: "Nouvelle vente - TechDouala" };

export default async function PosPage() {
  await requireStaff();
  const products = await listPosProducts();
  return (
    <div className={styles.screen}>
      <header className={a.head}>
        <div>
          <h1 className={a.title}>Nouvelle vente</h1>
          <p className={a.subtitle}>Vente au comptoir : le stock est déduit automatiquement. Les factures restent papier.</p>
        </div>
      </header>
      <PosForm products={products} />
    </div>
  );
}
