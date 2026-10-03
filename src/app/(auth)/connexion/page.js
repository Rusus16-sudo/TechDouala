import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, landingFor } from "@/lib/auth";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { signInWithGoogle } from "./actions";
import styles from "./connexion.module.css";

export const metadata = { title: "Connexion - TechDouala", robots: { index: false } };

const NOTICES = {
  acces: "Ce compte n'a pas accès à l'espace gérant.",
  lien: "Ce lien a expiré ou a déjà servi. Connecte-toi ou recommence l'inscription.",
  google: "La connexion avec Google n'a pas abouti. Réessaie ou utilise ton e-mail.",
};

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const suite = typeof sp.suite === "string" ? sp.suite : null;
  const signup = sp.mode === "inscription";
  const notice = NOTICES[sp.erreur] ?? null;

  // Déjà connecté (et pas renvoyé ici faute de droits) : direction l'espace gérant ou le compte.
  const session = await getSession();
  if (session && !sp.erreur) redirect(landingFor(session.profile.role, suite));

  const tab = (mode) => {
    const p = new URLSearchParams();
    if (mode) p.set("mode", mode);
    if (suite) p.set("suite", suite);
    const qs = p.toString();
    return qs ? `/connexion?${qs}` : "/connexion";
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo}>
          Tech<span>Douala</span>
        </Link>
        <h1>{signup ? "Créer mon compte" : "Connexion"}</h1>
        <p className={styles.lead}>
          {signup ? "Suis tes commandes et accède au crédit 40/60." : "Accède à ton espace TechDouala."}
        </p>

        <nav className={styles.tabs} aria-label="Connexion ou inscription">
          <Link href={tab(null)} className={!signup ? styles.tabActive : ""} aria-current={!signup ? "page" : undefined}>
            Se connecter
          </Link>
          <Link href={tab("inscription")} className={signup ? styles.tabActive : ""} aria-current={signup ? "page" : undefined}>
            Créer un compte
          </Link>
        </nav>

        {signup ? <SignUpForm suite={suite} /> : <LoginForm suite={suite} notice={notice} />}

        <div className={styles.or}>
          <span>ou</span>
        </div>
        <form action={signInWithGoogle} className={styles.googleForm}>
          {suite && <input type="hidden" name="suite" value={suite} />}
          <button type="submit" className={styles.google}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z" />
            </svg>
            Continuer avec Google
          </button>
        </form>

        <p className={styles.back}>
          <Link href="/">Retour à la boutique</Link>
        </p>
      </div>

      <aside className={styles.visual} aria-hidden>
        <Image src="/produits/galaxy-s25-ultra.webp" alt="" fill sizes="50vw" className={styles.visualPhoto} preload />
        <div className={styles.visualText}>
          <strong>Tes commandes et ton crédit, au même endroit.</strong>
          <p>Suis chaque commande, tes échéances 40/60 et tes avis depuis ton compte.</p>
        </div>
      </aside>
    </main>
  );
}
