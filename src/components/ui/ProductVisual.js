import styles from "./ProductVisual.module.css";

// Halo discret aux couleurs de la marque : il situe le produit sans crier.
const TINTS = {
  apple: "rgb(90 98 115 / 0.16)",
  samsung: "rgb(59 91 217 / 0.14)",
  google: "rgb(46 139 168 / 0.14)",
  xiaomi: "rgb(232 100 27 / 0.14)",
  tecno: "rgb(36 129 201 / 0.14)",
  sharp: "rgb(122 132 153 / 0.16)",
  kyocera: "rgb(78 140 134 / 0.16)",
};

const FOLDABLE = /\b(fold|flip)\b/i;

/**
 * Visuel affiché tant qu'un produit n'a pas de photo : silhouette d'appareil sur fond clair,
 * avec un halo à la teinte de la marque. Le gérant le remplace en ajoutant ses photos.
 */
export default function ProductVisual({ name = "", brand, size = "md" }) {
  const fold = FOLDABLE.test(name);

  return (
    <div className={`${styles.visual} ${styles[size]}`} style={{ "--tint": TINTS[brand] }} aria-hidden>
      <span className={styles.glow} />
      <svg viewBox="0 0 120 200" className={styles.device}>
        {fold ? (
          <>
            <rect x="12" y="14" width="46" height="172" rx="11" className={styles.body} />
            <rect x="62" y="14" width="46" height="172" rx="11" className={styles.body} />
            <rect x="17" y="19" width="36" height="162" rx="7" className={styles.screen} />
            <rect x="67" y="19" width="36" height="162" rx="7" className={styles.screen} />
          </>
        ) : (
          <>
            <rect x="24" y="6" width="72" height="188" rx="17" className={styles.body} />
            <rect x="29" y="11" width="62" height="178" rx="13" className={styles.screen} />
            <rect x="50" y="16" width="20" height="5" rx="2.5" className={styles.notch} />
          </>
        )}
      </svg>
    </div>
  );
}
