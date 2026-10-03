"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff } from "@/lib/auth";

const startOf = (d) => (d ? `${d}T00:00:00+01:00` : null);
const endOf = (d) => (d ? `${d}T23:59:59+01:00` : null);

// Lien du bouton : page interne (/…) ou adresse https uniquement.
const safeHref = (h) => {
  const v = String(h ?? "").trim();
  return v.startsWith("/") || v.startsWith("https://") ? v : null;
};

export async function createNews(input) {
  try {
    await assertStaff({ owner: true });
  } catch {
    return { ok: false, message: "Réservé au propriétaire." };
  }
  const title = String(input.title ?? "").trim();
  if (title.length < 3) return { ok: false, message: "Titre : donne un titre d'au moins 3 caractères." };
  if (!["bandeau", "accueil"].includes(input.placement)) return { ok: false, message: "Emplacement : choisis le bandeau ou la carte d'accueil." };
  const ctaHref = safeHref(input.cta_href);
  if (input.cta_href && !ctaHref) return { ok: false, message: "Lien du bouton : choisis une page du site, ou une adresse commençant par https://." };
  const starts = startOf(input.starts_at);
  const ends = endOf(input.ends_at);
  if (starts && ends && ends < starts) return { ok: false, message: "Période : la date de fin tombe avant la date de début." };

  const supabase = await createClient();
  const { error } = await supabase.from("news").insert({
    title,
    body: String(input.body ?? "").trim(),
    image_url: typeof input.image_url === "string" && input.image_url.startsWith("https://") ? input.image_url : null,
    cta_label: String(input.cta_label ?? "").trim() || null,
    cta_href: ctaHref,
    placement: input.placement,
    starts_at: starts,
    ends_at: ends,
    is_published: !!input.is_published,
  });
  if (error) return { ok: false, message: `Publication impossible : ${error.message}` };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setNewsPublished(id, value) {
  await assertStaff({ owner: true });
  const supabase = await createClient();
  const { error } = await supabase.from("news").update({ is_published: !!value }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteNews(id) {
  await assertStaff({ owner: true });
  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
