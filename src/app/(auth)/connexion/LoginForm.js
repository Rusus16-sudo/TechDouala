"use client";

import { useActionState } from "react";
import { CircleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { signIn } from "./actions";
import styles from "./connexion.module.css";

export default function LoginForm({ suite, notice }) {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className={styles.form}>
      {suite && <input type="hidden" name="suite" value={suite} />}
      {(state?.error || notice) && (
        <p className={styles.alert} role="alert">
          <CircleAlert size={18} aria-hidden /> {state?.error ?? notice}
        </p>
      )}
      <div className={styles.field}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.email} />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
