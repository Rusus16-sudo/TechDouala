"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertStaff } from "@/lib/auth";
import { CASH_METHODS, nextStatuses } from "@/lib/orders";

async function loadOrder(supabase, id) {
  const { data, error } = await supabase.from("orders").select("id, status, payment_status").eq("id", id).single();
  if (error) throw new Error("Commande introuvable.");
  return data;
}

/** Fait avancer une commande d'une étape (en attente → confirmée → remise au client). */
export async function advanceOrder(id, status) {
  await assertStaff();
  const supabase = await createClient();
  const order = await loadOrder(supabase, id);
  if (!nextStatuses(order).includes(status)) throw new Error("Étape non autorisée.");
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/gerant", "layout");
}

/** Valide l'encaissement et note le moyen de paiement reçu (cahier 5.4). */
export async function markPaid(id, method) {
  await assertStaff();
  if (!CASH_METHODS.some((m) => m.id === method)) throw new Error("Moyen de paiement invalide.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "paye", payment_method: method, paid_at: new Date().toISOString() })
    .eq("id", id)
    .neq("status", "annulee")
    .or("payment_method.is.null,payment_method.neq.credit");
  if (error) throw new Error(error.message);
  revalidatePath("/gerant", "layout");
}

/** Ouvre le dossier de crédit 40/60 d'une commande (fonction order_to_credit). */
export async function convertToCredit(id) {
  await assertStaff();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("order_to_credit", { p_order: id });
  if (error) throw new Error(error.message);
  revalidatePath("/gerant", "layout");
  revalidatePath("/credit");
  redirect(`/gerant/credits/${data}`);
}

/** Annule la commande et remet les articles en stock (fonction cancel_order). */
export async function cancelOrder(id) {
  await assertStaff();
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_order", { p_order_id: id });
  if (error) throw new Error(error.message);
  revalidatePath("/gerant", "layout");
  revalidatePath("/", "layout");
}
