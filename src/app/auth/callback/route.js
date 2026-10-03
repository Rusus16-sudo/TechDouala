import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { originFromHeaders } from "@/lib/origin";
import { landingFor } from "@/lib/auth";

// Retour depuis l'e-mail de confirmation (ou la connexion Google) : ouvre la session puis redirige.
const safePath = (p) => (p && p.startsWith("/") && !p.startsWith("//") ? p : null);

export async function GET(request) {
  const url = new URL(request.url);
  const origin = originFromHeaders(request.headers, request.url);
  const next = safePath(url.searchParams.get("suite"));
  const supabase = await createClient();

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Lien incomplet") };

  if (error) {
    // Échec d'un retour Google (code) ou d'un lien reçu par e-mail (token) : message adapté sur /connexion.
    console.error("Retour de connexion refusé :", error.message);
    return NextResponse.redirect(new URL(`/connexion?erreur=${code ? "google" : "lien"}`, origin));
  }

  // Le personnel arrive toujours sur son tableau de bord ; le client là où il allait (sinon son compte).
  const userId = data?.user?.id ?? data?.session?.user?.id;
  const { data: profile } = userId
    ? await supabase.from("profiles").select("role").eq("id", userId).single()
    : { data: null };

  return NextResponse.redirect(new URL(landingFor(profile?.role, next), origin));
}
