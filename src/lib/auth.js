import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const ROLE_LABELS = {
  client: "Client",
  vendeur: "Vendeur",
  proprietaire: "Propriétaire",
  livreur: "Livreur",
};

export const isStaff = (role) => ["vendeur", "proprietaire"].includes(role);

/** Page d'arrivée après connexion : le personnel va toujours dans l'espace gérant, le client où il allait. */
export function landingFor(role, suite) {
  if (isStaff(role)) return suite?.startsWith("/gerant") ? suite : "/gerant";
  return suite ?? "/compte";
}

/**
 * Utilisateur connecté et son profil (null si déconnecté). getClaims() vérifie la signature du jeton
 * sur place avec la clé publique du projet (ES256) : pas d'aller-retour vers Supabase à chaque page.
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  const user = { id: claims.sub, email: claims.email ?? null };
  const { data: profile } = await supabase.from("profiles").select("id, role, full_name, phone").eq("id", user.id).single();
  return profile ? { user, profile } : null;
});

/** Réservé au personnel (vendeur ou propriétaire). */
export async function requireStaff() {
  const session = await getSession();
  if (!session) redirect("/connexion?suite=/gerant");
  if (!["vendeur", "proprietaire"].includes(session.profile.role)) redirect("/connexion?erreur=acces");
  return session;
}

/** Réservé au propriétaire (chiffre d'affaires, prix plancher, codes promo, actualités). */
export async function requireOwner() {
  const session = await requireStaff();
  if (session.profile.role !== "proprietaire") redirect("/gerant/commandes");
  return session;
}

/** Même contrôle pour les actions serveur : renvoie une erreur au lieu de rediriger. */
export async function assertStaff({ owner = false } = {}) {
  const session = await getSession();
  const role = session?.profile.role;
  if (!role || !["vendeur", "proprietaire"].includes(role) || (owner && role !== "proprietaire")) {
    throw new Error("Accès refusé.");
  }
  return session;
}

/** Réservé aux utilisateurs connectés (clients compris) ; sinon renvoi vers la connexion. */
export async function requireUser(suite = "/compte") {
  const session = await getSession();
  if (!session) redirect(`/connexion?suite=${encodeURIComponent(suite)}`);
  return session;
}

/** Espace client : le personnel n'en a pas, il est renvoyé vers l'espace gérant. */
export async function requireClient(suite = "/compte") {
  const session = await requireUser(suite);
  if (isStaff(session.profile.role)) redirect("/gerant");
  return session;
}
