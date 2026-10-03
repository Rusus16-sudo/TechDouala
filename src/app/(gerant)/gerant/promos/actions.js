"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff } from "@/lib/auth";

// Dates saisies en jour local (Douala, UTC+1) : début à 00:00, fin à 23:59:59.
const startOf = (d) => (d ? `${d}T00:00:00+01:00` : null);
const endOf = (d) => (d ? `${d}T23:59:59+01:00` : null);
const intOrNull = (v) => (v === null || v === "" ? null : Number(v));

export async function createPromo(_prev, fd) {
  try {
    await assertStaff({ owner: true });
  } catch {
    return { error: "Réservé au propriétaire." };
  }
  const code = String(fd.get("code") ?? "").trim().toUpperCase();
  const kind = fd.get("kind");
  const value = intOrNull(fd.get("value"));
  const row = {
    code,
    description: String(fd.get("description") ?? "").trim() || null,
    kind,
    value,
    min_order: intOrNull(fd.get("min_order")) ?? 0,
    category_slug: fd.get("category_slug") || null,
    starts_at: startOf(fd.get("starts_at")),
    ends_at: endOf(fd.get("ends_at")),
    max_uses: intOrNull(fd.get("max_uses")),
    max_uses_per_phone: intOrNull(fd.get("max_uses_per_phone")),
    is_active: fd.get("is_active") === "on",
  };

  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return { error: "Code : 3 à 30 caractères (lettres, chiffres, - ou _).", values: row };
  if (!["pourcentage", "montant"].includes(kind)) return { error: "Choisis le type de remise.", values: row };
  if (!Number.isInteger(value) || value <= 0) return { error: "La valeur de la remise doit être un nombre positif.", values: row };
  if (kind === "pourcentage" && value > 90) return { error: "Une remise en pourcentage ne peut pas dépasser 90 %.", values: row };
  if (row.starts_at && row.ends_at && row.ends_at < row.starts_at) return { error: "La date de fin est avant la date de début.", values: row };

  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").insert(row);
  if (error) {
    return { error: error.code === "23505" ? "Ce code existe déjà." : `Création impossible : ${error.message}`, values: row };
  }
  revalidatePath("/gerant/promos");
  return { ok: `Code ${code} créé.` };
}

export async function setPromoActive(id, active) {
  await assertStaff({ owner: true });
  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").update({ is_active: !!active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/gerant/promos");
}

export async function deletePromo(id) {
  await assertStaff({ owner: true });
  const supabase = await createClient();
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/gerant/promos");
}
