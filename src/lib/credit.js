// Règle de crédit (cahier 5.5) : 60 % en 6 mensualités arrondies à la centaine,
// l'acompte absorbe l'arrondi pour que acompte + mensualités = prix.
export const CREDIT_MONTHS = 6;

export function creditPlan(price) {
  const monthly = Math.round((price * 0.6) / CREDIT_MONTHS / 100) * 100;
  const downPayment = price - monthly * CREDIT_MONTHS;
  return { downPayment, monthly, months: CREDIT_MONTHS };
}

export const CREDIT_STATUS_BADGE = {
  "Nouveau client": "violet-soft",
  "Bon payeur": "success-soft",
  "À surveiller": "alert-soft",
  "Crédit suspendu": "danger",
};

/** Même réputation, en version sobre pour l'espace gérant. */
export const CREDIT_STATUS_TONE = {
  "Nouveau client": "neutral",
  "Bon payeur": "done",
  "À surveiller": "wait",
  "Crédit suspendu": "critical",
};

/** Jour « aujourd'hui » à Douala (UTC+1), au format AAAA-MM-JJ. */
export function todayDouala() {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Nombre de jours entre aujourd'hui (Douala) et une échéance : négatif = en retard. */
export function daysUntil(dueDate) {
  return Math.round((Date.parse(`${dueDate}T00:00:00Z`) - Date.parse(`${todayDouala()}T00:00:00Z`)) / 86400000);
}

/** État d'une échéance pour l'affichage (cahier 5.5 : Payé, À payer, À venir, En retard). */
export function installmentState(installment) {
  if (installment.paid_at) return { key: "paye", label: "Payé", badge: "success-soft", tone: "done" };
  const days = daysUntil(installment.due_date);
  if (days < 0) return { key: "retard", label: `En retard de ${-days} j`, badge: "danger", tone: "critical", lateDays: -days };
  if (days <= 7) return { key: "a-payer", label: days === 0 ? "À payer aujourd'hui" : `À payer dans ${days} j`, badge: "alert-soft", tone: "wait" };
  return { key: "a-venir", label: "À venir", badge: "neutral", tone: "neutral" };
}

/** Avancement d'un crédit : échéances payées, pourcentage, montant restant dû. */
export function creditProgress(credit) {
  const paid = credit.installments.filter((i) => i.paid_at).length;
  const remaining = credit.installments.filter((i) => !i.paid_at).reduce((n, i) => n + i.amount, 0);
  const next = credit.installments.filter((i) => !i.paid_at).sort((a, b) => a.due_date.localeCompare(b.due_date))[0] ?? null;
  const overdueRows = credit.installments.filter((i) => !i.paid_at && daysUntil(i.due_date) < 0);
  const late = overdueRows.map((i) => -daysUntil(i.due_date));
  return {
    paid,
    total: credit.installments.length,
    percent: Math.round((paid / credit.installments.length) * 100),
    remaining,
    // Tout ce que le client doit encore : mensualités + acompte s'il n'est pas encaissé.
    due: remaining + (credit.down_paid_at ? 0 : credit.down_payment),
    // Somme des mensualités échues et impayées.
    overdue: overdueRows.reduce((n, i) => n + i.amount, 0),
    next,
    lateDays: late.length ? Math.max(...late) : 0,
  };
}
