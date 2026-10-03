"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { formatFCFA } from "@/lib/format";
import styles from "./CreditShowcase.module.css";

/**
 * Le crédit 40/60 mis en scène sur l'accueil : on choisit un vrai téléphone du catalogue et
 * l'échéancier se recalcule (un bloc « aujourd'hui » de 40 %, puis un bloc par mensualité).
 * `phones` : [{ id, name, imageUrl, price, downPayment, monthly, months }]
 */
export default function CreditShowcase({ phones, others }) {
  const [index, setIndex] = useState(0);
  const phone = phones[index];
  if (!phone) return null;

  return (
    <section className={styles.band} aria-labelledby="credit-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="credit-title" className={styles.title}>
            Pars avec ton téléphone pour 40 % du prix.
          </h2>
          <p className={styles.lead}>
            Le reste en {phone.months} mensualités égales, sans pénalité ni frais de dossier.
          </p>

          {phones.length > 1 && (
            <div className={styles.picker} role="radiogroup" aria-label="Choisir un téléphone">
              {phones.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={i === index}
                  className={`${styles.chip} ${i === index ? styles.chipOn : ""}`}
                  onClick={() => setIndex(i)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Échéancier : 40 % aujourd'hui, puis une case par mois */}
          <div className={styles.schedule} key={phone.id}>
            <div className={styles.bar} aria-hidden>
              <span className={styles.today} />
              {Array.from({ length: phone.months }, (_, i) => (
                <span key={i} className={styles.month} style={{ animationDelay: `${120 + i * 50}ms` }} />
              ))}
            </div>
            <dl className={styles.amounts}>
              <div>
                <dt>Aujourd&apos;hui</dt>
                <dd>{formatFCFA(phone.downPayment)}</dd>
              </div>
              <div className={styles.later}>
                <dt>Puis chaque mois, pendant {phone.months} mois</dt>
                <dd>{formatFCFA(phone.monthly)}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.ctas}>
            <Button href={`/produit/${phone.id}`} variant="light">
              Voir ce téléphone
            </Button>
            <Link href="/credit" className={styles.how}>
              Comment marche le crédit 40/60
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <Image
            key={phone.id}
            src={phone.imageUrl}
            alt={phone.name}
            fill
            sizes="(max-width: 900px) 90vw, 520px"
            className={styles.photo}
          />
          <p className={styles.price}>
            {formatFCFA(phone.price)} <span>comptant</span>
          </p>
        </div>
      </div>

      {others.length > 0 && (
        <ul className={styles.others}>
          {others.map((o) => (
            <li key={o.title}>
              <Link href={o.href}>
                <strong>{o.title}</strong>
                <span>{o.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
