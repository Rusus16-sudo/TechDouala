import ProductListing from "@/components/listing/ProductListing";
import { getProducts } from "@/lib/data/catalog";

export const metadata = {
  title: "Occasions & reconditionnés - TechDouala",
  description: "Téléphones d'occasion et reconditionnés contrôlés par nos techniciens et garantis en boutique.",
};

export default async function RefurbishedPage({ searchParams }) {
  return (
    <ProductListing
      title="Comme neufs, moins chers"
      description="Écran, batterie, boutons et caméras testés par nos techniciens. Garantie boutique."
      crumbs={[{ label: "Occasions" }]}
      products={(await getProducts()).filter((p) => p.condition !== "Neuf")}
      searchParams={await searchParams}
      basePath="/reconditionnes"
      hide={["etat"]}
    />
  );
}
