const fcfa = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

// 522000 -> "522 000 FCFA"
export function formatFCFA(amount) {
  return `${fcfa.format(amount)} FCFA`;
}
