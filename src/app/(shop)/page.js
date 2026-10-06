import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import Countdown from "@/components/home/Countdown";
import CreditShowcase from "@/components/home/CreditShowcase";
import HomeHero from "@/components/home/HomeHero";
import ScrollReveal from "@/components/home/ScrollReveal";
import { categoryIcon, defaultVariant, hasPriceRange } from "@/lib/catalog";
import { getActiveBrands, getCategories, getHomeReviews, getNews, getProducts } from "@/lib/data/catalog";
import { creditPlan } from "@/lib/credit";
import { whatsappLink } from "@/lib/store";
import styles from "./home.module.css";

// Le parcours d'achat, sans livraison ni paiement en ligne : tout se conclut avec un conseiller.
const STEPS = [
  {
    title: "Choisis en ligne",
    text: "Compare les modèles, les états et les garanties, puis valide ton panier.",
  },
  {
    title: "Confirme sur WhatsApp",
    text: "Un conseiller vérifie la disponibilité avec toi et répond à tes questions.",
  },
  {
    title: "Repars avec en boutique",
    text: "Paie à la remise en cash, MTN MoMo ou Orange Money. Garantie et SAV sur place, à Douala.",
  },
];

// Atouts affichés sous l'échéancier du crédit 40/60.
const OTHERS = [
  { title: "Prix négociable", text: "Propose ton prix depuis la fiche produit.", href: "/categories/smartphones" },
  { title: "Reprise de ton ancien téléphone", text: "Sa valeur est déduite de ton achat.", href: "/reprise" },
  { title: "Occasions contrôlées", text: "Testées et garanties en boutique.", href: "/reconditionnes" },
];

/** En-tête de tuile : petite accroche violette, grand titre, lien « voir tout ». */
function TileHead({ eyebrow, title, href, linkLabel = "Voir tout", id, children }) {
  return (
    <header className={styles.head} data-reveal>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 id={id} className={styles.display}>
        {title}
      </h2>
      {children}
      {href && (
        <Link href={href} className={styles.more}>
          {linkLabel} <span aria-hidden>→</span>
        </Link>
      )}
    </header>
  );
}

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export default async function Home() {
  const [products, categories, brands, news, reviews] = await Promise.all([
    getProducts(),
    getCategories(),
    getActiveBrands(),
    getNews(),
    getHomeReviews(),
  ]);

  const inStock = (p) => defaultVariant(p).stock > 0;
  const flash = products.filter((p) => p.flash && inStock(p));
  const promos = (flash.length ? flash : products.filter((p) => defaultVariant(p).oldPrice && inStock(p))).slice(0, 4);
  const featured = (products.some((p) => p.featured) ? products.filter((p) => p.featured) : products).slice(0, 4);
  const newsCards = news.filter((n) => n.placement === "accueil").slice(0, 3);

  // Téléphones à la une, en stock et avec photo : les coups de cœur d'abord.
  const spotlight = products
    .filter((p) => p.imageUrl && inStock(p) && defaultVariant(p).price >= 50000)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 4)
    .map((p) => {
      const v = defaultVariant(p);
      return { id: p.id, name: p.name, imageUrl: p.imageUrl, price: v.price, fromPrice: hasPriceRange(p), ...creditPlan(v.price) };
    });
  const heroPhones = spotlight.slice(0, 3);

  // Tuile de chaque rayon : la photo d'un de ses produits, sinon son pictogramme.
  const universes = categories.map((c) => ({
    ...c,
    image: products.find((p) => p.category === c.slug && p.imageUrl)?.imageUrl ?? null,
  }));

  // Bloc conseil : trois photos du catalogue.
  const collage = products.filter((p) => p.imageUrl).slice(0, 3);

  return (
    <div className={styles.home}>
      <ScrollReveal />

      <HomeHero phones={heroPhones} brands={brands.filter((b) => b.slug !== "autre")} />

      {/* Parcours d'achat */}
      <section className={`${styles.tile} ${styles.light}`} aria-labelledby="steps-title">
        <div className={styles.container}>
          <TileHead id="steps-title" eyebrow="Simple comme un message" title="Choisis. Confirme. Repars avec." />
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.title} data-reveal style={{ "--i": i }}>
                <span className={styles.stepNum} aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div className={styles.center} data-reveal>
            <Button href="/categories/smartphones" size="lg" className={styles.pill}>
              Voir les smartphones
            </Button>
          </div>
        </div>
      </section>

      {/* Nos rayons */}
      {universes.length > 0 && (
        <section className={`${styles.tile} ${styles.parchment}`} aria-labelledby="universes-title">
          <div className={styles.container}>
            <TileHead
              id="universes-title"
              eyebrow="Nos rayons"
              title="Tout ce qu'il faut, au même endroit."
              href="/categories"
              linkLabel="Toutes les catégories"
            />
            <ul className={styles.universes}>
              {universes.map(({ slug, name, image }, i) => {
                const Icon = categoryIcon(slug);
                return (
                  <li key={slug} data-reveal="drop" style={{ "--i": i }}>
                    <Link href={`/categories/${slug}`} className={styles.universe}>
                      <span className={styles.universeMedia}>
                        {image ? (
                          <Image src={image} alt="" fill sizes="(max-width: 640px) 40vw, 240px" className={styles.universePhoto} />
                        ) : (
                          <Icon size={44} strokeWidth={1.25} aria-hidden />
                        )}
                      </span>
                      <span className={styles.universeName}>{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {products.length === 0 && (
        <section className={`${styles.tile} ${styles.light}`}>
          <div className={`${styles.container} ${styles.soon}`}>
            <h2 className={styles.display}>Le catalogue arrive très bientôt</h2>
            <p>Nos téléphones seront en ligne dans quelques jours. Écris-nous sur WhatsApp en attendant.</p>
          </div>
        </section>
      )}

      {/* Ventes flash, sinon promotions */}
      {promos.length > 0 && (
        <section className={`${styles.tile} ${styles.light}`} aria-labelledby="promos-title">
          <div className={styles.container}>
            <TileHead
              id="promos-title"
              eyebrow={flash.length ? "Ventes flash" : "Bons plans"}
              title={flash.length ? "Les prix baissent. Pas longtemps." : "Les meilleurs prix du moment."}
              href={flash.length ? "/ventes-flash" : "/bons-plans"}
              linkLabel="Voir toutes les promotions"
            >
              {flash.length > 0 && (
                <div className={styles.countdown}>
                  <Countdown />
                </div>
              )}
            </TileHead>
            <div className={styles.grid4}>
              {promos.map((p, i) => (
                <div key={p.id} data-reveal style={{ "--i": i }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Crédit 40/60 : échéancier calculé sur un vrai téléphone */}
      <CreditShowcase phones={spotlight} others={OTHERS} />

      {/* Coups de cœur */}
      {featured.length > 0 && (
        <section className={`${styles.tile} ${styles.light}`} aria-labelledby="featured-title">
          <div className={styles.container}>
            <TileHead
              id="featured-title"
              eyebrow="Les incontournables"
              title="Nos coups de cœur du moment."
              href="/categories/smartphones"
              linkLabel="Voir tous les produits"
            />
            <div className={styles.grid4}>
              {featured.map((p, i) => (
                <div key={p.id} data-reveal style={{ "--i": i }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Actualités */}
      {newsCards.length > 0 && (
        <section className={`${styles.tile} ${styles.parchment}`} aria-labelledby="news-title">
          <div className={styles.container}>
            <TileHead id="news-title" eyebrow="Actualités" title="Quoi de neuf en boutique." />
            <div className={styles.news}>
              {newsCards.map((n, i) => {
                const inner = (
                  <>
                    {n.image_url && (
                      <div className={styles.newsImg}>
                        <Image src={n.image_url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.newsBackdrop} />
                        <Image src={n.image_url} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.newsPhoto} />
                      </div>
                    )}
                    <div className={styles.newsBody}>
                      <h3>{n.title}</h3>
                      {n.body && <p>{n.body}</p>}
                      {n.cta_label && <span className={styles.newsCta}>{n.cta_label} →</span>}
                    </div>
                  </>
                );
                return n.cta_href ? (
                  <Link key={n.id} href={n.cta_href} className={styles.newsCard} data-reveal style={{ "--i": i }}>
                    {inner}
                  </Link>
                ) : (
                  <article key={n.id} className={styles.newsCard} data-reveal style={{ "--i": i }}>
                    {inner}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Avis clients : uniquement de vrais avis publiés */}
      {reviews.length > 0 && (
        <section className={`${styles.tile} ${styles.dark}`} aria-labelledby="reviews-title">
          <div className={styles.container}>
            <TileHead id="reviews-title" eyebrow="Avis clients" title="Ils nous font confiance." />
            <ul className={styles.reviewList}>
              {reviews.slice(0, 3).map((r, i) => (
                <li key={r.id} data-reveal style={{ "--i": i }}>
                  <p className={styles.reviewStars} aria-label={`${r.rating} étoiles sur 5`}>
                    {Array.from({ length: r.rating }, (_, k) => (
                      <Star key={k} size={15} strokeWidth={0} fill="currentColor" aria-hidden />
                    ))}
                  </p>
                  <blockquote>« {r.text} »</blockquote>
                  <p className={styles.reviewAuthor}>
                    <span className={styles.avatar} aria-hidden>
                      {initials(r.author)}
                    </span>
                    <span>
                      <strong>{r.author}</strong>
                      {r.product && <span>{r.product}</span>}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Conseil */}
      <section className={`${styles.tile} ${styles.parchment}`} aria-labelledby="advice-title">
        <div className={`${styles.container} ${styles.adviceInner}`}>
          <div className={styles.adviceText} data-reveal>
            <p className={styles.eyebrow}>Un doute ?</p>
            <h2 id="advice-title" className={styles.display}>
              Besoin d&apos;un conseil ?
            </h2>
            <p>
              Dis-nous ton budget et ton usage : un conseiller te répond sur WhatsApp et t&apos;aide à choisir le bon
              téléphone.
            </p>
            <Button
              href={whatsappLink("Bonjour TechDouala, j'aimerais un conseil pour choisir un téléphone.")}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              className={styles.pill}
            >
              <MessageCircle size={18} aria-hidden /> Écrire à un conseiller
            </Button>
          </div>
          {collage.length > 0 && (
            <div className={styles.collage} aria-hidden>
              {collage.map((p, i) => (
                <span key={p.id} className={styles.collageItem} data-reveal="drop" style={{ "--i": i }}>
                  <Image src={p.imageUrl} alt="" fill sizes="180px" className={styles.collagePhoto} />
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
