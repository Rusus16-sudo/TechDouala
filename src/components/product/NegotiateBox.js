"use client";

import { useState } from "react";
import { Handshake, MessageCircle } from "lucide-react";
import { offerMessage, waLink } from "@/lib/whatsapp";
import { formatFCFA } from "@/lib/format";
import styles from "./NegotiateBox.module.css";

/**
 * Négociation de prix (cahier 5.3) : le client propose son prix, la discussion
 * se poursuit sur WhatsApp avec un message déjà rédigé.
 */
export default function NegotiateBox({ name, variant, price }) {
  const [open, setOpen] = useState(false);
  const [offer, setOffer] = useState("");

  const value = Number(offer.replace(/\D/g, "")) || 0;
  const url = (url) =>
    waLink(offerMessage({ name, variant, price, offer: value || null, url: typeof window !== "undefined" ? window.location.href : null }));

  if (!open) {
    return (
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        <Handshake size={18} aria-hidden /> Négocier le prix
      </button>
    );
  }

  return (
    <div className={styles.box}>
      <p className={styles.title}>Propose ton prix</p>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.srOnly}>Ton offre en FCFA</span>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            placeholder={String(Math.round((price * 0.9) / 1000) * 1000)}
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            autoFocus
          />
          <span className={styles.suffix}>FCFA</span>
        </label>
        <a href={url()} target="_blank" rel="noopener noreferrer" className={styles.send}>
          <MessageCircle size={18} aria-hidden /> Envoyer
        </a>
      </div>
      <p className={styles.hint}>
        {value > 0
          ? `Tu proposes ${formatFCFA(value)} au lieu de ${formatFCFA(price)}. La boutique te répond sur WhatsApp.`
          : "Laisse vide pour simplement demander si le prix est négociable."}
      </p>
    </div>
  );
}
