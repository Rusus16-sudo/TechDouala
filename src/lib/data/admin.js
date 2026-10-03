import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Tous les produits (publiés ou non) pour l'espace gérant. RLS : réservé au personnel. */
export async function listAdminProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, slug, name, brand_slug, category_slug, condition, is_published, is_featured, is_flash, force_out_of_stock, updated_at,
       brand:brands(name), category:categories(name),
       variants:product_variants(id, label, price, stock),
       images:product_images(url, position)`,
    )
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    ...p,
    image: [...p.images].sort((a, b) => a.position - b.position)[0]?.url ?? null,
    stock: p.variants.reduce((n, v) => n + v.stock, 0),
    minPrice: p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : null,
    maxPrice: p.variants.length ? Math.max(...p.variants.map((v) => v.price)) : null,
  }));
}

/** Produit complet pour le formulaire d'édition. Les prix planchers ne sont lus que pour le propriétaire. */
export async function getAdminProduct(id, { withFloor = false } = {}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*, variants:product_variants(id, sku, label, price, old_price, stock, position),
       images:product_images(url, position)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  let floors = new Map();
  if (withFloor && data.variants.length) {
    const { data: rows } = await supabase
      .from("product_floor_prices")
      .select("variant_id, floor_price")
      .in(
        "variant_id",
        data.variants.map((v) => v.id),
      );
    floors = new Map((rows ?? []).map((r) => [r.variant_id, r.floor_price]));
  }

  return {
    ...data,
    variants: [...data.variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({ ...v, floor_price: floors.get(v.id) ?? null })),
    images: [...data.images].sort((a, b) => a.position - b.position).map((i) => i.url),
  };
}

export async function getReferenceData() {
  const supabase = await createClient();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("slug, name").order("position"),
    supabase.from("brands").select("slug, name").order("position"),
  ]);
  return { categories: categories ?? [], brands: brands ?? [] };
}

/** Produits vendables au comptoir (même masqués : un article peut être en boutique sans être en ligne). */
export async function listPosProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, colors, brand:brands(name), variants:product_variants(id, label, price, stock, position)")
    .order("name");
  if (error) throw error;
  return data
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand?.name ?? "",
      colors: (p.colors ?? []).map((c) => c.name),
      variants: [...p.variants].sort((a, b) => a.position - b.position),
    }))
    .filter((p) => p.variants.length > 0);
}
