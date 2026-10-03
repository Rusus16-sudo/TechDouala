-- ============================================================================
-- Démo vitrine : publie 8 produits avec du stock, deux promotions, un code promo
-- et une actualité, le temps de juger le rendu du site.
-- À lancer dans Supabase > SQL Editor. Réversible : voir le bloc en bas.
-- ============================================================================

begin;

-- Stock de démonstration sur 8 modèles représentatifs
update public.product_variants v
   set stock = 5
  from public.products p
 where p.id = v.product_id
   and p.slug in ('iphone-13-occasion', 'iphone-12-occasion', 'galaxy-s25-ultra', 'galaxy-s24',
                  'pixel-9-occasion', 'redmi-note-15-pro-plus', 'camon-50-ultra', 'sharp-r8-occasion');

update public.products
   set is_published = true,
       is_featured = slug in ('galaxy-s25-ultra', 'iphone-13-occasion', 'pixel-9-occasion', 'redmi-note-15-pro-plus'),
       is_flash = slug in ('camon-50-ultra', 'sharp-r8-occasion', 'galaxy-s24')
 where slug in ('iphone-13-occasion', 'iphone-12-occasion', 'galaxy-s25-ultra', 'galaxy-s24',
                'pixel-9-occasion', 'redmi-note-15-pro-plus', 'camon-50-ultra', 'sharp-r8-occasion');

-- Prix barrés sur les ventes flash (pour voir les badges de remise)
update public.product_variants v
   set old_price = round(v.price * 1.15 / 1000) * 1000
  from public.products p
 where p.id = v.product_id and p.is_flash and v.old_price is null;

-- Prix plancher de démonstration (visible du propriétaire seulement)
insert into public.product_floor_prices (variant_id, floor_price)
select v.id, round(v.price * 0.9 / 1000) * 1000
  from public.product_variants v
  join public.products p on p.id = v.product_id
 where p.is_published
on conflict (variant_id) do nothing;

-- Un code promo et une actualité
insert into public.promo_codes (code, description, kind, value, min_order, max_uses_per_phone, is_active)
values ('BIENVENUE5', 'Démo : 5 % de remise', 'pourcentage', 5, 50000, 1, true)
on conflict (code) do nothing;

insert into public.news (title, body, cta_label, cta_href, placement, is_published)
values ('Arrivage Samsung et Pixel', 'Stock limité, livraison le jour même à Douala.', 'Voir les ventes flash', '/ventes-flash', 'bandeau', true)
on conflict do nothing;

commit;

-- ----------------------------------------------------------------------------
-- Pour tout remettre comme avant (après la séance de design) :
-- ----------------------------------------------------------------------------
-- update public.products set is_published = false, is_featured = false, is_flash = false;
-- update public.product_variants set stock = 0, old_price = null;
-- delete from public.product_floor_prices;
-- delete from public.promo_codes where code = 'BIENVENUE5';
-- delete from public.news where title = 'Arrivage Samsung et Pixel';
