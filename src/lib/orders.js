// Statuts de commande. `badge` : chip coloré côté client ; `tone` : statut sobre côté gérant.
// « prete » et « en_livraison » ne sont plus proposés (remise convenue sur WhatsApp), gardés pour l'historique.
// `client` : libellé vu par le client quand il diffère de celui du gérant.
export const ORDER_STATUSES = {
  en_attente: { label: "À confirmer", client: "Reçue", badge: "alert-soft", tone: "wait" },
  confirmee: { label: "Confirmée", badge: "violet-soft", tone: "progress" },
  prete: { label: "Prête", badge: "violet-soft", tone: "progress" },
  en_livraison: { label: "En livraison", badge: "violet-soft", tone: "progress" },
  livree: { label: "Remise au client", badge: "success-soft", tone: "done" },
  annulee: { label: "Annulée", badge: "neutral", tone: "off" },
};

// Statuts qui comptent comme ventes (une commande « à confirmer » n'est qu'une demande WhatsApp).
export const SOLD_STATUSES = ["confirmee", "prete", "en_livraison", "livree"];

/** Statut d'une commande tel que le client le lit (boutique, messages WhatsApp). */
export const clientStatusLabel = (status) => ORDER_STATUSES[status]?.client ?? ORDER_STATUSES[status]?.label ?? status;

export const PAYMENT_STATUSES = {
  en_attente: { label: "À encaisser", badge: "alert-soft", tone: "wait" },
  paye: { label: "Payé", badge: "success-soft", tone: "done" },
  echoue: { label: "Échoué", badge: "danger", tone: "critical" },
  rembourse: { label: "Remboursé", badge: "neutral", tone: "off" },
};

export const PAYMENT_LABELS = {
  "mtn-momo": "MTN MoMo",
  "orange-money": "Orange Money",
  cash: "Cash",
  credit: "Crédit 40/60",
};

/** Moyens d'encaissement proposés au gérant (le crédit passe par « Passer en crédit 40/60 »). */
export const CASH_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "mtn-momo", label: "MoMo" },
  { id: "orange-money", label: "OM" },
];

/** Moyen de paiement lisible ; non renseigné tant que la boutique n'a pas encaissé. */
export function paymentLabel(method) {
  return PAYMENT_LABELS[method] ?? "À convenir";
}

export const CHANNEL_LABELS = { en_ligne: "En ligne", boutique: "Boutique" };

// Périodes du filtre des commandes (liste et export Excel). Jours comptés à l'heure de Douala (UTC+1).
export const ORDER_PERIODS = [
  { value: "", label: "Toutes les dates" },
  { value: "aujourdhui", label: "Aujourd'hui" },
  { value: "7j", label: "7 derniers jours" },
  { value: "30j", label: "30 derniers jours" },
  { value: "mois", label: "Ce mois-ci" },
  { value: "mois-dernier", label: "Mois dernier" },
];

const DOUALA = 60 * 60 * 1000;

/** Bornes { from, to } (ISO, `to` exclu) d'une période du filtre, ou null pour « Toutes les dates ». */
export function periodRange(value, now = Date.now()) {
  const local = new Date(now + DOUALA); // champs UTC = heure de Douala
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate();
  const at = (year, month, day) => new Date(Date.UTC(year, month, day) - DOUALA).toISOString();
  switch (value) {
    case "aujourdhui":
      return { from: at(y, m, d), to: null };
    case "7j":
      return { from: at(y, m, d - 6), to: null };
    case "30j":
      return { from: at(y, m, d - 29), to: null };
    case "mois":
      return { from: at(y, m, 1), to: null };
    case "mois-dernier":
      return { from: at(y, m - 1, 1), to: at(y, m, 1) };
    default:
      return null;
  }
}

/** Étapes suivantes possibles depuis un statut (l'annulation passe par cancel_order). */
export function nextStatuses(order) {
  switch (order.status) {
    case "en_attente":
      return ["confirmee"];
    case "confirmee":
    case "prete":
    case "en_livraison":
      return ["livree"];
    default:
      return [];
  }
}

const dt = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Douala",
});

export function formatDateTime(iso) {
  return dt.format(new Date(iso));
}
