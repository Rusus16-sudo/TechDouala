"use server";

import { createClient } from "@/lib/supabase/server";
import { cmPhoneDigits, normalizeCmPhone, validateCheckout } from "@/lib/checkout";
import { creditPlan } from "@/lib/credit";

const toItems = (items) =>
  (Array.isArray(items) ? items.slice(0, 30) : []).map((i) => ({
    variant_id: String(i?.variantId ?? ""),
    qty: Number(i?.qty),
    color: i?.color ?? null,
  }));

/** Vérifie un code promo pour le panier (bouton « Appliquer »). La règle complète tourne en base. */
export async function checkPromo({ code, items, phone }) {
  const clean = String(code ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,30}$/.test(clean)) return { ok: false, message: "Code promo invalide." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_promo", {
    p_code: clean,
    p_items: toItems(items),
    p_phone: cmPhoneDigits(phone),
  });
  if (error) return { ok: false, message: "Impossible de vérifier le code pour le moment." };
  return data;
}

/**
 * Enregistre une commande via la fonction place_order (transaction en base) : prix, stock et
 * remise y sont recalculés ; on ne fait jamais confiance au navigateur. Paiement et remise se
 * conviennent ensuite avec la boutique sur WhatsApp.
 */
export async function placeOrder({ form = {}, items, promoCode }) {
  const errors = validateCheckout(form);
  if (Object.keys(errors).length) return { ok: false, errors };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p: {
      full_name: form.fullName,
      phone: cmPhoneDigits(form.phone),
      email: form.email || null,
      note: form.note || null,
      credit_requested: !!form.credit,
      promo_code: promoCode || null,
      items: toItems(items),
    },
  });

  if (error) {
    // Les messages levés par place_order (P0001) sont rédigés pour le client ; les autres restent génériques.
    return { ok: false, message: error.code === "P0001" ? error.message : "La commande n'a pas pu être enregistrée. Réessaie." };
  }

  const order = {
    number: data.number,
    customer: { fullName: form.fullName.trim(), phone: normalizeCmPhone(form.phone), email: form.email || null },
    note: form.note?.trim() || null,
    lines: data.lines.map((l) => ({
      id: l.variant_id,
      name: l.product_name,
      storage: l.variant_label,
      color: l.color,
      qty: l.qty,
      total: l.total,
    })),
    credit: form.credit ? creditPlan(data.total) : null,
    subtotal: data.subtotal,
    discount: data.discount,
    promoCode: data.promo_code,
    total: data.total,
  };

  return { ok: true, order };
}
