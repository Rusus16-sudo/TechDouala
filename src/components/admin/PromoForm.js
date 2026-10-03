"use client";

import { useActionState, useState } from "react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import DateField from "@/components/admin/DateField";
import { createPromo } from "@/app/(gerant)/gerant/promos/actions";
import a from "./admin.module.css";

/** Période de validité : calendrier du site, valeurs envoyées au formulaire (AAAA-MM-JJ). */
function PromoDates() {
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  return (
    <>
      <DateField id="starts_at" label="Début" optional value={startsAt} onChange={setStartsAt} hint="Vide : dès aujourd'hui." />
      <input type="hidden" name="starts_at" value={startsAt} />
      <DateField
        id="ends_at"
        label="Fin"
        optional
        value={endsAt}
        onChange={setEndsAt}
        min={startsAt}
        hint="Vide : sans date de fin."
      />
      <input type="hidden" name="ends_at" value={endsAt} />
    </>
  );
}

export default function PromoForm({ categories }) {
  const [state, action, pending] = useActionState(createPromo, null);
  const [kind, setKind] = useState("pourcentage");
  // Après un succès, on remonte le formulaire pour le vider.
  const formKey = state?.ok ?? "form";

  return (
    <form key={formKey} action={action} className={a.form}>
      {state?.error && <p className={a.alert}>{state.error}</p>}
      {state?.ok && <p className={a.success}>{state.ok}</p>}
      <div className={a.grid2}>
        <div className={a.field}>
          <label htmlFor="code">Code</label>
          <input id="code" name="code" required placeholder="RENTREE10" defaultValue={state?.values?.code} style={{ textTransform: "uppercase" }} />
        </div>
        <div className={a.field}>
          <label htmlFor="description">Description (interne)</label>
          <input id="description" name="description" placeholder="Rentrée scolaire" defaultValue={state?.values?.description ?? ""} />
        </div>
      </div>
      <div className={a.grid3}>
        <div className={a.field}>
          <label htmlFor="kind">Type de remise</label>
          <Select
            id="kind"
            name="kind"
            value={kind}
            onChange={setKind}
            options={[
              { value: "pourcentage", label: "Pourcentage (%)" },
              { value: "montant", label: "Montant (FCFA)" },
            ]}
          />
        </div>
        <div className={a.field}>
          <label htmlFor="value">{kind === "pourcentage" ? "Remise (%)" : "Remise (FCFA)"}</label>
          <input id="value" name="value" type="number" min="1" max={kind === "pourcentage" ? 90 : undefined} required defaultValue={state?.values?.value ?? ""} />
        </div>
        <div className={a.field}>
          <label htmlFor="min_order">Achat minimum (FCFA)</label>
          <input id="min_order" name="min_order" type="number" min="0" placeholder="0" defaultValue={state?.values?.min_order || ""} />
        </div>
      </div>
      <div className={a.grid3}>
        <PromoDates />
        <div className={a.field}>
          <label htmlFor="category_slug">Catégorie</label>
          <Select
            id="category_slug"
            name="category_slug"
            defaultValue=""
            options={[{ value: "", label: "Toutes" }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
          />
        </div>
      </div>
      <div className={a.grid2}>
        <div className={a.field}>
          <label htmlFor="max_uses">Utilisations au total</label>
          <input id="max_uses" name="max_uses" type="number" min="1" placeholder="Illimité" />
        </div>
        <div className={a.field}>
          <label htmlFor="max_uses_per_phone">Utilisations par client</label>
          <input id="max_uses_per_phone" name="max_uses_per_phone" type="number" min="1" defaultValue="1" />
        </div>
      </div>
      <label className={a.check}>
        <input type="checkbox" name="is_active" defaultChecked /> Actif dès maintenant
      </label>
      <p className={a.hint}>
        Le code ne s&apos;applique pas aux ventes flash et ne fait jamais descendre un prix sous le plancher.
      </p>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le code"}
        </Button>
      </div>
    </form>
  );
}
