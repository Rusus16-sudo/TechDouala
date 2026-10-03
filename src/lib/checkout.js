// Règles du formulaire de commande, partagées entre le navigateur (retour immédiat) et le serveur (contrôle final).
// Paiement et remise ne se choisissent plus sur le site : ils se conviennent avec la boutique sur WhatsApp.

export const MAX_QTY_PER_LINE = 5;
export const MAX_NOTE_LENGTH = 500;

/** Numéro camerounais : 9 chiffres commençant par 6, avec ou sans +237. Renvoie « 6XX XX XX XX » ou null. */
export function normalizeCmPhone(raw = "") {
  const digits = String(raw).replace(/\D/g, "").replace(/^237(?=\d{9}$)/, "");
  if (!/^6\d{8}$/.test(digits)) return null;
  return digits.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
}

/** Valide les champs du formulaire. Renvoie un objet { champ: message } (vide si tout est bon). */
export function validateCheckout(f) {
  const e = {};
  if (!f.fullName || f.fullName.trim().length < 3) e.fullName = "Indique ton nom et prénom.";
  if (!normalizeCmPhone(f.phone)) e.phone = "Numéro invalide. Exemple : 6 91 23 45 67.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Adresse e-mail invalide.";
  if ((f.note ?? "").length > MAX_NOTE_LENGTH) e.note = `${MAX_NOTE_LENGTH} caractères au maximum.`;
  return e;
}

/** Numéro camerounais réduit à ses 9 chiffres (format enregistré en base), ou null. */
export function cmPhoneDigits(raw) {
  return normalizeCmPhone(raw)?.replace(/\s/g, "") ?? null;
}
