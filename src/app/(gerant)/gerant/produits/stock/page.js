import Link from "next/link";
import StockTable from "@/components/admin/StockTable";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import a from "@/components/admin/admin.module.css";

export const metadata = { title: "Saisie rapide du stock - TechDouala" };

export default async function QuickStockPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, condition, is_published, brand:brands(name), variants:product_variants(id, label, price, stock, position)")
    .order("brand_slug")
    .order("name");
  if (error) throw error;

  const products = data
    .filter((p) => p.variants.length)
    .map((p) => ({ ...p, variants: [...p.variants].sort((x, y) => x.position - y.position) }));

  return (
    <>
      <header className={a.head}>
        <div>
          <p className={a.subtitle}>
            <Link href="/gerant/produits">← Catalogue & stock</Link>
          </p>
          <h1 className={a.title}>Saisie rapide du stock</h1>
          <p className={a.subtitle}>Compte les appareils en boutique et saisis les quantités, puis enregistre tout d&apos;un coup.</p>
        </div>
      </header>
      <StockTable products={products} />
    </>
  );
}
