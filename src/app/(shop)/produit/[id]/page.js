import { notFound } from "next/navigation";
import { Check, Star } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductCard from "@/components/ui/ProductCard";
import ProductView from "@/components/product/ProductView";
import { defaultVariant, totalStock } from "@/lib/catalog";
import { getCategories, getProductBySlug, getProducts } from "@/lib/data/catalog";
import styles from "./product.module.css";

const dateFr = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" });

export async function generateMetadata({ params }) {
  const product = await getProductBySlug((await params).id);
  if (!product) return {};
  const v = defaultVariant(product);
  return {
    title: `${product.name} ${v.storage ?? ""} - TechDouala`.replace(/\s+/g, " "),
    description: `${product.name} ${product.condition.toLowerCase()} à Douala. ${product.description}`,
  };
}

function Stars({ value, size = 16 }) {
  return (
    <span className={styles.stars} aria-label={`${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= Math.round(value) ? "currentColor" : "none"} aria-hidden />
      ))}
    </span>
  );
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) notFound();

  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const category = categories.find((c) => c.slug === product.category);
  const similar = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const prices = product.variants.map((v) => v.price);

  // Données structurées pour Google (fiche produit enrichie).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brandName },
    ...(product.imageUrl && { image: product.images }),
    description: product.description,
    itemCondition: `https://schema.org/${{ Neuf: "NewCondition", Reconditionné: "RefurbishedCondition" }[product.condition] ?? "UsedCondition"}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "XAF",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      availability: totalStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
    }),
  };

  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Breadcrumb
        items={[
          { label: category?.name ?? "Catalogue", href: category ? `/categories/${category.slug}` : "/categories" },
          { label: product.name },
        ]}
      />

      <ProductView product={product} />

      <div className={styles.details}>
        <section className={styles.panel} aria-labelledby="desc-title">
          <h2 id="desc-title">{product.highlights.length ? "Points forts" : "Description"}</h2>
          {product.highlights.length > 0 && (
            <ul className={styles.highlights}>
              {product.highlights.map((h) => (
                <li key={h}>
                  <Check size={18} aria-hidden /> {h}
                </li>
              ))}
            </ul>
          )}
          <p className={product.highlights.length ? styles.description : undefined}>{product.description}</p>
        </section>

        <section className={styles.panel} aria-labelledby="specs-title">
          <h2 id="specs-title">Caractéristiques</h2>
          <dl className={styles.specs}>
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div>
              <dt>Garantie</dt>
              <dd>{product.warrantyMonths} mois, en boutique</dd>
            </div>
          </dl>
        </section>
      </div>

      <section id="avis" className={styles.reviews} aria-labelledby="reviews-title">
        <div className={styles.reviewsHead}>
          <h2 id="reviews-title">Avis clients</h2>
          {product.reviewCount > 0 && (
            <div className={styles.score}>
              <strong>{product.rating.toFixed(1)}</strong>
              <div>
                <Stars value={product.rating} />
                <p>{product.reviewCount} avis vérifiés</p>
              </div>
            </div>
          )}
        </div>
        {product.reviews.length > 0 ? (
          <ul className={styles.reviewList}>
            {product.reviews.map((r) => (
              <li key={`${r.author}-${r.date}`} className={styles.review}>
                <Stars value={r.rating} size={14} />
                <p className={styles.reviewText}>{r.text}</p>
                <p className={styles.reviewMeta}>
                  {r.author} · Achat vérifié · {dateFr.format(new Date(r.date))}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noReviews}>
            Seuls les clients qui ont acheté ce produit peuvent laisser un avis. Sois le premier.
          </p>
        )}
      </section>

      {similar.length > 0 && (
        <section className={styles.similar} aria-labelledby="similar-title">
          <h2 id="similar-title">Tu aimeras aussi</h2>
          <div className={styles.similarGrid}>
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
