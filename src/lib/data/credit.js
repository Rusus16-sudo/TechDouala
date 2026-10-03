import "server-only";
import { createClient } from "@/lib/supabase/server";

const SELECT = `
  id, order_id, total_amount, down_payment, monthly_amount, months, status, down_paid_at, created_at,
  installments(id, number, amount, due_date, paid_at, payment_method),
  order:orders(number, created_at, customer_name, customer_phone,
               items:order_items(product_name, variant_label, color, qty))
`;

const sortInstallments = (c) => ({ ...c, installments: [...c.installments].sort((a, b) => a.number - b.number) });

/** Crédits du client connecté, avec son statut de payeur et son droit à un nouveau crédit. */
export async function getMyCredits(userId) {
  const supabase = await createClient();
  const [{ data: credits }, { data: state }, { data: eligibility }] = await Promise.all([
    supabase.from("credits").select(SELECT).eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.rpc("credit_state", { p_user: userId }),
    supabase.rpc("credit_eligibility", { p_user: userId }),
  ]);
  return { credits: (credits ?? []).map(sortInstallments), state, eligibility };
}

/** Tous les crédits, pour le suivi et les relances côté gérant. */
export async function listCredits() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credits")
    .select(`${SELECT}, client:profiles!credits_user_id_fkey(full_name, phone)`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(sortInstallments);
}

export async function getCredit(id) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("credits")
    .select(`${SELECT}, client:profiles!credits_user_id_fkey(id, full_name, phone)`)
    .eq("id", id)
    .maybeSingle();
  return data ? sortInstallments(data) : null;
}
