"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatFCFA } from "@/lib/format";
import styles from "./HomeHero.module.css";

// Assez de marques par groupe pour couvrir un grand écran ; deux groupes identiques font la boucle.
const MIN_PER_GROUP = 12;

function repeatTo(list, min) {
  if (!list.length) return [];
  const out = [];
  while (out.length < min) out.push(...list);
  return out;
}

/**
 * Hero de l'accueil : texte centré, les téléphones à la une en éventail devant un halo violet
 * qui suit la souris, et le défilé des marques en pied de bandeau.
 * `phones` : [{ id, name, imageUrl, price, fromPrice }] (photos détourées, 3 au plus)
 * `brands` : [{ slug, name }]
 */
export default function HomeHero({ phones, brands }) {
  const ref = useRef(null);
  const [lead] = phones;
  const marquee = repeatTo(brands, MIN_PER_GROUP);

  // Le halo se décale vers la souris, d'un tiers de l'écart seulement : il accompagne sans suivre.
  function onPointerMove(e) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) / 3}px`);
    el.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) / 3}px`);
  }

  function onPointerLeave() {
    ref.current.style.setProperty("--mx", "0px");
    ref.current.style.setProperty("--my", "0px");
  }

  return (
    <section ref={ref} className={styles.hero} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <span className={styles.glow} aria-hidden />

      <div className={styles.body}>
        <p className={`${styles.eyebrow} ${styles.rise}`}>TechDouala · Douala</p>
        <h1 className={`${styles.title} ${styles.rise}`} style={{ "--d": "120ms" }}>
          Le bon téléphone. <span>À ton rythme.</span>
        </h1>
        <p className={`${styles.lead} ${styles.rise}`} style={{ "--d": "240ms" }}>
          Neufs ou d&apos;occasion contrôlée, garantis en boutique. Paie comptant, ou 40 % aujourd&apos;hui et le
          reste en 6 mois.
        </p>
        <div className={`${styles.ctas} ${styles.rise}`} style={{ "--d": "360ms" }}>
          <Link href="/categories/smartphones" className={styles.ctaMain}>
            Voir les smartphones
          </Link>
          <Link href="/credit" className={styles.ctaGhost}>
            Acheter à crédit <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {phones.length > 0 && (
        <>
          <div className={styles.stage}>
            {phones.map((p, i) => (
              <Link
                key={p.id}
                href={`/produit/${p.id}`}
                className={`${styles.phone} ${styles[`p${i}`]}`}
                tabIndex={-1}
                aria-hidden
              >
                <Image
                  src={p.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 320px"
                  className={styles.shot}
                  preload={i === 0}
                />
              </Link>
            ))}
            <span className={styles.floor} aria-hidden />
          </div>

          <Link href={`/produit/${lead.id}`} className={`${styles.caption} ${styles.rise}`} style={{ "--d": "900ms" }}>
            <strong>{lead.name}</strong>
            <span>
              {lead.fromPrice ? "dès " : ""}
              {formatFCFA(lead.price)}
            </span>
            <span aria-hidden>→</span>
          </Link>
        </>
      )}

      {marquee.length > 0 && (
        <nav className={`${styles.marquee} ${styles.rise}`} style={{ "--d": "600ms" }} aria-label="Nos marques">
          <div className={styles.track}>
            {[0, 1].map((copy) => (
              <ul key={copy} className={styles.group} aria-hidden={copy === 1 || undefined}>
                {marquee.map((b, i) => (
                  <li key={`${b.slug}-${i}`} aria-hidden={i >= brands.length || undefined}>
                    <Link href={`/marques/${b.slug}`} tabIndex={copy === 1 || i >= brands.length ? -1 : undefined}>
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </nav>
      )}
    </section>
  );
}
