import { NextResponse } from "next/server";
import { assertStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const FRESH = "id, number, created_at, customer_name, total";

// Interrogé régulièrement par l'espace gérant : compteur « à confirmer » et commandes en ligne arrivées
// depuis `depuis` (date de création de la dernière commande déjà vue, horloge de la base).
export async function GET(request) {
  try {
    await assertStaff();
  } catch {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const since = new URL(request.url).searchParams.get("depuis");
  const supabase = await createClient();
  const online = () => supabase.from("orders").select(FRESH).eq("channel", "en_ligne");

  const [{ count }, { data }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "en_attente"),
    since && !Number.isNaN(Date.parse(since))
      ? online().gt("created_at", since).order("created_at", { ascending: true }).limit(10)
      : online().order("created_at", { ascending: false }).limit(1),
  ]);

  const rows = data ?? [];
  const fresh = since ? rows : [];
  // Aucune commande encore : on part de 1970 pour que la toute première soit annoncée.
  const cursor = rows.length ? rows[since ? rows.length - 1 : 0].created_at : (since ?? new Date(0).toISOString());
  return NextResponse.json({ waiting: count ?? 0, fresh, cursor });
}
