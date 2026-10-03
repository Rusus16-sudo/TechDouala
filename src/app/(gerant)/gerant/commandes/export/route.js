import ExcelJS from "exceljs";
import { assertStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeCmPhone } from "@/lib/checkout";
import { describeOrderFilters, queryOrders, readOrderFilters } from "@/lib/data/orders";
import { CHANNEL_LABELS, ORDER_STATUSES, PAYMENT_STATUSES, SOLD_STATUSES as SOLD, paymentLabel } from "@/lib/orders";

const MAX_ROWS = 10000;
const FCFA = '#,##0 "FCFA"';
const DATE_TIME = "dd/mm/yyyy hh:mm";
const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F7" } };
const DOUALA = 60 * 60 * 1000;

const SELECT = `
  number, created_at, channel, status, payment_method, payment_status, paid_at,
  customer_name, customer_phone, customer_email, credit_requested, notes,
  subtotal, discount, promo_code, total,
  seller:profiles!orders_seller_id_fkey(full_name),
  items:order_items(product_name, variant_label, color, qty, unit_price, total)
`;

// Excel ne connaît pas les fuseaux : la date est écrite à l'heure de Douala.
const localDate = (iso) => (iso ? new Date(Date.parse(iso) + DOUALA) : null);
const phone = (p) => (p ? (normalizeCmPhone(p) ?? p) : "");
const itemText = (i) =>
  `${i.qty} × ${i.product_name}${i.variant_label ? ` ${i.variant_label}` : ""}${i.color ? ` (${i.color})` : ""}`;

/** En-tête : gras, fond gris, filtres automatiques et première ligne figée. */
function styleSheet(ws) {
  const header = ws.getRow(1);
  header.font = { bold: true };
  header.fill = HEADER_FILL;
  header.alignment = { vertical: "middle" };
  header.height = 22;
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
}

/** Ligne de totaux : SOUS.TOTAL ignore les lignes masquées par un filtre dans Excel. */
function addTotals(ws, lastRow, label, sums) {
  if (lastRow < 2) return;
  const row = ws.getRow(lastRow + 2);
  row.getCell(1).value = label;
  for (const [key, result] of Object.entries(sums)) {
    const col = ws.getColumn(key);
    const cell = row.getCell(col.number);
    cell.value = { formula: `SUBTOTAL(109,${col.letter}2:${col.letter}${lastRow})`, result };
    cell.numFmt = col.numFmt;
  }
  row.font = { bold: true };
  row.border = { top: { style: "thin" } };
}

export async function GET(request) {
  try {
    await assertStaff();
  } catch {
    return new Response("Accès refusé.", { status: 403 });
  }

  const filters = readOrderFilters(Object.fromEntries(request.nextUrl.searchParams));
  const supabase = await createClient();
  const { data: orders, error } = await queryOrders(supabase, filters, { select: SELECT, limit: MAX_ROWS });
  if (error) return new Response(`Export impossible : ${error.message}`, { status: 500 });

  const wb = new ExcelJS.Workbook();
  wb.creator = "TechDouala";
  wb.created = new Date();
  // Excel recalcule toutes les formules à l'ouverture (ExcelJS n'enregistre pas les résultats nuls).
  wb.calcProperties.fullCalcOnLoad = true;

  // ---------------------------------------------------------------- Commandes
  const ws = wb.addWorksheet("Commandes");
  ws.columns = [
    { header: "N° commande", key: "number", width: 16 },
    { header: "Date", key: "date", width: 17, style: { numFmt: DATE_TIME } },
    { header: "Canal", key: "channel", width: 11 },
    { header: "Statut", key: "status", width: 17 },
    { header: "Paiement", key: "paymentStatus", width: 12 },
    { header: "Moyen de paiement", key: "paymentMethod", width: 18 },
    { header: "Encaissé le", key: "paidAt", width: 17, style: { numFmt: DATE_TIME } },
    { header: "Client", key: "customer", width: 24 },
    { header: "Téléphone", key: "phone", width: 15 },
    { header: "E-mail", key: "email", width: 26 },
    { header: "Nb articles", key: "qty", width: 11 },
    { header: "Articles", key: "items", width: 48 },
    { header: "Sous-total", key: "subtotal", width: 15, style: { numFmt: FCFA } },
    { header: "Remise", key: "discount", width: 13, style: { numFmt: FCFA } },
    { header: "Code promo", key: "promo", width: 13 },
    { header: "Total", key: "total", width: 15, style: { numFmt: FCFA } },
    { header: "Crédit 40/60", key: "credit", width: 13 },
    { header: "Vendu par", key: "seller", width: 18 },
    { header: "Message / note", key: "notes", width: 40 },
  ];

  for (const o of orders) {
    const row = ws.addRow({
      number: o.number,
      date: localDate(o.created_at),
      channel: CHANNEL_LABELS[o.channel] ?? o.channel,
      status: ORDER_STATUSES[o.status]?.label ?? o.status,
      paymentStatus: PAYMENT_STATUSES[o.payment_status]?.label ?? o.payment_status,
      paymentMethod: paymentLabel(o.payment_method),
      paidAt: localDate(o.paid_at),
      customer: o.customer_name,
      phone: phone(o.customer_phone),
      email: o.customer_email ?? "",
      qty: o.items.reduce((n, i) => n + i.qty, 0),
      items: o.items.map(itemText).join(" ; "),
      subtotal: o.subtotal,
      discount: o.discount,
      promo: o.promo_code ?? "",
      total: o.total,
      credit: o.payment_method === "credit" ? "Oui" : o.credit_requested ? "Demandé" : "",
      seller: o.seller?.full_name ?? "",
      notes: o.notes ?? "",
    });
    row.alignment = { vertical: "top", wrapText: false };
    // Commandes annulées : grisées pour se distinguer d'un coup d'œil.
    if (o.status === "annulee") row.font = { color: { argb: "FF9A9AA0" }, italic: true };
  }
  styleSheet(ws);
  const sum = (key) => orders.reduce((n, o) => n + (key === "qty" ? o.items.reduce((m, i) => m + i.qty, 0) : o[key]), 0);
  addTotals(ws, orders.length + 1, "Total (lignes visibles)", {
    qty: sum("qty"),
    subtotal: sum("subtotal"),
    discount: sum("discount"),
    total: sum("total"),
  });

  // ---------------------------------------------------------------- Articles
  const wi = wb.addWorksheet("Articles");
  wi.columns = [
    { header: "N° commande", key: "number", width: 16 },
    { header: "Date", key: "date", width: 17, style: { numFmt: DATE_TIME } },
    { header: "Statut", key: "status", width: 17 },
    { header: "Client", key: "customer", width: 24 },
    { header: "Produit", key: "product", width: 30 },
    { header: "Variante", key: "variant", width: 18 },
    { header: "Couleur", key: "color", width: 12 },
    { header: "Qté", key: "qty", width: 7 },
    { header: "Prix unitaire", key: "unit", width: 15, style: { numFmt: FCFA } },
    { header: "Total ligne", key: "total", width: 15, style: { numFmt: FCFA } },
  ];
  let itemRows = 0;
  let itemQty = 0;
  let itemTotal = 0;
  for (const o of orders) {
    for (const i of o.items) {
      const row = wi.addRow({
        number: o.number,
        date: localDate(o.created_at),
        status: ORDER_STATUSES[o.status]?.label ?? o.status,
        customer: o.customer_name,
        product: i.product_name,
        variant: i.variant_label ?? "",
        color: i.color ?? "",
        qty: i.qty,
        unit: i.unit_price,
        total: i.total,
      });
      if (o.status === "annulee") row.font = { color: { argb: "FF9A9AA0" }, italic: true };
      itemRows += 1;
      itemQty += i.qty;
      itemTotal += i.total;
    }
  }
  styleSheet(wi);
  addTotals(wi, itemRows + 1, "Total (lignes visibles)", { qty: itemQty, total: itemTotal });

  // ---------------------------------------------------------------- Synthèse
  const wsum = wb.addWorksheet("Synthèse");
  wsum.columns = [
    { key: "label", width: 40 },
    { key: "count", width: 14 },
    { key: "amount", width: 18, style: { numFmt: FCFA } },
  ];
  const filterText = describeOrderFilters(filters);

  wsum.addRow({ label: "Export des commandes TechDouala" }).font = { bold: true, size: 14 };
  wsum.addRow({ label: `Généré le ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Douala" }).format(new Date())}` });
  wsum.addRow({ label: `Filtres : ${filterText}` });
  if (orders.length === MAX_ROWS) wsum.addRow({ label: `Attention : limité aux ${MAX_ROWS} commandes les plus récentes.` });
  wsum.addRow({});
  const head = wsum.addRow({ label: "Statut", count: "Commandes", amount: "Montant" });
  head.font = { bold: true };
  head.fill = HEADER_FILL;

  // Formules liées à l'onglet Commandes : elles se recalculent si on y corrige une valeur.
  const n = orders.length + 1;
  const statusCol = ws.getColumn("status").letter;
  const totalCol = ws.getColumn("total").letter;
  const payCol = ws.getColumn("paymentStatus").letter;
  const range = (col) => `Commandes!$${col}$2:$${col}$${Math.max(n, 2)}`;
  const firstStatusRow = wsum.rowCount + 1;
  for (const [key, s] of Object.entries(ORDER_STATUSES)) {
    const subset = orders.filter((o) => o.status === key);
    if (!subset.length && (key === "prete" || key === "en_livraison")) continue; // anciennes étapes
    wsum.addRow({
      label: s.label,
      count: { formula: `COUNTIF(${range(statusCol)},"${s.label}")`, result: subset.length },
      amount: { formula: `SUMIF(${range(statusCol)},"${s.label}",${range(totalCol)})`, result: subset.reduce((x, o) => x + o.total, 0) },
    });
  }
  const lastStatusRow = wsum.rowCount;
  wsum.addRow({});

  const sold = orders.filter((o) => SOLD.includes(o.status));
  const soldLabels = SOLD.map((k) => ORDER_STATUSES[k].label);
  const soldRows = [];
  for (let r = firstStatusRow; r <= lastStatusRow; r++) {
    if (soldLabels.includes(wsum.getRow(r).getCell(1).value)) soldRows.push(r);
  }
  const salesRow = wsum.addRow({
    label: "Ventes confirmées (hors à confirmer et annulées)",
    count: { formula: soldRows.map((r) => `B${r}`).join("+") || "0", result: sold.length },
    amount: { formula: soldRows.map((r) => `C${r}`).join("+") || "0", result: sold.reduce((x, o) => x + o.total, 0) },
  });
  salesRow.font = { bold: true };
  const paid = orders.filter((o) => o.payment_status === "paye" && o.status !== "annulee");
  wsum.addRow({
    label: "Encaissé (paiement validé)",
    count: {
      formula: `COUNTIFS(${range(payCol)},"${PAYMENT_STATUSES.paye.label}",${range(statusCol)},"<>${ORDER_STATUSES.annulee.label}")`,
      result: paid.length,
    },
    amount: {
      formula: `SUMIFS(${range(totalCol)},${range(payCol)},"${PAYMENT_STATUSES.paye.label}",${range(statusCol)},"<>${ORDER_STATUSES.annulee.label}")`,
      result: paid.reduce((x, o) => x + o.total, 0),
    },
  });

  // ---------------------------------------------------------------- Fichier
  const buffer = await wb.xlsx.writeBuffer();
  const today = new Date(Date.now() + DOUALA).toISOString().slice(0, 10);
  const suffix = filters.period ? `-${filters.period}` : "";
  const filename = `commandes-techdouala-${today}${suffix}.xlsx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
