-- ============================================================================
-- TechDouala : photos d'aperçu des 8 téléphones du catalogue (30/09/2026)
-- À exécuter dans Supabase > SQL Editor. Peut être relancé sans doublon.
--   - les fichiers sont servis par le site lui-même : public/produits/*.webp ;
--   - visuels officiels des marques (Samsung, Apple, Xiaomi, Tecno), Wikimedia
--     Commons pour le Pixel 9 (CC BY-SA 4.0, Mliu92) et Kimovil pour l'Aquos R8 ;
--   - à remplacer par tes propres photos depuis l'espace gérant avant la mise
--     en ligne (le formulaire produit remplace toute la galerie).
-- ============================================================================

begin;

with photos (slug, url, position) as (
  values
    ('galaxy-s25-ultra',       '/produits/galaxy-s25-ultra.webp',       0),
    ('galaxy-s25-ultra',       '/produits/galaxy-s25-ultra-2.webp',     1),
    ('galaxy-s24',             '/produits/galaxy-s24.webp',             0),
    ('galaxy-s24',             '/produits/galaxy-s24-2.webp',           1),
    ('iphone-13-occasion',     '/produits/iphone-13.webp',              0),
    ('iphone-12-occasion',     '/produits/iphone-12.webp',              0),
    ('pixel-9-occasion',       '/produits/pixel-9.webp',                0),
    ('pixel-9-occasion',       '/produits/pixel-9-2.webp',              1),
    ('redmi-note-15-pro-plus', '/produits/redmi-note-15-pro-plus.webp', 0),
    ('camon-50-ultra',         '/produits/camon-50-ultra.webp',         0),
    ('sharp-r8-occasion',      '/produits/sharp-aquos-r8.webp',         0)
),
cleared as (
  -- Relance sans doublon : on retire d'abord les photos d'aperçu déjà posées.
  delete from public.product_images i
   using public.products p
   where p.id = i.product_id
     and p.slug in (select slug from photos)
     and i.url like '/produits/%'
  returning i.id
)
insert into public.product_images (product_id, url, position)
select p.id, ph.url, ph.position
  from photos ph
  join public.products p on p.slug = ph.slug
 where (select count(*) from cleared) >= 0;

commit;

-- Contrôle : chaque téléphone doit avoir au moins une photo.
select p.name, count(i.id) as photos
  from public.products p
  left join public.product_images i on i.product_id = p.id
 group by p.name
 order by p.name;
