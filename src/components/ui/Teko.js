import { Bot } from "lucide-react";
import styles from "./Teko.module.css";

/** Avatar de Tekô, le conseiller tech (représenté par une icône de chatbot). */
export function TekoAvatar({ size = 40 }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size }} aria-hidden>
      <Bot size={Math.round(size * 0.55)} strokeWidth={2} />
    </span>
  );
}

/** Bulle de message de Tekô : aide, explique et célèbre chaque étape. */
export default function TekoMessage({ title, children }) {
  return (
    <div className={styles.message} role="note" aria-label="Message de Tekô">
      <TekoAvatar />
      <div className={styles.bubble}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.text}>{children}</div>
      </div>
    </div>
  );
}
