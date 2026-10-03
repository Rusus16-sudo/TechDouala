-- ============================================================================
-- TechDouala : retrait de la mention « Vérifié IMEI » des fiches produits
-- À exécuter dans Supabase > SQL Editor (après 0010).
--   Le site n'affiche plus rien sur l'IMEI. Les colonnes requires_imei et
--   order_items.imei restent en place (la fonction pos_sale les lit encore),
--   elles ne servent simplement plus.
-- ============================================================================

begin;

update public.products
   set description = regexp_replace(
         regexp_replace(description, 'Vérifié IMEI avant la vente et garanti', 'Garanti', 'g'),
         ' et vérifié IMEI avant la vente\.', '.', 'g'),
       highlights = coalesce(
         (select array_agg(h order by n) from unnest(highlights) with ordinality as t(h, n) where h !~* 'imei'),
         '{}')
 where description ~* 'imei'
    or array_to_string(highlights, ' ') ~* 'imei';

commit;

-- Contrôle : doit renvoyer 0 ligne.
select slug, description, highlights
  from public.products
 where description ~* 'imei' or array_to_string(highlights, ' ') ~* 'imei';
