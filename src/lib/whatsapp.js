import { STORE } from "./store";
import { formatFCFA } from "./format";

/**
 * Lien WhatsApp avec message prérempli.
 * Sans destinataire : la boutique. Avec un numéro camerounais : ce client (espace gérant).
 */
export function waLink(message, phone) {
  const digits = phone ? `237${String(phone).replace(/\D/g, "").replace(/^237/, "")}` : STORE.whatsapp;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const line = (l) =>
  `• ${l.qty} × ${l.name}${l.storage ? ` ${l.storage}` : ""}${l.color ? ` (${l.color})` : ""} — ${formatFCFA(l.total)}`;

/**
 * Message de fin de commande : la commande est déjà enregistrée, le client l'envoie à la boutique
 * pour convenir du paiement et de la remise de l'appareil.
 */
export function orderMessage(order) {
  const lines = (order.lines ?? []).map(line).join("\n");

  const reglement = order.credit
    ? `Je souhaite acheter à crédit 40/60 : acompte de ${formatFCFA(order.credit.downPayment)}, puis ${order.credit.months} × ${formatFCFA(order.credit.monthly)}.`
    : "Je règle comptant.";

  return [
    `Bonjour TechDouala, je viens de passer la commande ${order.number}.`,
    "",
    lines,
    "",
    order.discount > 0 ? `Code promo ${order.promoCode} : -${formatFCFA(order.discount)}` : null,
    `Total : ${formatFCFA(order.total)}`,
    reglement,
    order.note ? `\n${order.note}` : null,
    "",
    `Mon nom : ${order.customer?.fullName ?? ""}`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

/**
 * Message depuis « Mon compte » : une commande encore en attente est renvoyée avec son détail
 * (la boutique peut la confirmer d'un coup d'œil), sinon simple prise de contact.
 */
export function orderFollowUpMessage({ number, status, items = [], total }) {
  if (status !== "en_attente" || !items.length) {
    return `Bonjour TechDouala, je vous écris au sujet de ma commande ${number}.`;
  }
  return [
    `Bonjour TechDouala, je vous envoie ma commande ${number} pour confirmation.`,
    "",
    ...items.map((i) => line({ qty: i.qty, name: i.product_name, storage: i.variant_label, color: i.color, total: i.total })),
    "",
    `Total : ${formatFCFA(total)}`,
  ].join("\n");
}

/** Offre de prix sur un produit : la négociation se poursuit sur WhatsApp (cahier 5.3). */
export function offerMessage({ name, variant, price, offer, url }) {
  return [
    `Bonjour TechDouala, je suis intéressé(e) par le ${name}${variant ? ` ${variant}` : ""}.`,
    `Prix affiché : ${formatFCFA(price)}`,
    offer ? `Ma proposition : ${formatFCFA(offer)}` : "Est-ce que le prix est négociable ?",
    url ? `\n${url}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Question sur un produit, sans offre de prix. */
export function productMessage({ name, variant, price, url }) {
  return [
    `Bonjour TechDouala, j'ai une question sur le ${name}${variant ? ` ${variant}` : ""} (${formatFCFA(price)}).`,
    url ? `\n${url}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Demande d'achat à crédit depuis la fiche produit ou la page crédit. */
export function creditMessage({ name, variant, price, downPayment, monthly, months }) {
  return [
    `Bonjour TechDouala, je veux acheter le ${name}${variant ? ` ${variant}` : ""} à crédit 40/60.`,
    `Prix : ${formatFCFA(price)}`,
    `Acompte : ${formatFCFA(downPayment)}, puis ${months} × ${formatFCFA(monthly)}`,
    "Que faut-il pour ouvrir le dossier ?",
  ].join("\n");
}

/** Relance d'un client par la boutique, depuis l'espace gérant. */
export function staffOrderMessage({ number, customerName, status }) {
  const firstName = (customerName ?? "").split(" ")[0];
  return [
    `Bonjour ${firstName}, c'est TechDouala 👋`,
    `Au sujet de ta commande ${number}${status ? ` (${status.toLowerCase()})` : ""}.`,
  ].join("\n");
}
