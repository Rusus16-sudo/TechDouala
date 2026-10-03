"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";
import { submitReview } from "@/app/(shop)/compte/avis/actions";
import styles from "./ReviewForm.module.css";

const LABELS = ["", "Décevant", "Moyen", "Correct", "Très bien", "Excellent"];

/** Notation par étoiles et commentaire, pour un produit déjà acheté. */
export default function ReviewForm({ product, existing }) {
  const [state, action, pending] = useActionState(submitReview, null);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  if (state?.ok) {
    return <p className={styles.done}>{state.ok}</p>;
  }

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="product_id" value={product.id} />
      <input type="hidden" name="rating" value={rating} />
      {state?.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.starsRow}>
        <div className={styles.stars} role="radiogroup" aria-label={`Note pour ${product.name}`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              className={styles.star}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
            >
              <Star size={26} fill={n <= shown ? "currentColor" : "none"} strokeWidth={1.75} />
            </button>
          ))}
        </div>
        <span className={styles.label}>{LABELS[shown]}</span>
      </div>

      <label className={styles.field}>
        <span>Ton commentaire (facultatif)</span>
        <textarea name="comment" rows={3} defaultValue={existing?.comment ?? ""} placeholder="Qu'as-tu pensé de l'appareil et du service ?" />
      </label>

      <Button type="submit" variant="secondary" disabled={pending || rating === 0}>
        {pending ? "Envoi…" : existing ? "Modifier mon avis" : "Publier mon avis"}
      </Button>
    </form>
  );
}
