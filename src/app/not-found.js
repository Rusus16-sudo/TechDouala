import Button from "@/components/ui/Button";
import { TekoAvatar } from "@/components/ui/Teko";
import styles from "./not-found.module.css";

export const metadata = { title: "Page introuvable - TechDouala" };

// État « Page introuvable » (cahier 7.5) : message de Tekô et retour à l'accueil.
export default function NotFound() {
  return (
    <main className={styles.page}>
      <TekoAvatar size={88} />
      <p className={styles.code}>404</p>
      <h1>Page introuvable</h1>
      <p className={styles.text}>
        Oups, cette page n&apos;existe pas ou a été déplacée. Pas de souci, Tekô te ramène à l&apos;accueil.
      </p>
      <Button href="/" size="lg">
        Retour à l&apos;accueil
      </Button>
    </main>
  );
}
