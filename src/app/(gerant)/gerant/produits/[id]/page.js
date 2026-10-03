import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { requireStaff } from "@/lib/auth";
import { getAdminProduct, getReferenceData } from "@/lib/data/admin";
import a from "@/components/admin/admin.module.css";

export const metadata = { title: "Modifier un produit - TechDouala" };

const UUID_RE = /^[0-9a-f-]{36}$/i;

export default async function EditProductPage({ params }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { profile } = await requireStaff();
  const isOwner = profile.role === "proprietaire";
  const [product, { categories, brands }] = await Promise.all([
    getAdminProduct(id, { withFloor: isOwner }),
    getReferenceData(),
  ]);
  if (!product) notFound();

  return (
    <>
      <header className={a.head}>
        <div>
          <p className={a.subtitle}>
            <Link href="/gerant/produits">← Catalogue & stock</Link>
          </p>
          <h1 className={a.title}>{product.name}</h1>
        </div>
        {product.is_published && (
          <Link href={`/produit/${product.slug}`} target="_blank" className={a.linkBtn}>
            Voir dans la boutique ↗
          </Link>
        )}
      </header>
      <ProductForm product={product} categories={categories} brands={brands} isOwner={isOwner} />
    </>
  );
}
