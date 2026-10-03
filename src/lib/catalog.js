// Outils partagés sur les produits (serveur et navigateur). Les données viennent de Supabase (lib/data/catalog.js).
import {
  Smartphone, Tablet, Phone, Headphones, Watch, Cable, BatteryCharging, ShieldCheck, Package,
} from "lucide-react";

const CATEGORY_ICONS = {
  smartphones: Smartphone,
  tablettes: Tablet,
  "telephones-a-touches": Phone,
  "ecouteurs-casques": Headphones,
  "montres-connectees": Watch,
  "chargeurs-cables": Cable,
  powerbanks: BatteryCharging,
  protection: ShieldCheck,
};

export function categoryIcon(slug) {
  return CATEGORY_ICONS[slug] ?? Package;
}

export function getVariant(product, sku) {
  return product.variants.find((v) => v.sku === sku) ?? defaultVariant(product);
}

/** Variante mise en avant : la moins chère encore en stock (sinon la moins chère). */
export function defaultVariant(product) {
  const byPrice = [...product.variants].sort((a, b) => a.price - b.price);
  return byPrice.find((v) => v.stock > 0) ?? byPrice[0];
}

/** Vrai si le produit n'a qu'une seule combinaison possible (ajout au panier direct). */
export function isSimple(product) {
  return product.variants.length === 1 && product.colors.length <= 1;
}

export function hasPriceRange(product) {
  return new Set(product.variants.map((v) => v.price)).size > 1;
}

export function totalStock(product) {
  return product.variants.reduce((n, v) => n + v.stock, 0);
}

export function discountPct(variant) {
  return variant.oldPrice ? Math.round((1 - variant.price / variant.oldPrice) * 100) : 0;
}

/** Données minimales d'une ligne de panier (le serveur revérifie prix et stock à la commande). */
export function cartSnapshot(product, variant, color) {
  return {
    id: product.id,
    variantId: variant.id,
    sku: variant.sku,
    name: product.name,
    label: variant.storage,
    color: color ?? null,
    price: variant.price,
    max: Math.min(variant.stock, 5),
    image: product.imageUrl,
    condition: product.condition,
  };
}
