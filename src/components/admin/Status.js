import styles from "./Status.module.css";

/**
 * Statut dans l'espace gérant : le mot s'écrit en encre, la couleur tient
 * dans une pastille de 6 px. Un tableau de gestion se lit en diagonale,
 * il ne doit pas ressembler à un jeu de pastilles colorées.
 *
 * tone : done (terminé, encaissé) · progress (en cours) · wait (action attendue)
 *        critical (retard, échec) · off (masqué, annulé) · neutral (état simple)
 */
export default function Status({ tone = "neutral", children }) {
  return (
    <span className={`${styles.status} ${styles[tone] ?? styles.neutral}`}>
      <span className={styles.dot} aria-hidden />
      {children}
    </span>
  );
}

/** Attribut secondaire (Flash, Coup de cœur) : sans couleur, il ne concurrence pas le statut. */
export function Tag({ children }) {
  return <span className={styles.tag}>{children}</span>;
}
