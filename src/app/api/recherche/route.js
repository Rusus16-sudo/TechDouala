import { NextResponse } from "next/server";
import { getActiveBrands, getCategories, getProducts } from "@/lib/data/catalog";
import { defaultVariant, hasPriceRange, totalStock } from "@/lib/catalog";
import { labelMatches, searchScore } from "@/lib/listing";

const MAX_PRODUCTS = 6;

/** Suggestions de la barre de recherche : produits, rayons et marques qui correspondent à la saisie. */
export async function GET(request) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return NextResponse.json({ products: [], categories: [], brands: [] });

  const [products, categories, brands] = await Promise.all([getProducts(), getCategories(), getActiveBrands()]);

  const ranked = products
    .map((p) => ({ p, score: searchScore(p, q) }))
    .filter((r) => r.score > 0)
    // À pertinence égale : en stock d'abord, puis les smartphones (cœur du catalogue) avant les accessoires.
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(totalStock(b.p) > 0) - Number(totalStock(a.p) > 0) ||
        Number(b.p.category === "smartphones") - Number(a.p.category === "smartphones"),
    )
    .slice(0, MAX_PRODUCTS)
    .map(({ p }) => {
      const v = defaultVariant(p);
      return {
        id: p.id,
        name: p.name,
        brandName: p.brandName,
        condition: p.condition,
        imageUrl: p.imageUrl,
        price: v.price,
        fromPrice: hasPriceRange(p),
        inStock: totalStock(p) > 0,
      };
    });

  return NextResponse.json(
    {
      products: ranked,
      categories: categories.filter((c) => labelMatches(c.name, q)).slice(0, 3),
      brands: brands.filter((b) => labelMatches(b.name, q)).slice(0, 3),
    },
    { headers: { "Cache-Control": "private, max-age=30" } },
  );
}
