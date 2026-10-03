-- ============================================================================
-- TechDouala : un produit par rayon encore vide (02/10/2026)
-- À exécuter dans Supabase > SQL Editor. Peut être relancé sans doublon.
--   Tablettes, téléphones à touches, écouteurs, montres, chargeurs, powerbanks,
--   coques : produits d'aperçu, publiés, avec prix indicatifs et stock fictif
--   à ajuster depuis l'espace gérant. Photos servies par le site
--   (public/produits/*.webp), visuels officiels Samsung, HMD (Nokia) et Anker.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Produits
-- ----------------------------------------------------------------------------
insert into public.products
  (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_published)
values
  ('galaxy-tab-a9-plus', 'Galaxy Tab A9+', 'samsung', 'tablettes', 'Neuf',
   'Tablette Samsung 11 pouces pour les cours, les vidéos et le travail. Neuve, scellée, garantie 12 mois en boutique à Douala.',
   '[{"label":"Écran","value":"11 pouces, 90 Hz"},{"label":"Connexion","value":"Wi-Fi"},{"label":"Batterie","value":"7 040 mAh"},{"label":"Stockage","value":"Extensible par microSD"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb,
   '[]'::jsonb, 4, false, false, 12, true),

  ('nokia-105-4g', 'Nokia 105 4G', 'nokia', 'telephones-a-touches', 'Neuf',
   'Téléphone à touches robuste et simple : batterie qui tient plusieurs jours, double SIM et radio FM. Idéal en second téléphone.',
   '[{"label":"Réseau","value":"4G"},{"label":"SIM","value":"Double SIM"},{"label":"Batterie","value":"1 450 mAh"},{"label":"Radio","value":"FM"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb,
   '[]'::jsonb, null, false, true, 6, true),

  ('galaxy-buds-fe', 'Galaxy Buds FE', 'samsung', 'ecouteurs-casques', 'Neuf',
   'Écouteurs sans fil Samsung avec réduction de bruit active et un son riche, confortables toute la journée.',
   '[{"label":"Réduction de bruit","value":"Active"},{"label":"Autonomie","value":"Jusqu''à 21 h avec le boîtier"},{"label":"Connexion","value":"Bluetooth 5.2"},{"label":"Compatibilité","value":"Android et iPhone"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb,
   '[]'::jsonb, null, false, false, 12, true),

  ('galaxy-watch-fe', 'Galaxy Watch FE', 'samsung', 'montres-connectees', 'Neuf',
   'Montre connectée Samsung 40 mm : suivi du sommeil, fréquence cardiaque, ECG et détection de chute, avec un verre saphir résistant.',
   '[{"label":"Écran","value":"1,2 pouce Super AMOLED"},{"label":"Verre","value":"Saphir"},{"label":"Autonomie","value":"Jusqu''à 40 h"},{"label":"Compatibilité","value":"Android"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb,
   '[]'::jsonb, null, false, false, 12, true),

  ('chargeur-samsung-25w', 'Chargeur Samsung 25 W', 'samsung', 'chargeurs-cables', 'Neuf',
   'Chargeur rapide USB-C d''origine Samsung (Super Fast Charging). Câble non inclus.',
   '[{"label":"Puissance","value":"25 W"},{"label":"Sortie","value":"USB-C"},{"label":"Prise","value":"Européenne (2 broches)"},{"label":"Compatibilité","value":"Galaxy et appareils USB-C"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb,
   '[]'::jsonb, null, false, false, 6, true),

  ('anker-313-powercore-10k', 'Anker 313 PowerCore 10K', 'anker', 'powerbanks', 'Neuf',
   'Batterie externe 10 000 mAh, fine et légère : environ deux recharges complètes d''un smartphone, à glisser dans le sac.',
   '[{"label":"Capacité","value":"10 000 mAh"},{"label":"Ports","value":"USB-A, USB-C et micro-USB"},{"label":"Charge","value":"Jusqu''à 12 W"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb,
   '[]'::jsonb, null, false, false, 12, true),

  ('coque-galaxy-s24-transparente', 'Coque transparente Galaxy S24', 'samsung', 'protection', 'Neuf',
   'Coque officielle Samsung, fine et transparente : elle protège des chocs du quotidien sans cacher la couleur du téléphone.',
   '[{"label":"Compatibilité","value":"Galaxy S24"},{"label":"Matière","value":"Polycarbonate et TPU"},{"label":"Couleur","value":"Transparente"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb,
   '[]'::jsonb, null, false, false, 3, true)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- 2. Variantes (prix indicatifs en FCFA, stock d'aperçu)
-- ----------------------------------------------------------------------------
insert into public.product_variants (product_id, sku, label, price, stock, position)
select p.id, v.sku, v.label, v.price, v.stock, v.position
  from (values
    ('galaxy-tab-a9-plus',            'v1', '64 Go · Wi-Fi',      135000,  3, 0),
    ('galaxy-tab-a9-plus',            'v2', '128 Go · Wi-Fi',     160000,  2, 1),
    ('nokia-105-4g',                  'v1', null,                  15000, 10, 0),
    ('galaxy-buds-fe',                'v1', null,                  55000,  4, 0),
    ('galaxy-watch-fe',               'v1', '40 mm · Bluetooth',   95000,  3, 0),
    ('chargeur-samsung-25w',          'v1', null,                  12000, 15, 0),
    ('anker-313-powercore-10k',       'v1', null,                  15000,  8, 0),
    ('coque-galaxy-s24-transparente', 'v1', null,                  10000, 10, 0)
  ) as v (slug, sku, label, price, stock, position)
  join public.products p on p.slug = v.slug
on conflict (product_id, sku) do nothing;

-- ----------------------------------------------------------------------------
-- 3. Photos (relance sans doublon : les photos d'aperçu sont remplacées)
-- ----------------------------------------------------------------------------
delete from public.product_images i
 using public.products p
 where p.id = i.product_id
   and p.slug in ('galaxy-tab-a9-plus', 'nokia-105-4g', 'galaxy-buds-fe', 'galaxy-watch-fe',
                  'chargeur-samsung-25w', 'anker-313-powercore-10k', 'coque-galaxy-s24-transparente')
   and i.url like '/produits/%';

insert into public.product_images (product_id, url, position)
select p.id, ph.url, 0
  from (values
    ('galaxy-tab-a9-plus',            '/produits/galaxy-tab-a9-plus.webp'),
    ('nokia-105-4g',                  '/produits/nokia-105-4g.webp'),
    ('galaxy-buds-fe',                '/produits/galaxy-buds-fe.webp'),
    ('galaxy-watch-fe',               '/produits/galaxy-watch-fe.webp'),
    ('chargeur-samsung-25w',          '/produits/chargeur-samsung-25w.webp'),
    ('anker-313-powercore-10k',       '/produits/anker-313-powercore-10k.webp'),
    ('coque-galaxy-s24-transparente', '/produits/coque-galaxy-s24-transparente.webp')
  ) as ph (slug, url)
  join public.products p on p.slug = ph.slug;

commit;

-- Contrôle : chaque rayon doit maintenant avoir au moins un produit avec photo.
select c.name as rayon, count(distinct p.id) as produits, count(i.id) as photos
  from public.categories c
  left join public.products p on p.category_slug = c.slug and p.is_published
  left join public.product_images i on i.product_id = p.id
 group by c.name, c.position
 order by c.position;
