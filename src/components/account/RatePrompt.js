import Image from "next/image";
import { Smartphone, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./RatePrompt.module.css";

const firstPhoto = (product) => [...(product?.images ?? [])].sort((a, b) => a.position - b.position)[0]?.url ?? null;

/** Produits reçus (lignes de commandes remises) qui n'ont pas encore d'avis de ce client, sans doublon. */
export function productsToRate(items, reviews) {
  const done = new Set((reviews ?? []).map((r) => r.product_id));
  const list = new Map();
  for (const i of items ?? []) {
    if (!done.has(i.product_id) && !list.has(i.product_id)) {
      list.set(i.product_id, { id: i.product_id, name: i.product_name, image: firstPhoto(i.product) });
    }
  }
  return [...list.values()];
}

/**
 * Invitation à noter les produits reçus (commande remise, pas encore d'avis).
 * `products` : [{ id, name, image }] ; un seul produit → le bouton ouvre directement son formulaire.
 */
export default function RatePrompt({ products }) {
  if (!products.length) return null;
  const one = products.length === 1 ? products[0] : null;

  return (
    <section className={styles.prompt} aria-labelledby="rate-title">
      <div className={styles.thumbs} aria-hidden>
        {products.slice(0, 3).map((p) => (
          <span key={p.id} className={styles.thumb}>
            {p.image ? (
              <Image src={p.image} alt="" fill sizes="64px" className={styles.thumbImg} />
            ) : (
              <Smartphone size={24} strokeWidth={1.25} />
            )}
          </span>
        ))}
      </div>
      <p className={styles.stars} aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={18} strokeWidth={0} fill="currentColor" />
        ))}
      </p>
      <h2 id="rate-title" className={styles.title}>
        {one ? "Note ton achat" : `${products.length} achats à noter`}
      </h2>
      <p className={styles.text}>
        {one ? <>Ton avis sur {one.name} aide les prochains clients à choisir.</> : "Tes avis aident les prochains clients à choisir."}{" "}
        Ça prend moins d&apos;une minute.
      </p>
      <Button href={one ? `/compte/avis#p-${one.id}` : "/compte/avis"} block>
        {one ? "Noter ce produit" : "Noter mes achats"}
      </Button>
    </section>
  );
}
