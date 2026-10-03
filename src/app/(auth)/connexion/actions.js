"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { landingFor } from "@/lib/auth";
import { cmPhoneDigits } from "@/lib/checkout";
import { originFromHeaders } from "@/lib/origin";

// N'autorise que des chemins internes après connexion (pas de redirection vers un autre site).
const safePath = (p) => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : null);

async function siteOrigin() {
  return originFromHeaders(await headers());
}

async function afterLogin(supabase, userId, suite) {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
  redirect(landingFor(profile?.role, safePath(suite)));
}

export async function signIn(_prev, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Renseigne ton e-mail et ton mot de passe." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: error.code === "email_not_confirmed" ? "Confirme d'abord ton adresse e-mail (lien reçu par e-mail)." : "E-mail ou mot de passe incorrect.",
      email,
    };
  }
  await afterLogin(supabase, data.user.id, formData.get("suite"));
}

export async function signUp(_prev, formData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = cmPhoneDigits(formData.get("phone"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { fullName, phone: formData.get("phone"), email };

  if (fullName.length < 3) return { error: "Indique ton nom et prénom.", values };
  if (!phone) return { error: "Numéro de téléphone invalide (ex. : 6 91 23 45 67).", values };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Adresse e-mail invalide.", values };
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères.", values };

  const supabase = await createClient();
  const suite = safePath(formData.get("suite")) ?? "/compte";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lu par le déclencheur handle_new_user pour remplir le profil.
      data: { full_name: fullName, phone },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?suite=${encodeURIComponent(suite)}`,
    },
  });
  if (error) {
    return {
      error: error.code === "user_already_exists" ? "Un compte existe déjà avec cet e-mail. Connecte-toi." : `Inscription impossible : ${error.message}`,
      values,
    };
  }
  // Si la confirmation par e-mail est désactivée, la session est ouverte tout de suite.
  if (data.session) redirect(suite);
  return { sent: email };
}

export async function signInWithGoogle(formData) {
  const supabase = await createClient();
  // Sans destination demandée, /auth/callback choisit selon le rôle (gérant : tableau de bord).
  const suite = safePath(formData.get("suite"));
  const query = suite ? `?suite=${encodeURIComponent(suite)}` : "";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteOrigin()}/auth/callback${query}` },
  });
  if (error || !data?.url) redirect("/connexion?erreur=google");
  redirect(data.url);
}
