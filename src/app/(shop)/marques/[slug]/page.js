import { notFound } from "next/navigation";
import ProductListing from "@/components/listing/ProductListing";
import { getBrands, getProducts } from "@/lib/data/catalog";

async function findBrand(slug) {
  return (await getBrands()).find((b) => b.slug === slug);
}

export async function generateMetadata({ params }) {
  const brand = await findBrand((await params).slug);
  return brand ? { title: `${brand.name} - TechDouala` } : {};
}

export default async function BrandPage({ params, searchParams }) {
  const { slug } = await params;
  const brand = await findBrand(slug);
  if (!brand) notFound();
  const products = await getProducts();

  return (
    <ProductListing
      title={brand.name}
      description={`Tous les produits ${brand.name} authentiques, vérifiés et garantis en boutique.`}
      crumbs={[{ label: "Marques" }, { label: brand.name }]}
      products={products.filter((p) => p.brand === slug)}
      searchParams={await searchParams}
      basePath={`/marques/${slug}`}
      hide={["marque"]}
    />
  );
}
