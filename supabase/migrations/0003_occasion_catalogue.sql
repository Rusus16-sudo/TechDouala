-- ============================================================================
-- TechDouala : état « Occasion » + import du catalogue boutique (liste du 22/09/2026)
-- Généré par scripts/catalogue-2026-09.mjs — 104 produits, 148 variantes.
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

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s26-ultra', 'Galaxy S26 Ultra', 'samsung', 'smartphones', 'Neuf', 'Galaxy S26 Ultra neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"Double SIM"},{"label":"Origine","value":"Royaume-Uni"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, true, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 850000, 0, 0 from public.products where slug = 'galaxy-s26-ultra'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s25-ultra', 'Galaxy S25 Ultra', 'samsung', 'smartphones', 'Neuf', 'Galaxy S25 Ultra neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"Selon la version (voir le choix de stockage)"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, true, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go · Double SIM', 600000, 0, 0 from public.products where slug = 'galaxy-s25-ultra'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '512 Go · SIM + eSIM', 650000, 0, 1 from public.products where slug = 'galaxy-s25-ultra'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s25-fe', 'Galaxy S25 FE', 'samsung', 'smartphones', 'Neuf', 'Galaxy S25 FE neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 350000, 0, 0 from public.products where slug = 'galaxy-s25-fe'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s23-fe', 'Galaxy S23 FE', 'samsung', 'smartphones', 'Neuf', 'Galaxy S23 FE neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 200000, 0, 0 from public.products where slug = 'galaxy-s23-fe'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s24', 'Galaxy S24', 'samsung', 'smartphones', 'Neuf', 'Galaxy S24 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 325000, 0, 0 from public.products where slug = 'galaxy-s24'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s23', 'Galaxy S23', 'samsung', 'smartphones', 'Neuf', 'Galaxy S23 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 250000, 0, 0 from public.products where slug = 'galaxy-s23'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s25-plus', 'Galaxy S25+', 'samsung', 'smartphones', 'Neuf', 'Galaxy S25+ neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 450000, 0, 0 from public.products where slug = 'galaxy-s25-plus'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s24-plus', 'Galaxy S24+', 'samsung', 'smartphones', 'Neuf', 'Galaxy S24+ neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 350000, 0, 0 from public.products where slug = 'galaxy-s24-plus'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s23-ultra', 'Galaxy S23 Ultra', 'samsung', 'smartphones', 'Neuf', 'Galaxy S23 Ultra neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 400000, 0, 0 from public.products where slug = 'galaxy-s23-ultra'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s24-ultra', 'Galaxy S24 Ultra', 'samsung', 'smartphones', 'Neuf', 'Galaxy S24 Ultra neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 500000, 0, 0 from public.products where slug = 'galaxy-s24-ultra'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '1 To', 550000, 0, 1 from public.products where slug = 'galaxy-s24-ultra'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-z-flip4', 'Galaxy Z Flip4', 'samsung', 'smartphones', 'Neuf', 'Galaxy Z Flip4 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 200000, 0, 0 from public.products where slug = 'galaxy-z-flip4'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '512 Go', 225000, 0, 1 from public.products where slug = 'galaxy-z-flip4'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-z-flip6', 'Galaxy Z Flip6', 'samsung', 'smartphones', 'Neuf', 'Galaxy Z Flip6 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 350000, 0, 0 from public.products where slug = 'galaxy-z-flip6'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-z-fold7', 'Galaxy Z Fold7', 'samsung', 'smartphones', 'Neuf', 'Galaxy Z Fold7 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"16 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 16, true, true, 12, true, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '1 To', 900000, 0, 0 from public.products where slug = 'galaxy-z-fold7'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-z-fold6', 'Galaxy Z Fold6', 'samsung', 'smartphones', 'Neuf', 'Galaxy Z Fold6 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 700000, 0, 0 from public.products where slug = 'galaxy-z-fold6'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-z-fold5', 'Galaxy Z Fold5', 'samsung', 'smartphones', 'Neuf', 'Galaxy Z Fold5 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 500000, 0, 0 from public.products where slug = 'galaxy-z-fold5'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-z-fold4', 'Galaxy Z Fold4', 'samsung', 'smartphones', 'Neuf', 'Galaxy Z Fold4 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud / États-Unis"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 400000, 0, 0 from public.products where slug = 'galaxy-z-fold4'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-s22-ultra', 'Galaxy S22 Ultra', 'samsung', 'smartphones', 'Neuf', 'Galaxy S22 Ultra neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 325000, 0, 0 from public.products where slug = 'galaxy-s22-ultra'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '512 Go', 350000, 0, 1 from public.products where slug = 'galaxy-s22-ultra'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a57', 'Galaxy A57', 'samsung', 'smartphones', 'Neuf', 'Galaxy A57 neuf. Garanti 3 mois en boutique à Douala.', '[{"label":"SIM","value":"Double SIM"},{"label":"Origine","value":"Royaume-Uni"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go · 8 Go RAM', 295000, 0, 0 from public.products where slug = 'galaxy-a57'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go · 12 Go RAM', 310000, 0, 1 from public.products where slug = 'galaxy-a57'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a26', 'Galaxy A26', 'samsung', 'smartphones', 'Neuf', 'Galaxy A26 neuf. Garanti 3 mois en boutique à Douala.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"Double SIM"},{"label":"Origine","value":"Royaume-Uni"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 140000, 0, 0 from public.products where slug = 'galaxy-a26'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-m23', 'Galaxy M23', 'samsung', 'smartphones', 'Neuf', 'Galaxy M23 neuf. Garanti 3 mois en boutique à Douala.', '[{"label":"RAM","value":"4 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 4, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 95000, 0, 0 from public.products where slug = 'galaxy-m23'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-m33', 'Galaxy M33', 'samsung', 'smartphones', 'Neuf', 'Galaxy M33 neuf. Garanti 3 mois en boutique à Douala.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 100000, 0, 0 from public.products where slug = 'galaxy-m33'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-m36', 'Galaxy M36', 'samsung', 'smartphones', 'Neuf', 'Galaxy M36 neuf. Garanti 3 mois en boutique à Douala.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 120000, 0, 0 from public.products where slug = 'galaxy-m36'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a34', 'Galaxy A34', 'samsung', 'smartphones', 'Neuf', 'Galaxy A34 neuf. Garanti 3 mois en boutique à Douala.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 115000, 0, 0 from public.products where slug = 'galaxy-a34'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a36', 'Galaxy A36', 'samsung', 'smartphones', 'Neuf', 'Galaxy A36 neuf. Garanti 3 mois en boutique à Douala.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 160000, 0, 0 from public.products where slug = 'galaxy-a36'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a54', 'Galaxy A54', 'samsung', 'smartphones', 'Neuf', 'Galaxy A54 neuf. Garanti 3 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 145000, 0, 0 from public.products where slug = 'galaxy-a54'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a56-occasion', 'Galaxy A56', 'samsung', 'smartphones', 'Occasion', 'Galaxy A56 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion, avec boîte"}]'::jsonb, '[]'::jsonb, 8, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 185000, 0, 0 from public.products where slug = 'galaxy-a56-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a55-occasion', 'Galaxy A55', 'samsung', 'smartphones', 'Occasion', 'Galaxy A55 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion, avec boîte"}]'::jsonb, '[]'::jsonb, 8, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 175000, 0, 0 from public.products where slug = 'galaxy-a55-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a54-occasion', 'Galaxy A54', 'samsung', 'smartphones', 'Occasion', 'Galaxy A54 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion, avec boîte"}]'::jsonb, '[]'::jsonb, 8, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 140000, 0, 0 from public.products where slug = 'galaxy-a54-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a35-occasion', 'Galaxy A35', 'samsung', 'smartphones', 'Occasion', 'Galaxy A35 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion, avec boîte"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 155000, 0, 0 from public.products where slug = 'galaxy-a35-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a36-occasion', 'Galaxy A36', 'samsung', 'smartphones', 'Occasion', 'Galaxy A36 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"SIM + eSIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion, avec boîte"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 155000, 0, 0 from public.products where slug = 'galaxy-a36-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a24-occasion', 'Galaxy A24', 'samsung', 'smartphones', 'Occasion', 'Galaxy A24 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"4 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 4, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 85000, 0, 0 from public.products where slug = 'galaxy-a24-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-a34-occasion', 'Galaxy A34', 'samsung', 'smartphones', 'Occasion', 'Galaxy A34 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion, avec boîte"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 110000, 0, 0 from public.products where slug = 'galaxy-a34-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-m53-occasion', 'Galaxy M53', 'samsung', 'smartphones', 'Occasion', 'Galaxy M53 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"8 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 8, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 95000, 0, 0 from public.products where slug = 'galaxy-m53-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-m33-occasion', 'Galaxy M33', 'samsung', 'smartphones', 'Occasion', 'Galaxy M33 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 85000, 0, 0 from public.products where slug = 'galaxy-m33-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('galaxy-m44-occasion', 'Galaxy M44', 'samsung', 'smartphones', 'Occasion', 'Galaxy M44 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"6 Go"},{"label":"SIM","value":"1 SIM"},{"label":"Origine","value":"Corée du Sud"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 85000, 0, 0 from public.products where slug = 'galaxy-m44-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-18-pro', 'iPhone 18 Pro', 'apple', 'smartphones', 'Neuf', 'iPhone 18 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"SIM","value":"Nano-SIM physique (non activé)"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, true, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go · Marron', 1230000, 0, 0 from public.products where slug = 'iphone-18-pro'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go · Bleu', 1230000, 0, 1 from public.products where slug = 'iphone-18-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-18-pro-max', 'iPhone 18 Pro Max', 'apple', 'smartphones', 'Neuf', 'iPhone 18 Pro Max neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"SIM","value":"Nano-SIM physique (non activé)"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, true, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go · Marron', 1350000, 0, 0 from public.products where slug = 'iphone-18-pro-max'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go · Bleu', 1350000, 0, 1 from public.products where slug = 'iphone-18-pro-max'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v3', '256 Go · Blanc', 1330000, 0, 2 from public.products where slug = 'iphone-18-pro-max'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v4', '512 Go · Marron', 1550000, 0, 3 from public.products where slug = 'iphone-18-pro-max'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v5', '512 Go · Bleu', 1550000, 0, 4 from public.products where slug = 'iphone-18-pro-max'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-a5', 'Redmi A5', 'xiaomi', 'smartphones', 'Neuf', 'Redmi A5 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 4, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go · 3 Go RAM', 55000, 0, 0 from public.products where slug = 'redmi-a5'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '128 Go · 4 Go RAM', 65000, 0, 1 from public.products where slug = 'redmi-a5'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-a7', 'Redmi A7', 'xiaomi', 'smartphones', 'Neuf', 'Redmi A7 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"3 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 3, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 80000, 0, 0 from public.products where slug = 'redmi-a7'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-a7-pro', 'Redmi A7 Pro', 'xiaomi', 'smartphones', 'Neuf', 'Redmi A7 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"4 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 4, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 85000, 0, 0 from public.products where slug = 'redmi-a7-pro'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '128 Go', 90000, 0, 1 from public.products where slug = 'redmi-a7-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-15c', 'Redmi 15C', 'xiaomi', 'smartphones', 'Neuf', 'Redmi 15C neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go · 4 Go RAM', 95000, 0, 0 from public.products where slug = 'redmi-15c'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go · 8 Go RAM', 110000, 0, 1 from public.products where slug = 'redmi-15c'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-17', 'Redmi 17', 'xiaomi', 'smartphones', 'Neuf', 'Redmi 17 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go · 4 Go RAM', 115000, 0, 0 from public.products where slug = 'redmi-17'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go · 8 Go RAM', 130000, 0, 1 from public.products where slug = 'redmi-17'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-note-15', 'Redmi Note 15', 'xiaomi', 'smartphones', 'Neuf', 'Redmi Note 15 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go · 6 Go RAM', 125000, 0, 0 from public.products where slug = 'redmi-note-15'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go · 8 Go RAM', 145000, 0, 1 from public.products where slug = 'redmi-note-15'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-note-15-pro', 'Redmi Note 15 Pro', 'xiaomi', 'smartphones', 'Neuf', 'Redmi Note 15 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go · 8 Go RAM', 180000, 0, 0 from public.products where slug = 'redmi-note-15-pro'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '512 Go · 12 Go RAM', 210000, 0, 1 from public.products where slug = 'redmi-note-15-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-note-15-pro-plus', 'Redmi Note 15 Pro+', 'xiaomi', 'smartphones', 'Neuf', 'Redmi Note 15 Pro+ neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, true, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go · 8 Go RAM', 240000, 0, 0 from public.products where slug = 'redmi-note-15-pro-plus'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '512 Go · 12 Go RAM', 280000, 0, 1 from public.products where slug = 'redmi-note-15-pro-plus'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-note-14-pro', 'Redmi Note 14 Pro', 'xiaomi', 'smartphones', 'Neuf', 'Redmi Note 14 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"12 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 190000, 0, 0 from public.products where slug = 'redmi-note-14-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('redmi-note-14-pro-plus', 'Redmi Note 14 Pro+', 'xiaomi', 'smartphones', 'Neuf', 'Redmi Note 14 Pro+ neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 12, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go · 8 Go RAM', 220000, 0, 0 from public.products where slug = 'redmi-note-14-pro-plus'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '512 Go · 12 Go RAM', 240000, 0, 1 from public.products where slug = 'redmi-note-14-pro-plus'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pop-20', 'Pop 20', 'tecno', 'smartphones', 'Neuf', 'Pop 20 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"4 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 4, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 80000, 0, 0 from public.products where slug = 'pop-20'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '128 Go', 95000, 0, 1 from public.products where slug = 'pop-20'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pop-20c', 'Pop 20C', 'tecno', 'smartphones', 'Neuf', 'Pop 20C neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"4 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 4, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 75000, 0, 0 from public.products where slug = 'pop-20c'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('spark-50', 'Spark 50', 'tecno', 'smartphones', 'Neuf', 'Spark 50 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go · 4 Go RAM', 115000, 0, 0 from public.products where slug = 'spark-50'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go · 8 Go RAM', 130000, 0, 1 from public.products where slug = 'spark-50'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('spark-50-pro', 'Spark 50 Pro', 'tecno', 'smartphones', 'Neuf', 'Spark 50 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 140000, 0, 0 from public.products where slug = 'spark-50-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('camon-50', 'Camon 50', 'tecno', 'smartphones', 'Neuf', 'Camon 50 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 200000, 0, 0 from public.products where slug = 'camon-50'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('camon-50-pro', 'Camon 50 Pro', 'tecno', 'smartphones', 'Neuf', 'Camon 50 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 230000, 0, 0 from public.products where slug = 'camon-50-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('camon-50-slim', 'Camon 50 Slim', 'tecno', 'smartphones', 'Neuf', 'Camon 50 Slim neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 225000, 0, 0 from public.products where slug = 'camon-50-slim'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('camon-50-ultra', 'Camon 50 Ultra', 'tecno', 'smartphones', 'Neuf', 'Camon 50 Ultra neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"RAM","value":"8 Go"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, 8, false, true, 12, true, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 315000, 0, 0 from public.products where slug = 'camon-50-ultra'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-r8-occasion', 'Sharp R8', 'sharp', 'smartphones', 'Occasion', 'Sharp R8 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"8 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 8, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 100000, 0, 0 from public.products where slug = 'sharp-r8-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-zero6-occasion', 'Sharp Zero6', 'sharp', 'smartphones', 'Occasion', 'Sharp Zero6 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"6 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 6, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 55000, 0, 0 from public.products where slug = 'sharp-zero6-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-zero2-occasion', 'Sharp Zero2', 'sharp', 'smartphones', 'Occasion', 'Sharp Zero2 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"8 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 8, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 58000, 0, 0 from public.products where slug = 'sharp-zero2-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-zero-occasion', 'Sharp Zero', 'sharp', 'smartphones', 'Occasion', 'Sharp Zero d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"6 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 6, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 45000, 0, 0 from public.products where slug = 'sharp-zero-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-r3-occasion', 'Sharp R3', 'sharp', 'smartphones', 'Occasion', 'Sharp R3 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"6 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 6, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 53000, 0, 0 from public.products where slug = 'sharp-r3-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-r2-occasion', 'Sharp R2', 'sharp', 'smartphones', 'Occasion', 'Sharp R2 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"4 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 4, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 45000, 0, 0 from public.products where slug = 'sharp-r2-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-v45-occasion', 'Sharp V45', 'sharp', 'smartphones', 'Occasion', 'Sharp V45 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"4 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 4, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 45000, 0, 0 from public.products where slug = 'sharp-v45-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-wish2-occasion', 'Sharp Wish2', 'sharp', 'smartphones', 'Occasion', 'Sharp Wish2 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"4 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 4, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 45000, 0, 0 from public.products where slug = 'sharp-wish2-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-v48-occasion', 'Sharp V48', 'sharp', 'smartphones', 'Occasion', 'Sharp V48 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"3 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 3, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '32 Go', 37000, 0, 0 from public.products where slug = 'sharp-v48-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-v43-occasion', 'Sharp V43', 'sharp', 'smartphones', 'Occasion', 'Sharp V43 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"3 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 3, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '32 Go', 35000, 0, 0 from public.products where slug = 'sharp-v43-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-s1-occasion', 'Sharp S1', 'sharp', 'smartphones', 'Occasion', 'Sharp S1 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"3 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 3, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '32 Go', 35000, 0, 0 from public.products where slug = 'sharp-s1-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('sharp-r-compact-occasion', 'Sharp R Compact', 'sharp', 'smartphones', 'Occasion', 'Sharp R Compact d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"3 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 3, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '32 Go', 32000, 0, 0 from public.products where slug = 'sharp-r-compact-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('kyocera-s6-occasion', 'Kyocera S6', 'kyocera', 'smartphones', 'Occasion', 'Kyocera S6 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"3 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 3, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '32 Go', 35000, 0, 0 from public.products where slug = 'kyocera-s6-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('kyocera-x3-occasion', 'Kyocera X3', 'kyocera', 'smartphones', 'Occasion', 'Kyocera X3 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"3 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 3, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '32 Go', 35000, 0, 0 from public.products where slug = 'kyocera-x3-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('kyocera-v48-occasion', 'Kyocera V48', 'kyocera', 'smartphones', 'Occasion', 'Kyocera V48 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"RAM","value":"3 Go"},{"label":"Origine","value":"Japon"},{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, 3, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '32 Go', 33000, 0, 0 from public.products where slug = 'kyocera-v48-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-3-occasion', 'Pixel 3', 'google', 'smartphones', 'Occasion', 'Pixel 3 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 60000, 0, 0 from public.products where slug = 'pixel-3-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-3-xl-occasion', 'Pixel 3 XL', 'google', 'smartphones', 'Occasion', 'Pixel 3 XL d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 70000, 0, 0 from public.products where slug = 'pixel-3-xl-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-4-xl-occasion', 'Pixel 4 XL', 'google', 'smartphones', 'Occasion', 'Pixel 4 XL d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 75000, 0, 0 from public.products where slug = 'pixel-4-xl-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '128 Go', 80000, 0, 1 from public.products where slug = 'pixel-4-xl-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-6a-occasion', 'Pixel 6a', 'google', 'smartphones', 'Occasion', 'Pixel 6a d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 95000, 0, 0 from public.products where slug = 'pixel-6a-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-6-occasion', 'Pixel 6', 'google', 'smartphones', 'Occasion', 'Pixel 6 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 100000, 0, 0 from public.products where slug = 'pixel-6-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 115000, 0, 1 from public.products where slug = 'pixel-6-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-6-pro-occasion', 'Pixel 6 Pro', 'google', 'smartphones', 'Occasion', 'Pixel 6 Pro d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 130000, 0, 0 from public.products where slug = 'pixel-6-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 140000, 0, 1 from public.products where slug = 'pixel-6-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v3', '512 Go', 160000, 0, 2 from public.products where slug = 'pixel-6-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-7a-occasion', 'Pixel 7a', 'google', 'smartphones', 'Occasion', 'Pixel 7a d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 110000, 0, 0 from public.products where slug = 'pixel-7a-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-7-occasion', 'Pixel 7', 'google', 'smartphones', 'Occasion', 'Pixel 7 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 120000, 0, 0 from public.products where slug = 'pixel-7-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-7-pro-occasion', 'Pixel 7 Pro', 'google', 'smartphones', 'Occasion', 'Pixel 7 Pro d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 145000, 0, 0 from public.products where slug = 'pixel-7-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 175000, 0, 1 from public.products where slug = 'pixel-7-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-7-pro', 'Pixel 7 Pro', 'google', 'smartphones', 'Neuf', 'Pixel 7 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 155000, 0, 0 from public.products where slug = 'pixel-7-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-8-occasion', 'Pixel 8', 'google', 'smartphones', 'Occasion', 'Pixel 8 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 155000, 0, 0 from public.products where slug = 'pixel-8-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-8-pro-occasion', 'Pixel 8 Pro', 'google', 'smartphones', 'Occasion', 'Pixel 8 Pro d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 200000, 0, 0 from public.products where slug = 'pixel-8-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 240000, 0, 1 from public.products where slug = 'pixel-8-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-9-occasion', 'Pixel 9', 'google', 'smartphones', 'Occasion', 'Pixel 9 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 260000, 0, 0 from public.products where slug = 'pixel-9-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '128 Go · Rose', 265000, 0, 1 from public.products where slug = 'pixel-9-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-9', 'Pixel 9', 'google', 'smartphones', 'Neuf', 'Pixel 9 neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', null, 280000, 0, 0 from public.products where slug = 'pixel-9'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-9-pro-occasion', 'Pixel 9 Pro', 'google', 'smartphones', 'Occasion', 'Pixel 9 Pro d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', null, 300000, 0, 0 from public.products where slug = 'pixel-9-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-9-pro', 'Pixel 9 Pro', 'google', 'smartphones', 'Neuf', 'Pixel 9 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', null, 325000, 0, 0 from public.products where slug = 'pixel-9-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-9-pro-xl-occasion', 'Pixel 9 Pro XL', 'google', 'smartphones', 'Occasion', 'Pixel 9 Pro XL d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 335000, 0, 0 from public.products where slug = 'pixel-9-pro-xl-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-9-pro-xl', 'Pixel 9 Pro XL', 'google', 'smartphones', 'Neuf', 'Pixel 9 Pro XL neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 355000, 0, 0 from public.products where slug = 'pixel-9-pro-xl'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 410000, 0, 1 from public.products where slug = 'pixel-9-pro-xl'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-fold', 'Pixel Fold', 'google', 'smartphones', 'Neuf', 'Pixel Fold neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Origine","value":"Canada"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 260000, 0, 0 from public.products where slug = 'pixel-fold'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-9-pro-fold', 'Pixel 9 Pro Fold', 'google', 'smartphones', 'Neuf', 'Pixel 9 Pro Fold neuf, jamais activé. Garanti 12 mois en boutique à Douala.', '[{"label":"Origine","value":"Canada"},{"label":"Emballage","value":"Non activé"},{"label":"Activation","value":"Non activé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 500000, 0, 0 from public.products where slug = 'pixel-9-pro-fold'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-10-pro', 'Pixel 10 Pro', 'google', 'smartphones', 'Neuf', 'Pixel 10 Pro neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Origine","value":"Canada"},{"label":"Emballage","value":"Neuf en carton"}]'::jsonb, '[]'::jsonb, null, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', null, 500000, 0, 0 from public.products where slug = 'pixel-10-pro'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-10-pro-xl', 'Pixel 10 Pro XL', 'google', 'smartphones', 'Neuf', 'Pixel 10 Pro XL neuf. Garanti 12 mois en boutique à Douala.', '[{"label":"Origine","value":"Canada"},{"label":"Emballage","value":"Neuf, scellé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, true, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '256 Go', 550000, 0, 0 from public.products where slug = 'pixel-10-pro-xl'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('pixel-10-pro-fold', 'Pixel 10 Pro Fold', 'google', 'smartphones', 'Neuf', 'Pixel 10 Pro Fold neuf, jamais activé. Garanti 12 mois en boutique à Douala.', '[{"label":"Origine","value":"Canada"},{"label":"Emballage","value":"Non activé"},{"label":"Activation","value":"Non activé"}]'::jsonb, '[]'::jsonb, null, true, true, 12, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '512 Go', 750000, 0, 0 from public.products where slug = 'pixel-10-pro-fold'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-xr-occasion', 'iPhone XR', 'apple', 'smartphones', 'Occasion', 'iPhone XR d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 85000, 0, 0 from public.products where slug = 'iphone-xr-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '128 Go', 90000, 0, 1 from public.products where slug = 'iphone-xr-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-11-occasion', 'iPhone 11', 'apple', 'smartphones', 'Occasion', 'iPhone 11 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 100000, 0, 0 from public.products where slug = 'iphone-11-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '128 Go', 110000, 0, 1 from public.products where slug = 'iphone-11-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v3', '256 Go', 120000, 0, 2 from public.products where slug = 'iphone-11-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-11-pro-occasion', 'iPhone 11 Pro', 'apple', 'smartphones', 'Occasion', 'iPhone 11 Pro d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 120000, 0, 0 from public.products where slug = 'iphone-11-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 140000, 0, 1 from public.products where slug = 'iphone-11-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-11-pro-max-occasion', 'iPhone 11 Pro Max', 'apple', 'smartphones', 'Occasion', 'iPhone 11 Pro Max d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, false, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 130000, 0, 0 from public.products where slug = 'iphone-11-pro-max-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 150000, 0, 1 from public.products where slug = 'iphone-11-pro-max-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-12-occasion', 'iPhone 12', 'apple', 'smartphones', 'Occasion', 'iPhone 12 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '64 Go', 110000, 0, 0 from public.products where slug = 'iphone-12-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '128 Go', 120000, 0, 1 from public.products where slug = 'iphone-12-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v3', '256 Go', 140000, 0, 2 from public.products where slug = 'iphone-12-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-12-pro-occasion', 'iPhone 12 Pro', 'apple', 'smartphones', 'Occasion', 'iPhone 12 Pro d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 160000, 0, 0 from public.products where slug = 'iphone-12-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 175000, 0, 1 from public.products where slug = 'iphone-12-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v3', '512 Go', 190000, 0, 2 from public.products where slug = 'iphone-12-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-12-pro-max-occasion', 'iPhone 12 Pro Max', 'apple', 'smartphones', 'Occasion', 'iPhone 12 Pro Max d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 185000, 0, 0 from public.products where slug = 'iphone-12-pro-max-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 205000, 0, 1 from public.products where slug = 'iphone-12-pro-max-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v3', '512 Go', 225000, 0, 2 from public.products where slug = 'iphone-12-pro-max-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-13-mini-occasion', 'iPhone 13 mini', 'apple', 'smartphones', 'Occasion', 'iPhone 13 mini d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 145000, 0, 0 from public.products where slug = 'iphone-13-mini-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-13-occasion', 'iPhone 13', 'apple', 'smartphones', 'Occasion', 'iPhone 13 d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 165000, 0, 0 from public.products where slug = 'iphone-13-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 175000, 0, 1 from public.products where slug = 'iphone-13-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-13-pro-occasion', 'iPhone 13 Pro', 'apple', 'smartphones', 'Occasion', 'iPhone 13 Pro d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 225000, 0, 0 from public.products where slug = 'iphone-13-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 245000, 0, 1 from public.products where slug = 'iphone-13-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v3', '512 Go', 265000, 0, 2 from public.products where slug = 'iphone-13-pro-occasion'
on conflict (product_id, sku) do nothing;

insert into public.products (slug, name, brand_slug, category_slug, condition, description, specs, colors, ram_gb, is_5g, requires_imei, warranty_months, is_featured, is_published)
values ('iphone-13-pro-max-occasion', 'iPhone 13 Pro Max', 'apple', 'smartphones', 'Occasion', 'iPhone 13 Pro Max d''occasion, contrôlé par nos techniciens (écran, batterie, boutons, caméras). Garantie 3 mois en boutique.', '[{"label":"Emballage","value":"Occasion"}]'::jsonb, '[]'::jsonb, null, true, true, 3, false, false)
on conflict (slug) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v1', '128 Go', 255000, 0, 0 from public.products where slug = 'iphone-13-pro-max-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v2', '256 Go', 280000, 0, 1 from public.products where slug = 'iphone-13-pro-max-occasion'
on conflict (product_id, sku) do nothing;

insert into public.product_variants (product_id, sku, label, price, stock, position)
select id, 'v3', '512 Go', 300000, 0, 2 from public.products where slug = 'iphone-13-pro-max-occasion'
on conflict (product_id, sku) do nothing;

commit;
