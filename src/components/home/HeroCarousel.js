"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductVisual from "@/components/ui/ProductVisual";
import { formatFCFA } from "@/lib/format";
import styles from "./HeroCarousel.module.css";

const DELAY = 6000;
const SWIPE = 50;

// Préférence « réduire les animations » du visiteur : pas de défilement automatique.
const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb) {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduced = () => window.matchMedia(reducedQuery).matches;

function lead(slide) {
  const state = slide.condition === "Neuf" ? "Neuf" : "Occasion contrôlée";
  const warranty = slide.warrantyMonths ? `garanti ${slide.warrantyMonths} mois` : "garanti";
  return `${state}, ${warranty} en boutique. Paie comptant, ou 40 % à la remise et le reste en 6 mois.`;
}

/** Hero de l'accueil : les téléphones à la une défilent, avec pause, flèches, points et glissement au doigt. */
export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
  const startX = useRef(null);

  const count = slides.length;
  const autoplay = count > 1 && playing && !reduced && !hovered && !focused;

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), DELAY);
    return () => clearInterval(id);
  }, [autoplay, count, index]);

  const go = (i) => setIndex((i + count) % count);

  // Catalogue vide : le hero reste textuel.
  if (count === 0) {
    return (
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={`${styles.slide} ${styles.active} ${styles.textOnly}`}>
            <div className={styles.text}>
              <h1 className={styles.title}>Ton prochain téléphone, à ton rythme.</h1>
              <p className={styles.lead}>
                Neufs ou d&apos;occasion, garantis en boutique. Paie comptant ou à crédit 40/60.
              </p>
              <div className={styles.ctas}>
                <Button variant="light" size="lg" href="/categories/smartphones">
                  Voir les smartphones
                </Button>
                <Button variant="outline-light" size="lg" href="/credit">
                  Acheter à crédit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.hero}
      aria-roledescription="carrousel"
      aria-label="Téléphones à la une"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onPointerDown={(e) => {
        startX.current = e.pointerType === "mouse" ? null : e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null || count < 2) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > SWIPE) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <h1 className={styles.srOnly}>TechDouala : téléphones garantis à Douala</h1>

      <div className={styles.container}>
        <div className={styles.stage} aria-live={autoplay ? "off" : "polite"}>
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <div
                key={s.id}
                className={`${styles.slide} ${active ? styles.active : ""}`}
                role="group"
                aria-roledescription="diapositive"
                aria-label={`${i + 1} sur ${count} : ${s.name}`}
                aria-hidden={!active}
                inert={!active}
              >
                <div className={styles.text}>
                  <h2 className={styles.title}>{s.name}</h2>
                  <p className={styles.lead}>{lead(s)}</p>
                  <p className={styles.price}>
                    {s.fromPrice ? "À partir de " : ""}
                    {formatFCFA(s.price)}
                    <span>
                      ou {formatFCFA(s.downPayment)} puis 6 × {formatFCFA(s.monthly)}
                    </span>
                  </p>
                  <div className={styles.ctas}>
                    <Button variant="light" size="lg" href={`/produit/${s.id}`}>
                      Découvrir
                    </Button>
                    <Button variant="outline-light" size="lg" href="/credit">
                      Acheter à crédit
                    </Button>
                  </div>
                </div>

                <Link href={`/produit/${s.id}`} className={styles.media} tabIndex={-1} aria-hidden>
                  {s.imageUrl ? (
                    <Image
                      src={s.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 90vw, 520px"
                      className={styles.photo}
                      preload={i === 0}
                    />
                  ) : (
                    <ProductVisual name={s.name} brand={s.brand} size="lg" />
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <div className={styles.controls}>
            <button type="button" className={styles.round} onClick={() => go(index - 1)} aria-label="Téléphone précédent">
              <ChevronLeft size={18} aria-hidden />
            </button>
            <ul className={styles.dots}>
              {slides.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={styles.dot}
                    onClick={() => go(i)}
                    aria-label={`Afficher ${s.name}`}
                    aria-current={i === index ? "true" : undefined}
                  />
                </li>
              ))}
            </ul>
            <button type="button" className={styles.round} onClick={() => go(index + 1)} aria-label="Téléphone suivant">
              <ChevronRight size={18} aria-hidden />
            </button>
            {!reduced && (
              <button
                type="button"
                className={styles.round}
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Mettre le défilement en pause" : "Reprendre le défilement"}
              >
                {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
