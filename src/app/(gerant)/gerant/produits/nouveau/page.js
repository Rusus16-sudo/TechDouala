import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireStaff } from "@/lib/auth";
import { getReferenceData } from "@/lib/data/admin";
import a from "@/components/admin/admin.module.css";

export const metadata = { title: "Nouveau produit - TechDouala" };

export default async function NewProductPage() {
  const { profile } = await requireStaff();
  const { categories, brands } = await getReferenceData();
  return (
    <>
      <header className={a.head}>
        <div>
          <p className={a.subtitle}>
            <Link href="/gerant/produits">← Catalogue & stock</Link>
          </p>
          <h1 className={a.title}>Nouveau produit</h1>
        </div>
      </header>
      <ProductForm categories={categories} brands={brands} isOwner={profile.role === "proprietaire"} />
    </>
  );
}
