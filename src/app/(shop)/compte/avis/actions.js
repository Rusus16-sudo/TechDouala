"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

/** Dépose ou met à jour l'avis du client sur un produit acheté (cahier 5.9). */
export async function submitReview(_prev, formData) {
  const session = await getSession();
  if (!session) return { error: "Ta session a expiré. Reconnecte-toi." };

  const rating = Number(formData.get("rating"));
  const productId = String(formData.get("product_id") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!rating) return { error: "Choisis une note de 1 à 5 étoiles." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_review", {
    p: { product_id: productId, rating, comment },
  });
  if (error) {
    return { error: error.code === "P0001" ? error.message : "Ton avis n'a pas pu être enregistré." };
  }

  revalidatePath("/compte/avis");
  revalidatePath("/", "layout");
  return { ok: "Merci ! Ton avis est en ligne." };
}
