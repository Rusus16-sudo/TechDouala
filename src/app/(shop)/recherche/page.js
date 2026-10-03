import ProductListing from "@/components/listing/ProductListing";
import { getProducts } from "@/lib/data/catalog";

export const metadata = { title: "Recherche - TechDouala" };

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";

  return (
    <ProductListing
      title={q ? `« ${q} »` : "Tous les produits"}
      crumbs={[{ label: "Recherche" }]}
      products={await getProducts()}
      searchParams={sp}
      basePath="/recherche"
    />
  );
}
