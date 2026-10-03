import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { originFromHeaders } from "@/lib/origin";

// Déconnexion par simple envoi de formulaire (POST) : efface la session puis renvoie vers la connexion.
// 303 : le navigateur recharge /connexion en GET.
export async function POST(request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/connexion", originFromHeaders(request.headers, request.url)), 303);
}
