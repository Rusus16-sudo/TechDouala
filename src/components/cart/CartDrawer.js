"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Smartphone, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCart } from "./CartProvider";
import { formatFCFA } from "@/lib/format";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const { lines, subtotal, count, setQty, open, setOpen } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.show : ""}`} onClick={() => setOpen(false)} aria-hidden />
      <aside
        className={`${styles.drawer} ${open ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        aria-hidden={!open}
        inert={!open}
      >
        <header className={styles.head}>
          <h2>Mon panier {count > 0 && <span className={styles.count}>({count})</span>}</h2>
          <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Fermer le panier">
            <X size={22} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={48} strokeWidth={1.25} aria-hidden />
            <p className={styles.emptyTitle}>Ton panier est vide</p>
            <p>Découvre nos téléphones garantis en boutique.</p>
            <Button href="/categories/smartphones" onClick={() => setOpen(false)} className={styles.emptyCta}>
              Découvrir le catalogue
            </Button>
          </div>
        ) : (
          <>
            <ul className={styles.lines}>
              {lines.map(({ key, id, qty, max, name, label, color, price, image }) => (
                <li key={key} className={styles.line}>
                  <div className={styles.thumb}>
                    {image ? (
                      <Image src={image} alt="" fill sizes="72px" className={styles.thumbImg} />
                    ) : (
                      <Smartphone size={28} strokeWidth={1.25} aria-hidden />
                    )}
                  </div>
                  <div className={styles.info}>
                    <Link href={`/produit/${id}`} onClick={() => setOpen(false)} className={styles.name}>
                      {name}
                    </Link>
                    <span className={styles.variant}>{[label, color].filter(Boolean).join(" · ")}</span>
                    <span className={styles.price}>{formatFCFA(price)}</span>
                    <div className={styles.qty}>
                      <button type="button" onClick={() => setQty(key, qty - 1)} aria-label="Retirer un article">
                        <Minus size={14} />
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button type="button" onClick={() => setQty(key, qty + 1)} disabled={qty >= max} aria-label="Ajouter un article">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className={styles.foot}>
              <div className={styles.total}>
                <span>Sous-total</span>
                <strong>{formatFCFA(subtotal)}</strong>
              </div>
              <p className={styles.note}>Paiement et remise se conviennent avec la boutique sur WhatsApp.</p>
              <Button block href="/panier" onClick={() => setOpen(false)}>
                Passer la commande
              </Button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
