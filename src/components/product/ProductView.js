"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown, MessageCircle, Repeat, Share2, ShieldCheck, Star, Wallet,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import ProductVisual from "@/components/ui/ProductVisual";
import NegotiateBox from "./NegotiateBox";
import Button from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { cartSnapshot, defaultVariant, discountPct } from "@/lib/catalog";
import { creditPlan } from "@/lib/credit";
import { formatFCFA } from "@/lib/format";
import { productMessage, waLink } from "@/lib/whatsapp";
import styles from "./ProductView.module.css";

function StockLine({ stock }) {
  if (stock === 0) return <p className={`${styles.stock} ${styles.out}`}>Rupture de stock</p>;
  if (stock <= 3) return <p className={`${styles.stock} ${styles.low}`}>Plus que {stock} en stock</p>;
  return <p className={`${styles.stock} ${styles.in}`}>En stock</p>;
}

/** Haut de la fiche produit : galerie + bloc d'achat (options, prix, crédit, actions). */
export default function ProductView({ product }) {
  const router = useRouter();
  const { add } = useCart();
  const [variant, setVariant] = useState(() => defaultVariant(product));
  const [color, setColor] = useState(product.colors[0] ?? null);
  const [shared, setShared] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const discount = discountPct(variant);
  const plan = creditPlan(variant.price);
  const soldOut = variant.stock === 0;
  const item = cartSnapshot(product, variant, color?.name);
  const images = product.images ?? [];
  const label = [product.name, variant.storage, color?.name].filter(Boolean).join(" · ");

  function buyNow() {
    add(item, { openDrawer: false });
    router.push("/panier");
  }

  async function share() {
    const data = { title: `${label} - TechDouala`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {}
  }

  return (
    <>
      <div className={styles.top}>
        {/* Galerie */}
        <div className={styles.galleryCol}>
          <div className={styles.gallery}>
            {images.length > 0 ? (
              <Image
                src={images[imageIndex] ?? images[0]}
                alt={label}
                fill
                preload
                sizes="(max-width: 900px) 100vw, 55vw"
                className={styles.photo}
              />
            ) : (
              <ProductVisual name={product.name} brand={product.brand} size="lg" />
            )}
            <div className={styles.galleryTags}>
              {discount > 0 && <Badge variant="danger">-{discount} %</Badge>}
              {product.condition !== "Neuf" && (
                <Badge variant={product.condition === "Occasion" ? "neutral" : "success-soft"}>{product.condition}</Badge>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={`${styles.thumb} ${i === imageIndex ? styles.thumbActive : ""}`}
                  onClick={() => setImageIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                >
                  <Image src={src} alt="" fill sizes="80px" className={styles.photo} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bloc d'achat */}
        <div className={styles.buyCol}>
          <div className={styles.buybox}>
            <div className={styles.titleRow}>
              <Link href={`/marques/${product.brand}`} className={styles.brand}>
                {product.brandName}
              </Link>
              <button type="button" className={styles.iconBtn} onClick={share} aria-label="Partager ce produit">
                <Share2 size={18} />
              </button>
            </div>
            {shared && (
              <p className={styles.toast} role="status">
                Lien copié !
              </p>
            )}
            <h1 className={styles.name}>{product.name}</h1>

            <div className={styles.metaRow}>
              {product.reviewCount > 0 && (
                <a href="#avis" className={styles.rating}>
                  <Star size={16} fill="currentColor" aria-hidden />
                  <strong>{product.rating.toFixed(1)}</strong>
                  <span>({product.reviewCount} avis)</span>
                </a>
              )}
              <span className={styles.meta}>{product.condition}</span>
              <span className={styles.meta}>
                <ShieldCheck size={16} aria-hidden /> Garantie {product.warrantyMonths} mois
              </span>
              <StockLine stock={variant.stock} />
            </div>

            <div className={styles.priceRow}>
              <p className={styles.price}>{formatFCFA(variant.price)}</p>
              {variant.oldPrice && (
                <>
                  <s className={styles.oldPrice}>{formatFCFA(variant.oldPrice)}</s>
                  <Badge variant="danger">-{discount} %</Badge>
                  <span className={styles.save}>Tu économises {formatFCFA(variant.oldPrice - variant.price)}</span>
                </>
              )}
            </div>

            {variant.price >= 50000 && (
              <details className={styles.credit}>
                <summary>
                  <span>
                    ou <strong>{formatFCFA(plan.downPayment)}</strong> aujourd&apos;hui, puis {plan.months} ×{" "}
                    <strong>{formatFCFA(plan.monthly)}</strong>
                  </span>
                  <ChevronDown size={18} aria-hidden className={styles.chev} />
                </summary>
                <ol className={styles.schedule}>
                  <li>
                    <span>Acompte (40 %) à l&apos;achat</span>
                    <strong>{formatFCFA(plan.downPayment)}</strong>
                  </li>
                  {Array.from({ length: plan.months }, (_, i) => (
                    <li key={i}>
                      <span>Mensualité {i + 1}</span>
                      <strong>{formatFCFA(plan.monthly)}</strong>
                    </li>
                  ))}
                  <li className={styles.scheduleTotal}>
                    <span>Total</span>
                    <strong>{formatFCFA(variant.price)}</strong>
                  </li>
                </ol>
                <p className={styles.creditNote}>
                  Sans pénalité ni frais cachés. Un compte TechDouala est nécessaire pour acheter à crédit.
                </p>
              </details>
            )}

            {product.colors.length > 0 && (
              <fieldset className={styles.option}>
                <legend>
                  Couleur : <strong>{color?.name}</strong>
                </legend>
                <div className={styles.swatches}>
                  {product.colors.map((c) => (
                    <label key={c.name} className={styles.swatch} title={c.name}>
                      <input
                        type="radio"
                        name="couleur"
                        value={c.name}
                        checked={color?.name === c.name}
                        onChange={() => setColor(c)}
                      />
                      <span style={{ background: c.hex }} aria-hidden />
                      <span className={styles.srOnly}>{c.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {product.variants.length > 1 && (
              <fieldset className={styles.option}>
                <legend>{product.category === "montres-connectees" ? "Taille" : "Version"}</legend>
                <div className={styles.pills}>
                  {product.variants.map((v) => (
                    <label key={v.sku} className={`${styles.pill} ${v.stock === 0 ? styles.pillOut : ""}`}>
                      <input
                        type="radio"
                        name="variante"
                        value={v.sku}
                        checked={variant.sku === v.sku}
                        onChange={() => setVariant(v)}
                      />
                      <span className={styles.pillBody}>
                        <strong>{v.storage}</strong>
                        <span>{v.stock === 0 ? "Épuisé" : formatFCFA(v.price)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className={styles.ctas}>
              <Button size="lg" block disabled={soldOut} onClick={() => add(item)}>
                Ajouter au panier
              </Button>
              <Button size="lg" variant="secondary" block disabled={soldOut} onClick={buyNow}>
                Acheter maintenant
              </Button>
            </div>
            <div className={styles.ctasAlt}>
              <NegotiateBox name={product.name} variant={variant.storage} price={variant.price} />
              <a
                href={waLink(productMessage({ name: product.name, variant: variant.storage, price: variant.price }))}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.altLink}
              >
                <MessageCircle size={18} aria-hidden /> Poser une question
              </a>
            </div>

            <ul className={styles.services}>
              <li>
                <MessageCircle size={18} aria-hidden />
                <div>
                  <strong>Commande sur WhatsApp</strong>
                  <span>Un conseiller confirme tout avec toi</span>
                </div>
              </li>
              <li>
                <Wallet size={18} aria-hidden />
                <div>
                  <strong>Payer à la remise</strong>
                  <span>Cash, MTN MoMo ou Orange Money</span>
                </div>
              </li>
              <li>
                <ShieldCheck size={18} aria-hidden />
                <div>
                  <strong>Garantie {product.warrantyMonths} mois</strong>
                  <span>Appareil vérifié avant la vente</span>
                </div>
              </li>
              <li>
                <Repeat size={18} aria-hidden />
                <div>
                  <strong>Reprise acceptée</strong>
                  <span>
                    <Link href={`/reprise?pour=${encodeURIComponent(product.name)}`}>Estime ton ancien téléphone</Link>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barre d'achat collante sur mobile */}
      <div className={styles.sticky} data-sticky-buy>
        <div>
          <p className={styles.stickyName}>{label}</p>
          <p className={styles.stickyPrice}>{formatFCFA(variant.price)}</p>
        </div>
        <Button disabled={soldOut} onClick={() => add(item)}>
          {soldOut ? "Épuisé" : "Ajouter"}
        </Button>
      </div>
    </>
  );
}
