import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle, ShieldCheck, Star, Store, Wallet,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import Countdown from "@/components/home/Countdown";
import CreditShowcase from "@/components/home/CreditShowcase";
import HeroCarousel from "@/components/home/HeroCarousel";
import { categoryIcon, defaultVariant, hasPriceRange } from "@/lib/catalog";
import { getCategories, getHomeReviews, getNews, getProducts } from "@/lib/data/catalog";
import { creditPlan } from "@/lib/credit";
import { whatsappLink } from "@/lib/store";
import styles from "./home.module.css";

const REASSURANCE = [
  { icon: MessageCircle, title: "Commande sur WhatsApp", text: "Un conseiller confirme tout avec toi" },
  { icon: Wallet, title: "Paiement à la remise", text: "Cash, MTN MoMo ou Orange Money" },
  { icon: Store, title: "Boutique à Douala", text: "Retrait et SAV sur place" },
  { icon: ShieldCheck, title: "Garantie boutique", text: "Sur chaque téléphone vendu" },
];

// Atouts affichés sous l'échéancier du crédit 40/60.
const OTHERS = [
  { title: "Prix négociable", text: "Propose ton prix depuis la fiche produit.", href: "/categories/smartphones" },
  { title: "Reprise de ton ancien téléphone", text: "Sa valeur est déduite de ton achat.", href: "/reprise" },
  { title: "Occasions contrôlées", text: "Testées et garanties en boutique.", href: "/reconditionnes" },
];

function SectionHead({ title, href, linkLabel = "Voir tout", children }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
      {href && (
        <Link href={href} className={styles.seeAll}>
          {linkLabel}
        </Link>
      )}
    </div>
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
  const [products, categories, news, reviews] = await Promise.all([
    getProducts(),
    getCategories(),
    getNews(),
    getHomeReviews(),
  ]);

  const inStock = (p) => defaultVariant(p).stock > 0;
  const flash = products.filter((p) => p.flash && inStock(p));
  const promos = (flash.length ? flash : products.filter((p) => defaultVariant(p).oldPrice && inStock(p))).slice(0, 4);
  const featured = (products.some((p) => p.featured) ? products.filter((p) => p.featured) : products).slice(0, 4);
  const newsCards = news.filter((n) => n.placement === "accueil").slice(0, 3);

  // Hero : jusqu'à 4 téléphones en stock, les coups de cœur d'abord, ceux qui ont une photo en priorité.
  const heroPool = [...products]
    .filter((p) => inStock(p) && defaultVariant(p).price >= 50000)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.imageUrl) - Number(!!a.imageUrl));
  const heroSlides = heroPool.slice(0, 4).map((p) => {
    const v = defaultVariant(p);
    const plan = creditPlan(v.price);
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      imageUrl: p.imageUrl,
      condition: p.condition,
      warrantyMonths: p.warrantyMonths,
      price: v.price,
      fromPrice: hasPriceRange(p),
      downPayment: plan.downPayment,
      monthly: plan.monthly,
      months: plan.months,
    };
  });
  // Échéancier du crédit : les mêmes téléphones, ceux qui ont une photo.
  const creditPhones = heroSlides.filter((s) => s.imageUrl);

  // Tuile de chaque rayon : la photo d'un de ses produits, sinon son pictogramme.
  const universes = categories.map((c) => ({
    ...c,
    image: products.find((p) => p.category === c.slug && p.imageUrl)?.imageUrl ?? null,
  }));

  // Bloc conseil : trois photos du catalogue.
  const collage = products.filter((p) => p.imageUrl).slice(0, 3);

  return (
    <>
      {/* Hero : les téléphones à la une défilent */}
      <HeroCarousel slides={heroSlides} />

      {/* Engagements */}
      <section className={styles.container} aria-label="Nos engagements">
        <ul className={styles.reassurance}>
          {REASSURANCE.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={20} strokeWidth={1.75} aria-hidden className={styles.reassuranceIcon} />
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Nos univers */}
      {universes.length > 0 && (
        <section className={`${styles.container} ${styles.section}`}>
          <SectionHead title="Nos univers" href="/categories" />
          <ul className={styles.universes}>
            {universes.map(({ slug, name, image }) => {
              const Icon = categoryIcon(slug);
              return (
                <li key={slug}>
                  <Link href={`/categories/${slug}`} className={styles.universe}>
                    <span className={styles.universeMedia}>
                      {image ? (
                        <Image src={image} alt="" fill sizes="(max-width: 640px) 40vw, 200px" className={styles.universePhoto} />
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
        </section>
      )}

      {products.length === 0 && (
        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.soon}>
            <h2>Le catalogue arrive très bientôt</h2>
            <p>Nos téléphones seront en ligne dans quelques jours. Écris-nous sur WhatsApp en attendant.</p>
          </div>
        </section>
      )}

      {/* Promotions */}
      {promos.length > 0 && (
        <section className={`${styles.container} ${styles.section}`}>
          <SectionHead
            title={flash.length ? "Ventes flash" : "Promotions"}
            href={flash.length ? "/ventes-flash" : "/bons-plans"}
            linkLabel="Voir toutes les promotions"
          >
            {flash.length > 0 && <Countdown />}
          </SectionHead>
          <div className={styles.grid4}>
            {promos.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Crédit 40/60 : échéancier calculé sur un vrai téléphone */}
      <CreditShowcase phones={creditPhones} others={OTHERS} />

      {/* Coups de cœur */}
      {featured.length > 0 && (
        <section className={`${styles.container} ${styles.section}`}>
          <SectionHead title="Nos coups de cœur" href="/categories/smartphones" linkLabel="Voir tous les produits" />
          <div className={styles.grid4}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Actualités */}
      {newsCards.length > 0 && (
        <section className={`${styles.container} ${styles.section}`}>
          <SectionHead title="Actualités" />
          <div className={styles.news}>
            {newsCards.map((n) => {
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
                    {n.cta_label && <span className={styles.newsCta}>{n.cta_label}</span>}
                  </div>
                </>
              );
              return n.cta_href ? (
                <Link key={n.id} href={n.cta_href} className={styles.newsCard}>
                  {inner}
                </Link>
              ) : (
                <article key={n.id} className={styles.newsCard}>
                  {inner}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Avis clients : uniquement de vrais avis publiés */}
      {reviews.length > 0 && (
        <section className={styles.reviews} aria-labelledby="reviews-title">
          <div className={styles.container}>
            <h2 id="reviews-title" className={styles.sectionTitle}>
              Ils nous font confiance
            </h2>
            <ul className={styles.reviewList}>
              {reviews.slice(0, 3).map((r) => (
                <li key={r.id}>
                  <p className={styles.reviewStars} aria-label={`${r.rating} étoiles sur 5`}>
                    {Array.from({ length: r.rating }, (_, i) => (
                      <Star key={i} size={15} strokeWidth={0} fill="currentColor" aria-hidden />
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
      <section className={styles.advice}>
        <div className={`${styles.container} ${styles.adviceInner}`}>
          <div className={styles.adviceText}>
            <h2 className={styles.sectionTitle}>Besoin d&apos;un conseil ?</h2>
            <p>
              Dis-nous ton budget et ton usage : un conseiller te répond sur WhatsApp et t&apos;aide à choisir le bon
              téléphone.
            </p>
            <Button
              href={whatsappLink("Bonjour TechDouala, j'aimerais un conseil pour choisir un téléphone.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} aria-hidden /> Écrire à un conseiller
            </Button>
          </div>
          {collage.length > 0 && (
            <div className={styles.collage} aria-hidden>
              {collage.map((p) => (
                <span key={p.id} className={styles.collageItem}>
                  <Image src={p.imageUrl} alt="" fill sizes="180px" className={styles.collagePhoto} />
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
