import styles from "./Badge.module.css";

/**
 * Badges de la maquette.
 * - success / alert : pastilles pleines (statuts : "Bon payeur", "À payer"…)
 * - success-soft / alert-soft / violet-soft : chips légers (cartes produit : "Garantie 12 mois", "Neuf"…)
 */
export default function Badge({ variant = "success", icon: Icon, className = "", children }) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {Icon && <Icon size={12} strokeWidth={2.5} aria-hidden />}
      {children}
    </span>
  );
}
