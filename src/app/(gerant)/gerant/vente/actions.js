"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff } from "@/lib/auth";

/** Enregistre une vente au comptoir via pos_sale (stock déduit, plancher contrôlé en base). */
export async function posSale(input) {
  try {
    await assertStaff();
  } catch {
    return { ok: false, message: "Accès refusé." };
  }
  const lines = Array.isArray(input?.lines) ? input.lines.slice(0, 30) : [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("pos_sale", {
    p: {
      customer_name: input.customerName ?? "",
      customer_phone: input.customerPhone ?? "",
      payment: input.payment,
      notes: input.notes ?? "",
      items: lines.map((l) => ({
        variant_id: l.variantId,
        qty: Number(l.qty),
        color: l.color || null,
        unit_price: l.unitPrice === "" || l.unitPrice == null ? null : Number(l.unitPrice),
      })),
    },
  });
  if (error) {
    return { ok: false, message: error.code === "P0001" ? error.message : `Vente non enregistrée : ${error.message}` };
  }
  revalidatePath("/gerant", "layout");
  revalidatePath("/", "layout");
  return { ok: true, sale: data };
}
