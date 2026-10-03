"use client";

import { useActionState } from "react";
import { CircleAlert, MailCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { signUp } from "./actions";
import styles from "./connexion.module.css";

export default function SignUpForm({ suite }) {
  const [state, action, pending] = useActionState(signUp, null);

  if (state?.sent) {
    return (
      <div className={styles.sent} role="status">
        <MailCheck size={40} aria-hidden />
        <p className={styles.sentTitle}>Vérifie ta boîte mail</p>
        <p>
          On t&apos;a envoyé un lien de confirmation à <strong>{state.sent}</strong>. Clique dessus pour activer ton compte.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className={styles.form}>
      {suite && <input type="hidden" name="suite" value={suite} />}
      {state?.error && (
        <p className={styles.alert} role="alert">
          <CircleAlert size={18} aria-hidden /> {state.error}
        </p>
      )}
      <div className={styles.field}>
        <label htmlFor="full_name">Nom et prénom</label>
        <input id="full_name" name="full_name" autoComplete="name" required defaultValue={state?.values?.fullName} />
      </div>
      <div className={styles.field}>
        <label htmlFor="phone">Téléphone</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="6 91 23 45 67" required defaultValue={state?.values?.phone} />
      </div>
      <div className={styles.field}>
        <label htmlFor="su-email">E-mail</label>
        <input id="su-email" name="email" type="email" autoComplete="email" required defaultValue={state?.values?.email} />
      </div>
      <div className={styles.field}>
        <label htmlFor="su-password">Mot de passe</label>
        <input id="su-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <span className={styles.hint}>8 caractères minimum.</span>
      </div>
      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
