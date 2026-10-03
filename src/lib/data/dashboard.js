import "server-only";
import { createClient } from "@/lib/supabase/server";

const DAY = 24 * 60 * 60 * 1000;
const TZ_OFFSET = 60 * 60 * 1000; // Douala : UTC+1, sans heure d'été

/** Jour local de Douala (AAAA-MM-JJ) d'un instant. */
const localDay = (ms) => new Date(ms + TZ_OFFSET).toISOString().slice(0, 10);

function summarize(orders) {
  const revenue = orders.reduce((n, o) => n + o.total, 0);
  const paid = orders.filter((o) => o.payment_status === "paye").reduce((n, o) => n + o.total, 0);
  return { revenue, paid, pending: revenue - paid, count: orders.length, basket: orders.length ? Math.round(revenue / orders.length) : 0 };
}

// Une commande en ligne « en attente » n'est qu'une demande envoyée sur WhatsApp : elle ne compte
// dans les ventes qu'une fois confirmée par la boutique.
const SOLD = ["confirmee", "prete", "en_livraison", "livree"];

/**
 * Statistiques de ventes sur `days` jours (commandes confirmées, en ligne + boutique),
 * comparées à la période précédente de même durée, et commandes encore à confirmer.
 */
export async function getDashboard(days) {
  const now = Date.now();
  // Début de période aligné sur minuit à Douala.
  const todayStart = Date.parse(`${localDay(now)}T00:00:00+01:00`);
  const start = todayStart - (days - 1) * DAY;
  const prevStart = start - days * DAY;

  const supabase = await createClient();
  const [{ data: orders, error }, { data: variants }, { data: waiting }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, created_at, total, channel, payment_method, payment_status, order_items(product_name, variant_label, qty, total)")
      .gte("created_at", new Date(prevStart).toISOString())
      .in("status", SOLD),
    supabase.from("product_variants").select("id, label, price, stock, product:products(id, name, force_out_of_stock)"),
    supabase.from("orders").select("total").eq("status", "en_attente"),
  ]);
  if (error) throw error;

  const current = orders.filter((o) => Date.parse(o.created_at) >= start);
  const previous = orders.filter((o) => Date.parse(o.created_at) < start);

  // Ventes par jour (tous les jours de la période, même sans vente)
  const byDay = new Map();
  for (let t = start; t <= todayStart; t += DAY) byDay.set(localDay(t), { day: localDay(t), revenue: 0, orders: 0 });
  current.forEach((o) => {
    const d = byDay.get(localDay(Date.parse(o.created_at)));
    if (d) {
      d.revenue += o.total;
      d.orders += 1;
    }
  });

  const sumBy = (key) => {
    const m = new Map();
    current.forEach((o) => m.set(o[key], (m.get(o[key]) ?? 0) + o.total));
    return m;
  };

  // Produits les plus vendus (quantités et CA)
  const top = new Map();
  current.forEach((o) =>
    o.order_items.forEach((i) => {
      const t = top.get(i.product_name) ?? { name: i.product_name, qty: 0, revenue: 0 };
      t.qty += i.qty;
      t.revenue += i.total;
      top.set(i.product_name, t);
    }),
  );

  const stockRows = (variants ?? []).filter((v) => v.product);
  const lowStock = stockRows
    .filter((v) => v.product.force_out_of_stock || v.stock <= 3)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8)
    .map((v) => ({ productId: v.product.id, name: v.product.name, label: v.label, stock: v.product.force_out_of_stock ? 0 : v.stock, forced: v.product.force_out_of_stock }));

  return {
    days,
    waiting: { count: waiting?.length ?? 0, total: (waiting ?? []).reduce((n, o) => n + o.total, 0) },
    current: summarize(current),
    previous: summarize(previous),
    series: [...byDay.values()],
    channels: sumBy("channel"),
    payments: sumBy("payment_method"),
    top: [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    stock: {
      units: stockRows.reduce((n, v) => n + v.stock, 0),
      value: stockRows.reduce((n, v) => n + v.stock * v.price, 0),
      low: lowStock,
    },
  };
}
