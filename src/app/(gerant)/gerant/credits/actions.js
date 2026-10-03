"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff } from "@/lib/auth";

/** Valide l'encaissement d'une mensualité : la jauge du client avance (cahier 5.5). */
export async function payInstallment(id, method) {
  await assertStaff();
  const supabase = await createClient();
  const { error } = await supabase.rpc("pay_installment", { p_installment: id, p_method: method });
  if (error) throw new Error(error.message);
  revalidatePath("/gerant/credits");
  revalidatePath("/credit");
}

/** Valide l'encaissement de l'acompte de 40 %. */
export async function payDownPayment(creditId, method) {
  await assertStaff();
  const supabase = await createClient();
  const { error } = await supabase.rpc("pay_down_payment", { p_credit: creditId, p_method: method });
  if (error) throw new Error(error.message);
  revalidatePath("/gerant/credits");
  revalidatePath("/credit");
}
