// Import du catalogue fourni par la boutique (liste du 22/09/2026) → supabase/migrations/0003_occasion_catalogue.sql
// Usage : node scripts/catalogue-2026-09.mjs
//
// Règles appliquées (décisions de la boutique) :
//  - prix de vente = prix de la liste ;
//  - produits importés MASQUÉS, stock 0 : le gérant saisit le stock réel puis publie ;
//  - « scellé » / « carton » = Neuf ; « non scellé », « Box » et modèles sans mention (iPhone 11-13, Sharp,
//    Kyocera, Pixel non scellés) = Occasion ;
//  - garantie : 12 mois par défaut, 3 mois pour le bloc Samsung « GARANTIE (3-6) MOIS » et les occasions
//    (valeur prudente, modifiable par le gérant).
import { writeFileSync } from "node:fs";

const SIM = { dual: "Double SIM", esim: "SIM + eSIM", one: "1 SIM", physical: "Nano-SIM physique (non activé)" };
const ORIGIN = { uk: "Royaume-Uni", krus: "Corée du Sud / États-Unis", kr: "Corée du Sud", ca: "Canada", jp: "Japon" };

// [marque, nom, état, garantie (mois), options, variantes [[stockage, RAM, prix, { sim, color, origin }]]]
const N = "Neuf";
const O = "Occasion";
const CATALOGUE = [
  // --- Samsung scellé (hors droits de douane)
  ["samsung", "Galaxy S26 Ultra", N, 12, { g5: true, featured: true, sim: SIM.dual, origin: ORIGIN.uk }, [["256 Go", 12, 850000]]],
  ["samsung", "Galaxy S25 Ultra", N, 12, { g5: true, featured: true }, [
    ["256 Go", 12, 600000, { sim: SIM.dual, origin: ORIGIN.uk }],
    ["512 Go", 12, 650000, { sim: SIM.esim, origin: ORIGIN.krus }],
  ]],
  ["samsung", "Galaxy S25 FE", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["256 Go", 8, 350000]]],
  ["samsung", "Galaxy S23 FE", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["256 Go", 8, 200000]]],
  ["samsung", "Galaxy S24", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 8, 325000]]],
  ["samsung", "Galaxy S23", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 8, 250000]]],
  ["samsung", "Galaxy S25+", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 12, 450000]]],
  ["samsung", "Galaxy S24+", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 12, 350000]]],
  ["samsung", "Galaxy S23 Ultra", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 12, 400000]]],
  ["samsung", "Galaxy S24 Ultra", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 12, 500000], ["1 To", 12, 550000]]],
  ["samsung", "Galaxy Z Flip4", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["256 Go", 8, 200000], ["512 Go", 8, 225000]]],
  ["samsung", "Galaxy Z Flip6", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 12, 350000]]],
  ["samsung", "Galaxy Z Fold7", N, 12, { g5: true, featured: true, sim: SIM.esim, origin: ORIGIN.krus }, [["1 To", 16, 900000]]],
  ["samsung", "Galaxy Z Fold6", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 12, 700000]]],
  ["samsung", "Galaxy Z Fold5", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 12, 500000]]],
  ["samsung", "Galaxy Z Fold4", N, 12, { g5: true, sim: SIM.esim, origin: ORIGIN.krus }, [["512 Go", 12, 400000]]],
  ["samsung", "Galaxy S22 Ultra", N, 12, { g5: true, sim: SIM.one, origin: ORIGIN.kr }, [["256 Go", 12, 325000], ["512 Go", 12, 350000]]],

  // --- Samsung, bloc « GARANTIE (3-6) MOIS »
  ["samsung", "Galaxy A57", N, 3, { g5: true, sim: SIM.dual, origin: ORIGIN.uk }, [["256 Go", 8, 295000], ["256 Go", 12, 310000]]],
  ["samsung", "Galaxy A26", N, 3, { g5: true, sim: SIM.dual, origin: ORIGIN.uk }, [["128 Go", 6, 140000]]],
  ["samsung", "Galaxy M23", N, 3, { g5: true, sim: SIM.one, origin: ORIGIN.kr }, [["128 Go", 4, 95000]]],
  ["samsung", "Galaxy M33", N, 3, { g5: true, sim: SIM.one, origin: ORIGIN.kr }, [["128 Go", 6, 100000]]],
  ["samsung", "Galaxy M36", N, 3, { g5: true, sim: SIM.one, origin: ORIGIN.kr }, [["128 Go", 6, 120000]]],
  ["samsung", "Galaxy A34", N, 3, { g5: true, sim: SIM.one, origin: ORIGIN.kr }, [["128 Go", 6, 115000]]],
  ["samsung", "Galaxy A36", N, 3, { g5: true, sim: SIM.esim, origin: ORIGIN.kr }, [["128 Go", 6, 160000]]],
  ["samsung", "Galaxy A54", N, 3, { g5: true, sim: SIM.esim, origin: ORIGIN.kr }, [["128 Go", 8, 145000]]],
  // non scellés (avec boîte quand « Box »)
  ["samsung", "Galaxy A56", O, 3, { g5: true, sim: SIM.esim, origin: ORIGIN.kr, box: true }, [["128 Go", 8, 185000]]],
  ["samsung", "Galaxy A55", O, 3, { g5: true, sim: SIM.esim, origin: ORIGIN.kr, box: true }, [["128 Go", 8, 175000]]],
  ["samsung", "Galaxy A54", O, 3, { g5: true, sim: SIM.esim, origin: ORIGIN.kr, box: true }, [["128 Go", 8, 140000]]],
  ["samsung", "Galaxy A35", O, 3, { g5: true, sim: SIM.esim, origin: ORIGIN.kr, box: true }, [["128 Go", 6, 155000]]],
  ["samsung", "Galaxy A36", O, 3, { g5: true, sim: SIM.esim, origin: ORIGIN.kr, box: true }, [["128 Go", 6, 155000]]],
  ["samsung", "Galaxy A24", O, 3, { g5: false, sim: SIM.one, origin: ORIGIN.kr }, [["128 Go", 4, 85000]]],
  ["samsung", "Galaxy A34", O, 3, { g5: true, sim: SIM.one, origin: ORIGIN.kr, box: true }, [["128 Go", 6, 110000]]],
  ["samsung", "Galaxy M53", O, 3, { g5: true, sim: SIM.one, origin: ORIGIN.kr }, [["128 Go", 8, 95000]]],
  ["samsung", "Galaxy M33", O, 3, { g5: true, sim: SIM.one, origin: ORIGIN.kr }, [["128 Go", 6, 85000]]],
  ["samsung", "Galaxy M44", O, 3, { g5: true, sim: SIM.one, origin: ORIGIN.kr }, [["128 Go", 6, 85000]]],

  // --- iPhone 18 Pro (arrivage, SIM physique non activé) : prix selon la couleur
  ["apple", "iPhone 18 Pro", N, 12, { g5: true, featured: true, sim: SIM.physical }, [
    ["256 Go", null, 1230000, { color: "Marron" }],
    ["256 Go", null, 1230000, { color: "Bleu" }],
  ]],
  ["apple", "iPhone 18 Pro Max", N, 12, { g5: true, featured: true, sim: SIM.physical }, [
    ["256 Go", null, 1350000, { color: "Marron" }],
    ["256 Go", null, 1350000, { color: "Bleu" }],
    ["256 Go", null, 1330000, { color: "Blanc" }],
    ["512 Go", null, 1550000, { color: "Marron" }],
    ["512 Go", null, 1550000, { color: "Bleu" }],
  ]],

  // --- Xiaomi Redmi
  ["xiaomi", "Redmi A5", N, 12, {}, [["64 Go", 3, 55000], ["128 Go", 4, 65000]]],
  ["xiaomi", "Redmi A7", N, 12, {}, [["64 Go", 3, 80000]]],
  ["xiaomi", "Redmi A7 Pro", N, 12, {}, [["64 Go", 4, 85000], ["128 Go", 4, 90000]]],
  ["xiaomi", "Redmi 15C", N, 12, {}, [["128 Go", 4, 95000], ["256 Go", 8, 110000]]],
  ["xiaomi", "Redmi 17", N, 12, {}, [["128 Go", 4, 115000], ["256 Go", 8, 130000]]],
  ["xiaomi", "Redmi Note 15", N, 12, {}, [["128 Go", 6, 125000], ["256 Go", 8, 145000]]],
  ["xiaomi", "Redmi Note 15 Pro", N, 12, {}, [["256 Go", 8, 180000], ["512 Go", 12, 210000]]],
  ["xiaomi", "Redmi Note 15 Pro+", N, 12, { g5: true, featured: true }, [["256 Go", 8, 240000], ["512 Go", 12, 280000]]],
  ["xiaomi", "Redmi Note 14 Pro", N, 12, {}, [["512 Go", 12, 190000]]],
  ["xiaomi", "Redmi Note 14 Pro+", N, 12, { g5: true }, [["256 Go", 8, 220000], ["512 Go", 12, 240000]]],

  // --- Tecno
  ["tecno", "Pop 20", N, 12, {}, [["64 Go", 4, 80000], ["128 Go", 4, 95000]]],
  ["tecno", "Pop 20C", N, 12, {}, [["64 Go", 4, 75000]]],
  ["tecno", "Spark 50", N, 12, {}, [["128 Go", 4, 115000], ["256 Go", 8, 130000]]],
  ["tecno", "Spark 50 Pro", N, 12, {}, [["256 Go", 8, 140000]]],
  ["tecno", "Camon 50", N, 12, {}, [["256 Go", 8, 200000]]],
  ["tecno", "Camon 50 Pro", N, 12, {}, [["256 Go", 8, 230000]]],
  ["tecno", "Camon 50 Slim", N, 12, {}, [["256 Go", 8, 225000]]],
  ["tecno", "Camon 50 Ultra", N, 12, { featured: true }, [["512 Go", 8, 315000]]],

  // --- Sharp / Kyocera (occasions import Japon)
  ["sharp", "Sharp R8", O, 3, { g5: true, origin: ORIGIN.jp }, [["256 Go", 8, 100000]]],
  ["sharp", "Sharp Zero6", O, 3, { g5: true, origin: ORIGIN.jp }, [["128 Go", 6, 55000]]],
  ["sharp", "Sharp Zero2", O, 3, { origin: ORIGIN.jp }, [["256 Go", 8, 58000]]],
  ["sharp", "Sharp Zero", O, 3, { origin: ORIGIN.jp }, [["128 Go", 6, 45000]]],
  ["sharp", "Sharp R3", O, 3, { origin: ORIGIN.jp }, [["128 Go", 6, 53000]]],
  ["sharp", "Sharp R2", O, 3, { origin: ORIGIN.jp }, [["64 Go", 4, 45000]]],
  ["sharp", "Sharp V45", O, 3, { origin: ORIGIN.jp }, [["64 Go", 4, 45000]]],
  ["sharp", "Sharp Wish2", O, 3, { g5: true, origin: ORIGIN.jp }, [["64 Go", 4, 45000]]],
  ["sharp", "Sharp V48", O, 3, { origin: ORIGIN.jp }, [["32 Go", 3, 37000]]],
  ["sharp", "Sharp V43", O, 3, { origin: ORIGIN.jp }, [["32 Go", 3, 35000]]],
  ["sharp", "Sharp S1", O, 3, { origin: ORIGIN.jp }, [["32 Go", 3, 35000]]],
  ["sharp", "Sharp R Compact", O, 3, { origin: ORIGIN.jp }, [["32 Go", 3, 32000]]],
  ["kyocera", "Kyocera S6", O, 3, { origin: ORIGIN.jp }, [["32 Go", 3, 35000]]],
  ["kyocera", "Kyocera X3", O, 3, { origin: ORIGIN.jp }, [["32 Go", 3, 35000]]],
  ["kyocera", "Kyocera V48", O, 3, { origin: ORIGIN.jp }, [["32 Go", 3, 33000]]],

  // --- Google Pixel (occasion sauf « scellé » / « carton »)
  ["google", "Pixel 3", O, 3, {}, [["64 Go", null, 60000]]],
  ["google", "Pixel 3 XL", O, 3, {}, [["64 Go", null, 70000]]],
  ["google", "Pixel 4 XL", O, 3, {}, [["64 Go", null, 75000], ["128 Go", null, 80000]]],
  ["google", "Pixel 6a", O, 3, { g5: true }, [["128 Go", null, 95000]]],
  ["google", "Pixel 6", O, 3, { g5: true }, [["128 Go", null, 100000], ["256 Go", null, 115000]]],
  ["google", "Pixel 6 Pro", O, 3, { g5: true }, [["128 Go", null, 130000], ["256 Go", null, 140000], ["512 Go", null, 160000]]],
  ["google", "Pixel 7a", O, 3, { g5: true }, [["128 Go", null, 110000]]],
  ["google", "Pixel 7", O, 3, { g5: true }, [["128 Go", null, 120000]]],
  ["google", "Pixel 7 Pro", O, 3, { g5: true }, [["128 Go", null, 145000], ["256 Go", null, 175000]]],
  ["google", "Pixel 7 Pro", N, 12, { g5: true }, [["128 Go", null, 155000]]],
  ["google", "Pixel 8", O, 3, { g5: true }, [["128 Go", null, 155000]]],
  ["google", "Pixel 8 Pro", O, 3, { g5: true }, [["128 Go", null, 200000], ["256 Go", null, 240000]]],
  ["google", "Pixel 9", O, 3, { g5: true }, [["128 Go", null, 260000], ["128 Go", null, 265000, { color: "Rose" }]]],
  ["google", "Pixel 9", N, 12, { g5: true }, [[null, null, 280000]]],
  ["google", "Pixel 9 Pro", O, 3, { g5: true }, [[null, null, 300000]]],
  ["google", "Pixel 9 Pro", N, 12, { g5: true }, [[null, null, 325000]]],
  ["google", "Pixel 9 Pro XL", O, 3, { g5: true }, [["128 Go", null, 335000]]],
  ["google", "Pixel 9 Pro XL", N, 12, { g5: true }, [["128 Go", null, 355000], ["256 Go", null, 410000]]],
  ["google", "Pixel Fold", N, 12, { g5: true, origin: ORIGIN.ca }, [["256 Go", null, 260000]]],
  ["google", "Pixel 9 Pro Fold", N, 12, { g5: true, origin: ORIGIN.ca, note: "Non activé" }, [["256 Go", null, 500000]]],
  ["google", "Pixel 10 Pro", N, 12, { g5: true, origin: ORIGIN.ca, note: "Neuf en carton" }, [[null, null, 500000]]],
  ["google", "Pixel 10 Pro XL", N, 12, { g5: true, featured: true, origin: ORIGIN.ca }, [["256 Go", null, 550000]]],
  ["google", "Pixel 10 Pro Fold", N, 12, { g5: true, origin: ORIGIN.ca, note: "Non activé" }, [["512 Go", null, 750000]]],

  // --- iPhone (occasions)
  ["apple", "iPhone XR", O, 3, {}, [["64 Go", null, 85000], ["128 Go", null, 90000]]],
  ["apple", "iPhone 11", O, 3, {}, [["64 Go", null, 100000], ["128 Go", null, 110000], ["256 Go", null, 120000]]],
  ["apple", "iPhone 11 Pro", O, 3, {}, [["64 Go", null, 120000], ["256 Go", null, 140000]]],
  ["apple", "iPhone 11 Pro Max", O, 3, {}, [["64 Go", null, 130000], ["256 Go", null, 150000]]],
  ["apple", "iPhone 12", O, 3, { g5: true }, [["64 Go", null, 110000], ["128 Go", null, 120000], ["256 Go", null, 140000]]],
  ["apple", "iPhone 12 Pro", O, 3, { g5: true }, [["128 Go", null, 160000], ["256 Go", null, 175000], ["512 Go", null, 190000]]],
  ["apple", "iPhone 12 Pro Max", O, 3, { g5: true }, [["128 Go", null, 185000], ["256 Go", null, 205000], ["512 Go", null, 225000]]],
  ["apple", "iPhone 13 mini", O, 3, { g5: true }, [["128 Go", null, 145000]]],
  ["apple", "iPhone 13", O, 3, { g5: true }, [["128 Go", null, 165000], ["256 Go", null, 175000]]],
  ["apple", "iPhone 13 Pro", O, 3, { g5: true }, [["128 Go", null, 225000], ["256 Go", null, 245000], ["512 Go", null, 265000]]],
  ["apple", "iPhone 13 Pro Max", O, 3, { g5: true }, [["128 Go", null, 255000], ["256 Go", null, 280000], ["512 Go", null, 300000]]],
];

// ---------------------------------------------------------------------------

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\+/g, "-plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const COLOR_HEX = { Marron: "#7B5B45", Bleu: "#3D5A80", Blanc: "#F2F2EF", Rose: "#F2C4CE" };

const seen = new Set();
const out = [];
let variantCount = 0;

for (const [brand, name, condition, warranty, opt, variants] of CATALOGUE) {
  const slug = slugify(`${name}${condition === O ? " occasion" : ""}`);
  if (seen.has(slug)) throw new Error(`Slug en double : ${slug}`);
  seen.add(slug);

  // Libellé de variante : stockage + RAM si elle varie + SIM/couleur si elles varient.
  const differs = (k) => new Set(variants.map((v) => JSON.stringify(v[3]?.[k] ?? null))).size > 1;
  const ramVaries = new Set(variants.map((v) => v[1])).size > 1;
  const simVaries = differs("sim");
  const labelOf = ([storage, ram, , extra = {}]) =>
    [storage, ramVaries && ram ? `${ram} Go RAM` : null, simVaries ? extra.sim : null, extra.color].filter(Boolean).join(" · ") || null;

  const rams = variants.map((v) => v[1]).filter(Boolean);
  const ramGb = rams.length ? Math.max(...rams) : null;
  const sim = simVaries ? null : (variants[0][3]?.sim ?? opt.sim ?? null);
  const origin = differs("origin") ? null : (variants[0][3]?.origin ?? opt.origin ?? null);

  const specs = [
    rams.length && !ramVaries ? { label: "RAM", value: `${ramGb} Go` } : null,
    sim ? { label: "SIM", value: sim } : null,
    simVaries ? { label: "SIM", value: "Selon la version (voir le choix de stockage)" } : null,
    origin ? { label: "Origine", value: origin } : null,
    { label: "Emballage", value: condition === N ? (opt.note ?? "Neuf, scellé") : opt.box ? "Occasion, avec boîte" : "Occasion" },
    opt.note && condition === N && opt.note !== "Neuf en carton" ? { label: "Activation", value: opt.note } : null,
  ].filter(Boolean);

  const colors = [...new Set(variants.map((v) => v[3]?.color).filter(Boolean))].map((c) => ({ name: c, hex: COLOR_HEX[c] }));
  // Les couleurs à prix différents sont déjà dans les variantes : pas de sélecteur de couleur séparé.
  const colorJson = variants.some((v) => v[3]?.color) ? [] : colors;

  const description =
    condition === N
      ? `${name} neuf${opt.note === "Non activé" ? ", jamais activé" : ""}. Vérifié IMEI avant la vente et garanti ${warranty} mois en boutique à Douala.`
      : `${name} d'occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras) et vérifié IMEI avant la vente. Garantie ${warranty} mois en boutique.`;

  out.push(
    `insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values (${q(slug)}, ${q(name)}, ${q(brand)}, 'smartphones', ${q(condition)}, ${q(description)}, ${q(JSON.stringify(specs))}::jsonb, ${q(JSON.stringify(colorJson))}::jsonb, ${ramGb ?? "null"}, ${!!opt.g5}, true, ${warranty}, ${!!opt.featured}, false)
on conflict (slug) do nothing;`,
  );
  variants.forEach((v, i) => {
    variantCount++;
    out.push(
      `insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v${i + 1}', ${q(labelOf(v))}, ${v[2]}, 0, ${i} from public.products where slug = ${q(slug)}
on conflict (product_id, sku) do nothing;`,
    );
  });
}

const sql = `-- ============================================================================
-- TechDouala : état « Occasion » + import du catalogue boutique (liste du 22/09/2026)
-- Généré par scripts/catalogue-2026-09.mjs — ${CATALOGUE.length} produits, ${variantCount} variantes.
-- Les produits sont importés MASQUÉS avec un stock à 0 : le gérant saisit le stock réel
-- et publie depuis l'espace gérant (Catalogue & stock). Ré-exécutable sans doublon.
-- ============================================================================

begin;

-- Nouvel état « Occasion » (non scellé / seconde main)
alter table public.products drop constraint if exists products_condition_check;
alter table public.products add constraint products_condition_check
  check (condition in ('Neuf', 'Reconditionné', 'Occasion'));

-- Marques manquantes
insert into public.brands (slug, name, position) values
  ('sharp', 'Sharp', 12), ('kyocera', 'Kyocera', 13)
on conflict (slug) do nothing;

${out.join("\n\n")}

commit;
`;

writeFileSync(new URL("../supabase/migrations/0003_occasion_catalogue.sql", import.meta.url), sql);
console.log(`${CATALOGUE.length} produits, ${variantCount} variantes → supabase/migrations/0003_occasion_catalogue.sql`);
