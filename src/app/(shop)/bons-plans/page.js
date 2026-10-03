import ProductListing from "@/components/listing/ProductListing";
import { getProducts } from "@/lib/data/catalog";
import { defaultVariant, discountPct } from "@/lib/catalog";

export const metadata = {
  title: "Bons plans - TechDouala",
  description: "Téléphones en promotion et modèles à petit prix à Douala, garantis en boutique.",
};

const MAX_PRICE = 150000;

export default async function DealsPage({ searchParams }) {
  const products = await getProducts();
  // Un bon plan : soit une remise en cours, soit un téléphone sous 150 000 FCFA.
  const deals = products
    .filter((p) => discountPct(defaultVariant(p)) > 0 || defaultVariant(p).price <= MAX_PRICE)
    .sort((a, b) => discountPct(defaultVariant(b)) - discountPct(defaultVariant(a)));

  return (
    <ProductListing
      title="Bons plans"
      description="Les remises du moment et les modèles sous 150 000 FCFA. Tous garantis en boutique."
      crumbs={[{ label: "Bons plans" }]}
      products={deals}
      searchParams={await searchParams}
      basePath="/bons-plans"
    />
  );
}
