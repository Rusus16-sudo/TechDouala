"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertStaff } from "@/lib/auth";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const int = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

/** Nettoie et valide les données du formulaire produit. Renvoie { data } ou { errors }. */
async function clean(input) {
  const errors = {};
  const name = String(input.name ?? "").trim();
  if (name.length < 2) errors.name = "Donne un nom au produit.";
  const slug = String(input.slug ?? "").trim() || (await slugify(name));
  if (!SLUG_RE.test(slug)) errors.slug = "Adresse invalide : lettres minuscules, chiffres et tirets.";
  if (!input.brand_slug) errors.brand_slug = "Choisis une marque.";
  if (!input.category_slug) errors.category_slug = "Choisis une catégorie.";
  if (!["Neuf", "Reconditionné"].includes(input.condition)) errors.condition = "État invalide.";

  const variants = (input.variants ?? []).map((v, i) => ({
    id: v.id || null,
    label: String(v.label ?? "").trim() || null,
    price: int(v.price),
    old_price: int(v.old_price),
    stock: int(v.stock) ?? 0,
    floor_price: int(v.floor_price),
    position: i,
  }));
  if (variants.length === 0) errors.variants = "Ajoute au moins une variante (prix et stock).";
  variants.forEach((v, i) => {
    if (!Number.isInteger(v.price) || v.price <= 0) errors[`variants.${i}.price`] = "Prix obligatoire.";
    if (v.old_price !== null && (!Number.isInteger(v.old_price) || v.old_price <= (v.price ?? 0)))
      errors[`variants.${i}.old_price`] = "Le prix barré doit être supérieur au prix.";
    if (!Number.isInteger(v.stock) || v.stock < 0) errors[`variants.${i}.stock`] = "Stock invalide.";
    if (v.floor_price !== null && (!Number.isInteger(v.floor_price) || v.floor_price <= 0 || v.floor_price > (v.price ?? 0)))
      errors[`variants.${i}.floor_price`] = "Le plancher doit être positif et inférieur ou égal au prix.";
  });
  if (variants.length > 1 && variants.some((v) => !v.label)) errors.variants = "Donne un nom à chaque variante (ex. 128 Go).";
  const labels = variants.map((v) => (v.label ?? "").toLowerCase());
  if (new Set(labels).size !== labels.length) errors.variants = "Deux variantes ont le même nom.";

  const colors = (input.colors ?? [])
    .map((c) => ({ name: String(c.name ?? "").trim(), hex: String(c.hex ?? "") }))
    .filter((c) => c.name);
  if (colors.some((c) => !HEX_RE.test(c.hex))) errors.colors = "Couleur invalide.";

  const specs = (input.specs ?? [])
    .map((s) => ({ label: String(s.label ?? "").trim(), value: String(s.value ?? "").trim() }))
    .filter((s) => s.label && s.value);

  const highlights = String(input.highlights ?? "")
    .split("\n")
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, 8);

  // Photos envoyées dans Supabase Storage (https://…) ou servies par le site lui-même (/produits/…).
  const images = (input.images ?? [])
    .filter((u) => typeof u === "string" && (u.startsWith("https://") || /^\/produits\/[\w.-]+$/.test(u)))
    .slice(0, 10);
  const ram = int(input.ram_gb);
  const warranty = int(input.warranty_months) ?? 12;

  if (Object.keys(errors).length) return { errors };
  return {
    data: {
      product: {
        name,
        slug,
        brand_slug: input.brand_slug,
        category_slug: input.category_slug,
        condition: input.condition,
        description: String(input.description ?? "").trim(),
        highlights,
        specs,
        colors,
        ram_gb: Number.isInteger(ram) && ram > 0 ? ram : null,
        is_5g: !!input.is_5g,
        warranty_months: Number.isInteger(warranty) && warranty >= 0 ? warranty : 12,
        is_featured: !!input.is_featured,
        is_flash: !!input.is_flash,
        is_published: !!input.is_published,
        force_out_of_stock: !!input.force_out_of_stock,
      },
      variants,
      images,
    },
  };
}

/** Crée ou met à jour un produit avec ses variantes, photos et (propriétaire) prix planchers. */
export async function saveProduct(input) {
  let session;
  try {
    session = await assertStaff();
  } catch {
    return { ok: false, message: "Accès refusé." };
  }
  const isOwner = session.profile.role === "proprietaire";
  const { data, errors } = await clean(input);
  if (errors) return { ok: false, errors, message: "Corrige les champs en rouge." };

  const supabase = await createClient();
  let productId = input.id || null;

  // 1. Produit
  const res = productId
    ? await supabase.from("products").update(data.product).eq("id", productId).select("id").single()
    : await supabase.from("products").insert(data.product).select("id").single();
  if (res.error) {
    if (res.error.code === "23505") return { ok: false, errors: { slug: "Cette adresse est déjà utilisée par un autre produit." } };
    return { ok: false, message: `Enregistrement impossible : ${res.error.message}` };
  }
  productId = res.data.id;

  // 2. Variantes : mise à jour, ajout, suppression de celles retirées du formulaire
  const { data: existing } = await supabase.from("product_variants").select("id").eq("product_id", productId);
  const keep = new Set(data.variants.filter((v) => v.id).map((v) => v.id));
  const toDelete = (existing ?? []).map((v) => v.id).filter((id) => !keep.has(id));
  if (toDelete.length) {
    const { error } = await supabase.from("product_variants").delete().in("id", toDelete);
    if (error) return { ok: false, message: `Suppression de variante impossible : ${error.message}` };
  }

  const savedIds = [];
  for (const v of data.variants) {
    const row = {
      product_id: productId,
      sku: v.id ? undefined : crypto.randomUUID().slice(0, 8),
      label: v.label,
      price: v.price,
      old_price: v.old_price,
      stock: v.stock,
      position: v.position,
    };
    const r = v.id
      ? await supabase.from("product_variants").update({ ...row, sku: undefined }).eq("id", v.id).select("id").single()
      : await supabase.from("product_variants").insert(row).select("id").single();
    if (r.error) return { ok: false, message: `Variante « ${v.label ?? "unique"} » : ${r.error.message}` };
    savedIds.push(r.data.id);
  }

  // 3. Prix planchers (propriétaire uniquement ; invisibles pour les vendeurs)
  if (isOwner) {
    const withFloor = data.variants.map((v, i) => ({ variant_id: savedIds[i], floor_price: v.floor_price }));
    const upserts = withFloor.filter((f) => f.floor_price);
    const clears = withFloor.filter((f) => !f.floor_price).map((f) => f.variant_id);
    if (upserts.length) await supabase.from("product_floor_prices").upsert(upserts);
    if (clears.length) await supabase.from("product_floor_prices").delete().in("variant_id", clears);
  }

  // 4. Photos (ordre du formulaire)
  await supabase.from("product_images").delete().eq("product_id", productId);
  if (data.images.length) {
    const { error } = await supabase
      .from("product_images")
      .insert(data.images.map((url, position) => ({ product_id: productId, url, position })));
    if (error) return { ok: false, message: `Photos : ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { ok: true, id: productId, slug: data.product.slug };
}

async function setFlag(id, patch) {
  await assertStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function setOutOfStock(id, value) {
  await setFlag(id, { force_out_of_stock: !!value });
}

export async function setPublished(id, value) {
  await setFlag(id, { is_published: !!value });
}

export async function deleteProduct(id) {
  await assertStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
