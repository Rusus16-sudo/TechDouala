import { Check, Handshake, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Status, { Tag } from "@/components/admin/Status";
import DateDemo from "./DateDemo";
import TekoMessage from "@/components/ui/Teko";
import ProductCard from "@/components/ui/ProductCard";
import CartProvider from "@/components/cart/CartProvider";
// Produit fictif pour illustrer la carte (le vrai catalogue vient de Supabase).
const DEMO = {
  id: "demo", name: "iPhone 15", brandName: "Apple", condition: "Neuf", imageUrl: null,
  warrantyMonths: 12, rating: 4.8, reviewCount: 32, featured: true,
  colors: [{ name: "Noir", hex: "#2B2D31" }, { name: "Bleu", hex: "#C9D8E6" }],
  variants: [{ id: "demo-128", sku: "128", storage: "128 Go", price: 522000, oldPrice: 560000, stock: 5 }],
};
import styles from "./page.module.css";

export const metadata = { title: "Design system - TechDouala" };

const COLORS = [
  ["Violet Douala", "--violet", "#6A40FF"],
  ["Soleil Kribi", "--soleil", "#FFB703"],
  ["Succès", "--succes", "#00C48C"],
  ["Alerte douce", "--alerte", "#FFB547"],
  ["Neutre 900", "--n-900", "#111827"],
  ["Neutre 600", "--n-600", "#6B7280"],
  ["Neutre 200", "--n-200", "#E5E7EB"],
  ["Neutre 50", "--n-50", "#F7FBFA"],
];

// Page de référence interne : reproduit le bandeau « Design system » de la maquette.
export default function DesignSystemPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.h1}>Design system TechDouala</h1>

      <section className={styles.section}>
        <h2>Couleurs</h2>
        <div className={styles.swatches}>
          {COLORS.map(([name, token, hex]) => (
            <div key={token} className={styles.swatch}>
              <span className={styles.chip} style={{ background: `var(${token})` }} />
              <strong>{name}</strong>
              <code>{hex}</code>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Typographies</h2>
        <p className={styles.display}>Baloo 2 ExtraBold · Aa Bb Cc 123</p>
        <p className="text-muted">Titres / Montants / Badges</p>
        <p className={styles.body}>Inter · Aa Bb Cc 123 — Texte (Regular / Medium / SemiBold)</p>
      </section>

      <section className={styles.section}>
        <h2>Boutons</h2>
        <div className={styles.row}>
          <Button>Bouton principal</Button>
          <Button variant="secondary">Bouton secondaire</Button>
          <Button variant="success" icon={Check}>Succès</Button>
          <Button variant="alert" icon={Check}>Alerte</Button>
          <Button variant="light">Clair</Button>
          <Button variant="secondary" size="sm" icon={Handshake}>Négocier</Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Badges</h2>
        <div className={styles.row}>
          <Badge variant="success">Bon payeur</Badge>
          <Badge variant="alert">À payer</Badge>
          <Badge variant="danger">En retard</Badge>
          <Badge variant="neutral">À venir</Badge>
          <Badge variant="violet-soft">Neuf</Badge>
          <Badge variant="success-soft">Reconditionné</Badge>
          <Badge variant="success" icon={ShieldCheck}>Garantie 12 mois</Badge>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Statuts de l&apos;espace gérant</h2>
        <p className="text-muted">
          Côté gestion, le mot se lit en encre et la couleur tient dans une pastille de 6 px : un tableau de bord doit se
          parcourir sans être un damier de couleurs. Les attributs secondaires n&apos;en portent aucune.
        </p>
        <div className={styles.row} style={{ marginTop: 16, gap: 20 }}>
          <Status>Publié</Status>
          <Status tone="off">Masqué</Status>
          <Status tone="progress">Confirmée</Status>
          <Status tone="wait">À encaisser</Status>
          <Status tone="done">Payé</Status>
          <Status tone="critical">Rupture</Status>
          <Tag>Flash</Tag>
          <Tag>Coup de cœur</Tag>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Champ date (espace gérant)</h2>
        <p className="text-muted">
          Calendrier maison : en français, lundi en tête, aujourd&apos;hui cerclé, sélection en violet, pilotable aux flèches du clavier.
        </p>
        <div style={{ marginTop: 16 }}>
          <DateDemo />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Tekô</h2>
        <TekoMessage title="Super !">
          Tu es maintenant plus proche de ton nouveau téléphone !
        </TekoMessage>
      </section>

      <section className={styles.section}>
        <h2>Cartes produit</h2>
        <div className={styles.cards}>
          <CartProvider>
            <ProductCard product={DEMO} />
            <ProductCard product={{ ...DEMO, id: "demo-2", condition: "Reconditionné", colors: [DEMO.colors[0]] }} />
          </CartProvider>
        </div>
      </section>
    </main>
  );
}
