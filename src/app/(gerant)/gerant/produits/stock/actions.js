"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff } from "@/lib/auth";

/**
 * Met à jour le stock de plusieurs variantes d'un coup (saisie rapide).
 * `publish` : publie les produits qui ont au moins une variante en stock, masque ceux à 0.
 */
export async function saveStocks({ changes, publish }) {
  try {
    await assertStaff();
  } catch {
    return { ok: false, message: "Accès refusé." };
  }
  const rows = (Array.isArray(changes) ? changes : [])
    .map((c) => ({ id: String(c.id), stock: Number(c.stock) }))
    .filter((c) => /^[0-9a-f-]{36}$/i.test(c.id) && Number.isInteger(c.stock) && c.stock >= 0 && c.stock <= 9999);

  const supabase = await createClient();
  for (const r of rows) {
    const { error } = await supabase.from("product_variants").update({ stock: r.stock }).eq("id", r.id);
    if (error) return { ok: false, message: `Stock non enregistré : ${error.message}` };
  }

  let published = 0;
  let hidden = 0;
  if (publish) {
    const { data: variants } = await supabase.from("product_variants").select("product_id, stock");
    const totals = new Map();
    (variants ?? []).forEach((v) => totals.set(v.product_id, (totals.get(v.product_id) ?? 0) + v.stock));
    const inStock = [...totals].filter(([, n]) => n > 0).map(([id]) => id);
    const empty = [...totals].filter(([, n]) => n === 0).map(([id]) => id);
    if (inStock.length) {
      const { data } = await supabase.from("products").update({ is_published: true }).in("id", inStock).eq("is_published", false).select("id");
      published = data?.length ?? 0;
    }
    if (empty.length) {
      const { data } = await supabase.from("products").update({ is_published: false }).in("id", empty).eq("is_published", true).select("id");
      hidden = data?.length ?? 0;
    }
  }

  revalidatePath("/", "layout");
  return { ok: true, updated: rows.length, published, hidden };
}
