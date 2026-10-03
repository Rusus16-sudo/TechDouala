-- ============================================================================
-- TechDouala : IMEI des téléphones remis pour une commande passée sur le site
-- À exécuter dans Supabase > SQL Editor (après 0009).
--   La vente au comptoir enregistre déjà l'IMEI de chaque appareil ; une commande
--   en ligne doit pouvoir le recevoir aussi avant la remise (cahier : chaque
--   appareil vendu est vérifié IMEI, le client le compare avec *#06#).
-- ============================================================================

begin;

/**
 * Enregistre l'IMEI d'une ligne de commande (personnel uniquement).
 * Un numéro de 15 chiffres par appareil : pour 2 téléphones identiques, 2 numéros séparés
 * par une virgule. Vide : efface la saisie.
 */
create or replace function public.set_order_item_imei(p_item uuid, p_imei text)
returns text language plpgsql volatile security definer set search_path = '' as $$
declare
  v_qty    int;
  v_status text;
  v_list   text[];
  v_clean  text;
begin
  if not public.is_staff() then raise exception 'Accès refusé.'; end if;

  select i.qty, o.status into v_qty, v_status
    from public.order_items i
    join public.orders o on o.id = i.order_id
   where i.id = p_item
     for update of i;
  if not found then raise exception 'Article introuvable.'; end if;
  if v_status = 'annulee' then raise exception 'Cette commande est annulée.'; end if;

  if coalesce(trim(p_imei), '') = '' then
    update public.order_items set imei = null where id = p_item;
    return null;
  end if;

  select array_agg(regexp_replace(x, '\D', '', 'g'))
    into v_list
    from unnest(regexp_split_to_array(p_imei, '[,;\s]+')) as x
   where trim(x) <> '';

  if exists (select 1 from unnest(v_list) as n where n !~ '^[0-9]{15}$') then
    raise exception 'IMEI invalide : 15 chiffres par appareil (compose *#06# sur le téléphone).';
  end if;
  if array_length(v_list, 1) <> v_qty then
    raise exception 'Il faut % IMEI pour cette ligne (un par appareil).', v_qty;
  end if;

  v_clean := array_to_string(v_list, ', ');
  update public.order_items set imei = v_clean where id = p_item;
  return v_clean;
end $$;

revoke all on function public.set_order_item_imei(uuid, text) from public, anon, authenticated;
grant execute on function public.set_order_item_imei(uuid, text) to authenticated;

commit;
