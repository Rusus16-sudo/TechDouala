// Filtres, tri et pagination des listes de produits, pilotés par l'URL (?marque=apple&tri=prix-asc…).
import { defaultVariant, discountPct, totalStock } from "./catalog";

export const PAGE_SIZE = 12;

export const SORTS = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "nouveautes", label: "Nouveautés" },
  { value: "promo", label: "Meilleures remises" },
  { value: "note", label: "Mieux notés" },
];

export const PRICE_RANGES = [
  { value: "0-100000", label: "Moins de 100 000 FCFA", min: 0, max: 100000 },
  { value: "100000-250000", label: "100 000 – 250 000 FCFA", min: 100000, max: 250000 },
  { value: "250000-500000", label: "250 000 – 500 000 FCFA", min: 250000, max: 500000 },
  { value: "500000-", label: "Plus de 500 000 FCFA", min: 500000, max: Infinity },
];

export const CONDITIONS = [
  { value: "neuf", label: "Neuf", match: "Neuf" },
  { value: "reconditionne", label: "Reconditionné", match: "Reconditionné" },
  { value: "occasion", label: "Occasion", match: "Occasion" },
];

// Stockage seul d'une variante (« 256 Go · Bleu » → « 256 Go »).
const storageOf = (v) => v.storage?.split(" · ")[0] ?? null;

const list = (v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const one = (v) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Lit les filtres depuis les searchParams de la page. */
export function parseFilters(sp) {
  const page = Number.parseInt(one(sp.page), 10);
  return {
    q: one(sp.q).trim(),
    marque: list(sp.marque),
    etat: list(sp.etat),
    stockage: list(sp.stockage),
    ram: list(sp.ram),
    prix: one(sp.prix),
    reseau: one(sp.reseau),
    dispo: one(sp.dispo),
    tri: SORTS.some((s) => s.value === one(sp.tri)) ? one(sp.tri) : "pertinence",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function matchesQuery(product, q) {
  if (!q) return true;
  const hay = normalize(`${product.name} ${product.brandName} ${product.category}`);
  return normalize(q)
    .split(/\s+/)
    .every((word) => hay.includes(word));
}

/**
 * Pertinence d'un produit pour les suggestions de recherche (0 = ne correspond pas).
 * Mêmes règles que matchesQuery, puis bonus : nom qui commence par la saisie, mots qui commencent pareil.
 */
export function searchScore(product, q) {
  const query = normalize(q ?? "").trim();
  if (!query || !matchesQuery(product, query)) return 0;
  const name = normalize(product.name);
  const nameWords = name.split(/\s+/);
  let score = 1;
  if (name.startsWith(query)) score += 6;
  else if (name.includes(query)) score += 3;
  for (const word of query.split(/\s+/)) {
    if (nameWords.some((w) => w.startsWith(word))) score += 2;
    if (normalize(product.brandName).startsWith(word)) score += 1;
  }
  return score;
}

/** Libellé qui correspond à la saisie (rayon, marque) : début de mot prioritaire. */
export function labelMatches(label, q) {
  const query = normalize(q ?? "").trim();
  if (!query) return false;
  const text = normalize(label);
  return text.startsWith(query) || text.split(/[\s&-]+/).some((w) => w.startsWith(query));
}

function applyFilters(products, f) {
  const range = PRICE_RANGES.find((r) => r.value === f.prix);
  const conditions = CONDITIONS.filter((c) => f.etat.includes(c.value)).map((c) => c.match);
  return products.filter((p) => {
    const price = defaultVariant(p).price;
    return (
      matchesQuery(p, f.q) &&
      (!f.marque.length || f.marque.includes(p.brand)) &&
      (!conditions.length || conditions.includes(p.condition)) &&
      (!f.stockage.length || p.variants.some((v) => f.stockage.includes(storageOf(v)))) &&
      (!f.ram.length || f.ram.includes(String(p.ram))) &&
      (!range || (price >= range.min && price < range.max)) &&
      (f.reseau !== "5g" || p.is5G) &&
      (f.dispo !== "1" || totalStock(p) > 0)
    );
  });
}

const SORTERS = {
  pertinence: (a, b) => Number(!!b.featured) - Number(!!a.featured) || b.reviewCount - a.reviewCount,
  "prix-asc": (a, b) => defaultVariant(a).price - defaultVariant(b).price,
  "prix-desc": (a, b) => defaultVariant(b).price - defaultVariant(a).price,
  nouveautes: (a, b) => String(b.addedAt).localeCompare(String(a.addedAt)),
  promo: (a, b) => discountPct(defaultVariant(b)) - discountPct(defaultVariant(a)),
  note: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

/** Valeurs disponibles pour chaque filtre (avec le nombre de produits), calculées sur la liste de base. */
export function facets(products) {
  const count = (values) => {
    const m = new Map();
    values.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
    return m;
  };
  const brands = count(products.map((p) => p.brand));
  const brandNames = new Map(products.map((p) => [p.brand, p.brandName]));
  const storages = count(products.flatMap((p) => [...new Set(p.variants.map(storageOf).filter((s) => /\d\s*(Go|To)$/.test(s ?? "")))]));
  const rams = count(products.filter((p) => p.ram).map((p) => String(p.ram)));
  const conds = count(products.map((p) => p.condition));
  const gb = (s) => Number.parseInt(s, 10) * (s.includes("To") ? 1024 : 1);

  return {
    marque: [...brands.keys()]
      .sort((a, b) => brandNames.get(a).localeCompare(brandNames.get(b), "fr"))
      .map((slug) => ({ value: slug, label: brandNames.get(slug), count: brands.get(slug) })),
    etat: CONDITIONS.filter((c) => conds.has(c.match)).map((c) => ({ value: c.value, label: c.label, count: conds.get(c.match) })),
    stockage: [...storages.keys()]
      .sort((a, b) => gb(a) - gb(b))
      .map((s) => ({ value: s, label: s, count: storages.get(s) })),
    ram: [...rams.keys()]
      .sort((a, b) => a - b)
      .map((r) => ({ value: r, label: `${r} Go`, count: rams.get(r) })),
    has5G: products.some((p) => p.is5G),
  };
}

/** Filtre, trie et découpe en pages. */
export function runListing(products, f) {
  const filtered = applyFilters(products, f).sort(SORTERS[f.tri]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  return {
    total: filtered.length,
    page,
    pages,
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}

/** Liste des filtres actifs, pour les pastilles « × » au-dessus des résultats. */
export function activeFilters(f, fct) {
  const label = (key, value) => fct[key]?.find((o) => o.value === value)?.label ?? value;
  return [
    ...f.marque.map((v) => ({ key: "marque", value: v, label: label("marque", v) })),
    ...f.etat.map((v) => ({ key: "etat", value: v, label: label("etat", v) })),
    ...f.stockage.map((v) => ({ key: "stockage", value: v, label: v })),
    ...f.ram.map((v) => ({ key: "ram", value: v, label: `${v} Go de RAM` })),
    ...(f.prix ? [{ key: "prix", value: f.prix, label: PRICE_RANGES.find((r) => r.value === f.prix)?.label ?? f.prix }] : []),
    ...(f.reseau === "5g" ? [{ key: "reseau", value: "5g", label: "5G" }] : []),
    ...(f.dispo === "1" ? [{ key: "dispo", value: "1", label: "En stock" }] : []),
  ];
}
