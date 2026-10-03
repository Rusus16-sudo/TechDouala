"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff } from "@/lib/auth";

function refresh() {
  revalidatePath("/gerant/avis");
  revalidatePath("/", "layout");
}

/** Publie ou masque un avis client (modération, cahier 6.3). */
export async function setReviewPublished(reviewId, published) {
  await assertStaff();
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_review_published", { p_review: reviewId, p_published: published });
  if (error) throw new Error(error.code === "P0001" ? error.message : "Modification impossible.");
  refresh();
}

/** Supprime définitivement un avis (la note du produit est recalculée en base). */
export async function deleteReview(reviewId) {
  await assertStaff();
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_review", { p_review: reviewId });
  if (error) throw new Error(error.code === "P0001" ? error.message : "Suppression impossible.");
  refresh();
}
