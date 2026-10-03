import PDFDocument from "pdfkit";
import { formatFCFA } from "./format";
import { CHANNEL_LABELS, ORDER_STATUSES, PAYMENT_STATUSES, SOLD_STATUSES, formatDateTime, paymentLabel } from "./orders";

// Couleurs du site (globals.css) et pastilles de statut de l'espace gérant (Status.module.css).
const INK = "#1D1D1F";
const MUTED = "#6E6E73";
const RULE = "#E5E5EA";
const TILE = "#F5F5F7";
const VIOLET = "#6A40FF";
const TONES = { done: "#007A56", progress: VIOLET, wait: "#C98500", critical: "#DC2626", neutral: MUTED, off: null };

// A4 paysage, marges de 36 pt : 770 pt de large pour le tableau.
const MARGIN = 36;
const PAD = 6;
const COLUMNS = [
  { key: "number", label: "Commande", width: 96 },
  { key: "client", label: "Client", width: 150 },
  { key: "items", label: "Articles", width: 214 },
  { key: "status", label: "Statut", width: 104 },
  { key: "payment", label: "Paiement", width: 116 },
  { key: "total", label: "Total", width: 90, align: "right" },
];

// Helvetica (police standard des PDF) ne connaît pas les espaces fines de Intl.NumberFormat.
const txt = (s) => String(s ?? "").replace(/[  ]/g, " ");
const phone = (p) => (p ? String(p).replace(/^(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5") : "");
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;

/** Cellules d'une commande : [ligne principale, ligne secondaire en gris]. */
function cells(o) {
  const items = o.items.map((i) => `${i.qty} × ${i.product_name}${i.variant_label ? ` ${i.variant_label}` : ""}`);
  return {
    number: [o.number, formatDateTime(o.created_at)],
    client: [o.customer_name, [phone(o.customer_phone), CHANNEL_LABELS[o.channel]].filter(Boolean).join(" · ")],
    items: [items.join("\n"), ""],
    status: [ORDER_STATUSES[o.status]?.label ?? o.status, ""],
    payment: [
      PAYMENT_STATUSES[o.payment_status]?.label ?? o.payment_status,
      o.credit_requested && !o.payment_method ? "Crédit demandé" : paymentLabel(o.payment_method),
    ],
    total: [formatFCFA(o.total), ""],
  };
}

const toneOf = (key, o) =>
  key === "status" ? ORDER_STATUSES[o.status]?.tone : key === "payment" ? PAYMENT_STATUSES[o.payment_status]?.tone : undefined;

/**
 * Liste des commandes en PDF (A4 paysage) : chiffres clés, tableau paginé, total.
 * `orders` : lignes de la table orders avec items:order_items(product_name, variant_label, qty).
 */
export function ordersPdf(orders, { filtersText, limit, generatedAt = new Date() }) {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: MARGIN,
    bufferPages: true,
    info: { Title: "Commandes TechDouala", Author: "TechDouala" },
  });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  const left = MARGIN;
  const right = doc.page.width - MARGIN;
  const bottom = doc.page.height - MARGIN - 18; // place du pied de page

  // ---------------------------------------------------------------- En-tête
  doc.font("Helvetica-Bold").fontSize(16).fillColor(INK).text("Tech", left, MARGIN, { continued: true });
  doc.fillColor(VIOLET).text("Douala");
  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fontSize(22).fillColor(INK).text("Commandes");
  const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Douala" }).format(generatedAt);
  doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(txt(`${filtersText} · générée le ${when}`));
  if (limit && orders.length >= limit) {
    doc.fillColor(TONES.critical).text(`Limité aux ${limit} commandes les plus récentes : affine les filtres.`);
  }

  // ---------------------------------------------------------------- Chiffres clés
  const sold = orders.filter((o) => SOLD_STATUSES.includes(o.status));
  const paid = orders.filter((o) => o.payment_status === "paye" && o.status !== "annulee");
  const waiting = orders.filter((o) => o.status === "en_attente");
  const sum = (list) => list.reduce((n, o) => n + o.total, 0);
  const figures = [
    ["Commandes", String(orders.length), "annulées comprises"],
    ["Ventes confirmées", formatFCFA(sum(sold)), plural(sold.length, "commande")],
    ["Encaissé", formatFCFA(sum(paid)), plural(paid.length, "paiement") + (paid.length > 1 ? " validés" : " validé")],
    ["À confirmer", String(waiting.length), formatFCFA(sum(waiting))],
  ];
  const boxY = doc.y + 16;
  const boxW = (right - left - 3 * 10) / 4;
  figures.forEach(([label, value, note], i) => {
    const x = left + i * (boxW + 10);
    const dark = i === 1; // les ventes : le chiffre qui compte
    doc.roundedRect(x, boxY, boxW, 62, 8).fill(dark ? INK : TILE);
    doc.font("Helvetica").fontSize(9).fillColor(dark ? "#BDBDC2" : MUTED).text(label, x + 14, boxY + 12, { width: boxW - 28 });
    doc.font("Helvetica-Bold").fontSize(17).fillColor(dark ? "#FFFFFF" : INK).text(txt(value), x + 14, boxY + 25, { width: boxW - 28 });
    doc.font("Helvetica").fontSize(8).fillColor(dark ? "#BDBDC2" : MUTED).text(txt(note), x + 14, boxY + 45, { width: boxW - 28 });
  });
  let y = boxY + 62 + 24;

  // ---------------------------------------------------------------- Tableau
  const header = () => {
    let x = left;
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(MUTED);
    for (const c of COLUMNS) {
      doc.text(c.label, x + PAD, y, { width: c.width - 2 * PAD, align: c.align ?? "left" });
      x += c.width;
    }
    y += 16;
    doc.moveTo(left, y).lineTo(right, y).lineWidth(0.8).strokeColor(INK).stroke();
    y += 2;
  };

  // Statut et paiement : une pastille de 6 px précède le texte.
  const dotted = (col) => col.key === "status" || col.key === "payment";
  const textWidth = (col) => col.width - 2 * PAD - (dotted(col) ? 10 : 0);

  const rowHeight = (c) => {
    let h = 0;
    for (const col of COLUMNS) {
      const [main, sub] = c[col.key];
      const w = textWidth(col);
      let ch = doc.font("Helvetica").fontSize(9).heightOfString(txt(main) || " ", { width: w });
      if (sub) ch += 2 + doc.fontSize(8).heightOfString(txt(sub), { width: w });
      h = Math.max(h, ch);
    }
    return h + 16;
  };

  if (orders.length === 0) {
    doc.font("Helvetica").fontSize(11).fillColor(MUTED).text("Aucune commande ne correspond à ces filtres.", left, y);
  } else {
    header();
    for (const o of orders) {
      const c = cells(o);
      const h = rowHeight(c);
      if (y + h > bottom) {
        doc.addPage();
        y = MARGIN;
        header();
      }
      const off = o.status === "annulee"; // annulées : en retrait, comme dans l'export Excel
      let x = left;
      for (const col of COLUMNS) {
        const [main, sub] = c[col.key];
        let tx = x + PAD;
        if (dotted(col)) {
          const color = off ? null : TONES[toneOf(col.key, o)];
          if (color) doc.circle(tx + 2.5, y + 12.5, 2.5).fill(color);
          else doc.circle(tx + 2.5, y + 12.5, 2.2).lineWidth(0.8).strokeColor(RULE).stroke();
          tx += 10;
        }
        const w = textWidth(col);
        const bold = col.key === "number" || col.key === "total";
        doc
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(9)
          .fillColor(off ? MUTED : INK)
          .text(txt(main), tx, y + 8, { width: w, align: col.align ?? "left" });
        if (sub) doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(txt(sub), tx, doc.y + 2, { width: w, align: col.align ?? "left" });
        x += col.width;
      }
      y += h;
      doc.moveTo(left, y).lineTo(right, y).lineWidth(0.5).strokeColor(RULE).stroke();
    }

    // Total des commandes listées
    y += 10;
    if (y + 20 > bottom) {
      doc.addPage();
      y = MARGIN;
    }
    doc.font("Helvetica-Bold").fontSize(10).fillColor(INK);
    doc.text(`Total des ${plural(orders.length, "commande")} listée${orders.length > 1 ? "s" : ""}`, left + PAD, y, { width: 400 });
    doc.text(txt(formatFCFA(sum(orders))), right - 200 - PAD, y, { width: 200, align: "right" });
  }

  // ---------------------------------------------------------------- Pied de page
  const { start, count } = doc.bufferedPageRange();
  for (let i = start; i < start + count; i++) {
    doc.switchToPage(i);
    doc.page.margins.bottom = 0; // sinon pdfkit ouvre une page vide pour écrire dans la marge
    const fy = doc.page.height - MARGIN - 8;
    doc.font("Helvetica").fontSize(8).fillColor(MUTED);
    doc.text("TechDouala · export des commandes", left, fy, { width: 300, lineBreak: false });
    doc.text(`Page ${i - start + 1} / ${count}`, right - 120, fy, { width: 120, align: "right", lineBreak: false });
  }
  doc.end();
  return done;
}
