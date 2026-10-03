"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
import styles from "./AddToCartButton.module.css";

/** Petit bouton panier des cartes produit (produits à une seule combinaison). */
export default function AddToCartButton({ snapshot, label = "Ajouter au panier" }) {
  const { add } = useCart();
  return (
    <button type="button" className={styles.btn} onClick={() => add(snapshot)} aria-label={label} title={label}>
      <ShoppingBag size={18} strokeWidth={2.25} aria-hidden />
    </button>
  );
}
