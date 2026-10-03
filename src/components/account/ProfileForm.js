"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import { updateProfile } from "@/app/(shop)/compte/actions";
import { normalizeCmPhone } from "@/lib/checkout";
import styles from "./account.module.css";

export default function ProfileForm({ profile, email }) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className={styles.form}>
      {state?.error && <p className={styles.alert}>{state.error}</p>}
      {state?.ok && <p className={styles.ok}>{state.ok}</p>}
      <div className={styles.field}>
        <label htmlFor="full_name">Nom et prénom</label>
        <input id="full_name" name="full_name" autoComplete="name" defaultValue={profile.full_name ?? ""} required />
      </div>
      <div className={styles.field}>
        <label htmlFor="phone">Téléphone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="6 91 23 45 67"
          defaultValue={normalizeCmPhone(profile.phone ?? "") ?? profile.phone ?? ""}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="email">E-mail</label>
        <input id="email" value={email} disabled readOnly />
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
