import ProductListing from "@/components/listing/ProductListing";
import { getProducts } from "@/lib/data/catalog";

export const metadata = { title: "Ventes flash - TechDouala" };

export default async function FlashSalesPage({ searchParams }) {
  return (
    <ProductListing
      title="Ventes flash"
      description="Des prix réduits jusqu'à dimanche minuit, dans la limite des stocks."
      crumbs={[{ label: "Ventes flash" }]}
      products={(await getProducts()).filter((p) => p.flash)}
      searchParams={await searchParams}
      basePath="/ventes-flash"
    />
  );
}
