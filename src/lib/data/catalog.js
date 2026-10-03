import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

const PRODUCT_SELECT = `
  id, slug, name, brand_slug, category_slug, condition, description, highlights, specs, colors,
  ram_gb, is_5g, warranty_months, is_featured, is_flash, is_published, force_out_of_stock,
  rating, review_count, created_at,
  brand:brands(name),
  variants:product_variants(id, sku, label, price, old_price, stock, position),
  images:product_images(url, position)
`;

/** Ligne Supabase → forme « produit » utilisée par les composants du site. */
export function toProduct(row) {
  const variants = [...(row.variants ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      storage: v.label,
      price: v.price,
      oldPrice: v.old_price,
      // « Marquer en rupture » : le produit reste visible mais ne se vend plus.
      stock: row.force_out_of_stock ? 0 : v.stock,
      realStock: v.stock,
    }));

  return {
    uuid: row.id,
    id: row.slug,
    name: row.name,
    brand: row.brand_slug,
    brandName: row.brand?.name ?? row.brand_slug,
    category: row.category_slug,
    condition: row.condition,
    description: row.description,
    highlights: row.highlights ?? [],
    specs: Object.fromEntries((row.specs ?? []).map((s) => [s.label, s.value])),
    colors: row.colors ?? [],
    ram: row.ram_gb,
    is5G: row.is_5g,
    warrantyMonths: row.warranty_months,
    featured: row.is_featured,
    flash: row.is_flash,
    published: row.is_published,
    forceOutOfStock: row.force_out_of_stock,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    addedAt: row.created_at,
    images: [...(row.images ?? [])].sort((a, b) => a.position - b.position).map((i) => i.url),
    imageUrl: [...(row.images ?? [])].sort((a, b) => a.position - b.position)[0]?.url ?? null,
    variants,
    reviews: [],
  };
}

export const getCategories = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("slug, name").order("position");
  if (error) throw error;
  return data;
});

export const getBrands = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("brands").select("slug, name").order("position");
  if (error) throw error;
  return data;
});

/** Marques qui ont au moins un produit publié : le menu ne mène jamais à une page vide. */
export const getActiveBrands = cache(async () => {
  const supabase = await createClient();
  const [brands, { data, error }] = await Promise.all([
    getBrands(),
    supabase.from("products").select("brand_slug").eq("is_published", true),
  ]);
  if (error) throw error;
  const used = new Set(data.map((p) => p.brand_slug));
  return brands.filter((b) => used.has(b.slug));
});

/** Produits publiés (les règles RLS masquent le reste aux clients). Seuls ceux qui ont au moins une variante sont vendables. */
export const getProducts = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toProduct).filter((p) => p.variants.length > 0);
});

export const getProductBySlug = cache(async (slug) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  const product = data && toProduct(data);
  if (!product?.variants.length) return null;

  // Avis publiés du produit (cahier 5.9)
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, author:profiles!reviews_user_id_fkey(full_name)")
    .eq("product_id", product.uuid)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  product.reviews = (reviews ?? []).map((r) => ({
    author: r.author?.full_name ?? "Client TechDouala",
    rating: r.rating,
    text: r.comment,
    date: r.created_at,
  })).filter((r) => r.text);

  return product;
});

/** Actualités visibles (publiées et dans leur période : filtré par RLS). */
/** Derniers avis publiés et commentés, pour l'accueil (4 étoiles et plus). */
export const getHomeReviews = cache(async (limit = 6) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, author:profiles!reviews_user_id_fkey(full_name), product:products(name)")
    .eq("is_published", true)
    .gte("rating", 4)
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data
    .filter((r) => r.comment?.trim())
    .map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.comment.trim(),
      author: r.author?.full_name ?? "Client TechDouala",
      product: r.product?.name ?? null,
    }));
});

export const getNews = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("id, title, body, image_url, cta_label, cta_href, placement, starts_at, ends_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  // Le personnel voit aussi les actualités programmées : on refiltre la période ici.
  const now = new Date().toISOString();
  return data.filter((n) => (!n.starts_at || n.starts_at <= now) && (!n.ends_at || n.ends_at > now));
});
