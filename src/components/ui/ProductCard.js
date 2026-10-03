import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import Badge from "./Badge";
import ProductVisual from "./ProductVisual";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatFCFA } from "@/lib/format";
import { creditPlan } from "@/lib/credit";
import { cartSnapshot, defaultVariant, discountPct, hasPriceRange, isSimple, totalStock } from "@/lib/catalog";
import styles from "./ProductCard.module.css";

// « 256 Go · Double SIM » → « 256 Go » : le reste se choisit sur la fiche produit.
const storageOf = (variant) => variant.storage?.split(" · ")[0] ?? null;

export default function ProductCard({ product }) {
  const { id, name, brand, brandName, condition, imageUrl, rating, reviewCount, colors } = product;
  const v = defaultVariant(product);
  const discount = discountPct(v);
  const { monthly, months } = creditPlan(v.price);
  const soldOut = totalStock(product) === 0;
  const storage = storageOf(v);
  const href = `/produit/${id}`;

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden>
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className={styles.img} />
        ) : (
          <ProductVisual name={name} brand={brand} size="sm" />
        )}
        <div className={styles.tags}>
          {discount > 0 && <span className={styles.promo}>Promo</span>}
          {condition !== "Neuf" && (
            <Badge variant={condition === "Occasion" ? "neutral" : "success-soft"}>{condition}</Badge>
          )}
          {soldOut && <Badge variant="neutral">Rupture</Badge>}
        </div>
        {colors.length > 1 && (
          <div className={styles.swatches}>
            {colors.slice(0, 4).map((c) => (
              <span key={c.name} style={{ background: c.hex }} />
            ))}
          </div>
        )}
      </Link>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link href={href}>
            {name}
            {storage && <span className={styles.storage}> {storage}</span>}
          </Link>
        </h3>
        <p className={styles.brand}>{brandName}</p>

        <p className={styles.trust}>
          {reviewCount > 0 ? (
            <span className={styles.rating} aria-label={`Note ${rating.toFixed(1)} sur 5, ${reviewCount} avis`}>
              <span className={styles.stars} aria-hidden>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={13} strokeWidth={0} fill={n <= Math.round(rating) ? "currentColor" : "var(--n-200)"} />
                ))}
              </span>
              <span aria-hidden>({reviewCount})</span>
            </span>
          ) : null}
        </p>

        <div className={styles.buy}>
          <p className={styles.prices}>
            <span className={styles.price}>
              {hasPriceRange(product) && <span className={styles.from}>dès </span>}
              {formatFCFA(v.price)}
            </span>
            {v.oldPrice && (
              <span className={styles.was}>
                <s>{formatFCFA(v.oldPrice)}</s>
                {discount > 0 && <span className={styles.off}>-{discount} %</span>}
              </span>
            )}
          </p>
          {!soldOut &&
            (isSimple(product) ? (
              <AddToCartButton snapshot={cartSnapshot(product, v, colors[0]?.name)} />
            ) : (
              <Link href={href} className={styles.choose} aria-label={`Choisir les options de ${name}`} title="Choisir">
                <ArrowRight size={18} strokeWidth={2.25} />
              </Link>
            ))}
        </div>

        {v.price >= 50000 && (
          <p className={styles.credit}>
            ou {months} × {formatFCFA(monthly)} à crédit
          </p>
        )}
      </div>
    </article>
  );
}
