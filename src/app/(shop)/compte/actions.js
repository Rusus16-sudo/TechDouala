"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { cmPhoneDigits } from "@/lib/checkout";

/** Met à jour le nom et le téléphone du client connecté (le rôle reste protégé en base). */
export async function updateProfile(_prev, formData) {
  const session = await getSession();
  if (!session) return { error: "Ta session a expiré. Reconnecte-toi." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();
  const phone = rawPhone ? cmPhoneDigits(rawPhone) : null;
  if (fullName.length < 3) return { error: "Indique ton nom et prénom." };
  if (rawPhone && !phone) return { error: "Numéro de téléphone invalide (ex. : 6 91 23 45 67)." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", session.user.id);
  if (error) return { error: "Enregistrement impossible. Réessaie." };
  revalidatePath("/compte");
  return { ok: "Informations enregistrées." };
}
