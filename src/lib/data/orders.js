import "server-only";
import { CHANNEL_LABELS, ORDER_PERIODS, ORDER_STATUSES, periodRange } from "@/lib/orders";

/** Filtres de la liste des commandes, lus dans l'URL (mêmes règles pour la liste et l'export). */
export function readOrderFilters(sp) {
  const one = (k) => (typeof sp?.[k] === "string" ? sp[k] : "");
  const status = one("statut");
  const channel = one("canal");
  const period = one("periode");
  return {
    status: ORDER_STATUSES[status] ? status : "",
    channel: CHANNEL_LABELS[channel] ? channel : "",
    period: ORDER_PERIODS.some((p) => p.value === period) ? period : "",
    q: one("q").trim(),
  };
}

/** Filtres actifs en clair, pour l'en-tête des exports (« 7 derniers jours · Boutique »). */
export function describeOrderFilters(f) {
  return [
    ORDER_PERIODS.find((p) => p.value === f.period)?.label ?? "Toutes les dates",
    f.status && ORDER_STATUSES[f.status].label,
    f.channel && CHANNEL_LABELS[f.channel],
    f.q && `recherche « ${f.q} »`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Paramètres d'URL des filtres actifs (pour garder les filtres d'une page à l'autre). */
export function orderFiltersQuery(f) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.status) p.set("statut", f.status);
  if (f.channel) p.set("canal", f.channel);
  if (f.period) p.set("periode", f.period);
  return p.toString();
}

/** Requête des commandes selon les filtres, les plus récentes en premier. */
export function queryOrders(supabase, f, { select, limit }) {
  let query = supabase.from("orders").select(select).order("created_at", { ascending: false }).limit(limit);
  if (f.status) query = query.eq("status", f.status);
  if (f.channel) query = query.eq("channel", f.channel);
  const range = periodRange(f.period);
  if (range?.from) query = query.gte("created_at", range.from);
  if (range?.to) query = query.lt("created_at", range.to);
  if (f.q) {
    const safe = f.q.replace(/[%,()]/g, "");
    query = query.or(`number.ilike.%${safe}%,customer_name.ilike.%${safe}%,customer_phone.ilike.%${safe.replace(/\s/g, "")}%`);
  }
  return query;
}
