import ProductListing from "@/components/listing/ProductListing";
import { getProducts } from "@/lib/data/catalog";

// Rayons regroupés sous « Accessoires » dans l'en-tête.
const ACCESSORY_CATEGORIES = ["ecouteurs-casques", "montres-connectees", "chargeurs-cables", "powerbanks", "protection"];

export const metadata = {
  title: "Accessoires - TechDouala",
  description: "Écouteurs, montres connectées, chargeurs, powerbanks, coques et verres trempés d'origine, en boutique à Douala.",
};

export default async function AccessoriesPage({ searchParams }) {
  return (
    <ProductListing
      title="Accessoires"
      description="Écouteurs, montres, chargeurs, powerbanks, coques : de quoi équiper ton téléphone, en boutique à Douala."
      crumbs={[{ label: "Accessoires" }]}
      products={(await getProducts()).filter((p) => ACCESSORY_CATEGORIES.includes(p.category))}
      searchParams={await searchParams}
      basePath="/accessoires"
      hide={["etat", "stockage", "ram", "reseau"]}
    />
  );
}
