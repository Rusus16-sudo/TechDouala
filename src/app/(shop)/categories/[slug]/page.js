import { notFound } from "next/navigation";
import ProductListing from "@/components/listing/ProductListing";
import { getCategories, getProducts } from "@/lib/data/catalog";

async function findCategory(slug) {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function generateMetadata({ params }) {
  const category = await findCategory((await params).slug);
  if (!category) return {};
  return {
    title: `${category.name} - TechDouala`,
    description: `${category.name} neufs et d'occasion à Douala : garantis en boutique, payables à crédit 40/60.`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) notFound();
  const products = await getProducts();

  return (
    <ProductListing
      title={category.name}
      description="Neufs ou d'occasion, garantis en boutique. Paiement Mobile Money, cash ou à crédit 40/60."
      crumbs={[{ label: "Catégories", href: "/categories" }, { label: category.name }]}
      products={products.filter((p) => p.category === slug)}
      searchParams={await searchParams}
      basePath={`/categories/${slug}`}
    />
  );
}
