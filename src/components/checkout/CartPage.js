"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Smartphone, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { formatFCFA } from "@/lib/format";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { lines, count, subtotal, setQty, ready } = useCart();

  if (!ready) return <div className={styles.loading} aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>
          <ShoppingBag size={40} strokeWidth={1.5} aria-hidden />
        </span>
        <h1>Ton panier est vide</h1>
        <p>Découvre nos téléphones garantis en boutique et payables à crédit.</p>
        <Button href="/categories/smartphones" size="lg">
          Découvrir le catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <section aria-labelledby="cart-title">
        <h1 id="cart-title" className={styles.title}>
          Mon panier <span>({count} article{count > 1 ? "s" : ""})</span>
        </h1>
        <ul className={styles.lines}>
          {lines.map(({ key, id, qty, max, name, label, color, price, condition, image }) => (
            <li key={key} className={styles.line}>
              <Link href={`/produit/${id}`} className={styles.thumb} aria-hidden tabIndex={-1}>
                {image ? (
                  <Image src={image} alt="" fill sizes="140px" className={styles.thumbImg} />
                ) : (
                  <Smartphone size={40} strokeWidth={1} />
                )}
              </Link>
              <div className={styles.info}>
                <Link href={`/produit/${id}`} className={styles.name}>
                  {name}
                </Link>
                <p className={styles.variant}>{[label, color, condition].filter(Boolean).join(" · ")}</p>
                <div className={styles.controls}>
                  <div className={styles.qty}>
                    <button type="button" onClick={() => setQty(key, qty - 1)} aria-label="Retirer un article">
                      <Minus size={16} />
                    </button>
                    <span aria-live="polite">{qty}</span>
                    <button type="button" onClick={() => setQty(key, qty + 1)} disabled={qty >= max} aria-label="Ajouter un article">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button type="button" className={styles.remove} onClick={() => setQty(key, 0)}>
                    <Trash2 size={16} aria-hidden /> Retirer
                  </button>
                </div>
                {qty >= max && max < 5 && <p className={styles.maxNote}>Stock maximum atteint</p>}
              </div>
              <p className={styles.lineTotal}>{formatFCFA(price * qty)}</p>
            </li>
          ))}
        </ul>
        <Link href="/categories/smartphones" className={styles.continue}>
          ← Continuer mes achats
        </Link>
      </section>

      <aside className={styles.summary} aria-label="Récapitulatif">
        <h2>Récapitulatif</h2>
        <dl>
          <div>
            <dt>Sous-total</dt>
            <dd>{formatFCFA(subtotal)}</dd>
          </div>
        </dl>
        <div className={styles.total}>
          <span>Total</span>
          <strong>{formatFCFA(subtotal)}</strong>
        </div>
        <Button href="/commande" size="lg" block>
          Passer la commande <ArrowRight size={18} aria-hidden />
        </Button>
        <ul className={styles.trust}>
          <li>
            <MessageCircle size={16} aria-hidden /> Commande finalisée avec un conseiller sur WhatsApp
          </li>
          <li>
            <ShieldCheck size={16} aria-hidden /> Paiement MoMo, Orange Money ou cash à la remise
          </li>
        </ul>
      </aside>
    </div>
  );
}
