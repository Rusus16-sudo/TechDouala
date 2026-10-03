-- ============================================================================
-- TechDouala : avis et badges d'achat réservés aux achats remis (02/10/2026)
-- À exécuter dans Supabase > SQL Editor (après 0008).
--   Depuis la commande sur WhatsApp, une commande enregistrée n'est pas encore
--   un achat : elle peut ne jamais être confirmée. Seule une commande « remise
--   au client » (statut livree) ouvre droit à un avis et aux badges d'achat.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Avis : uniquement sur un produit d'une commande remise
-- ----------------------------------------------------------------------------
create or replace function public.create_review(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_user    uuid := auth.uid();
  v_product uuid := (p ->> 'product_id')::uuid;
  v_rating  int  := (p ->> 'rating')::int;
  v_order   uuid;
begin
  if v_user is null then raise exception 'Connecte-toi pour laisser un avis.'; end if;
  if v_rating is null or v_rating < 1 or v_rating > 5 then raise exception 'Donne une note de 1 à 5 étoiles.'; end if;

  select o.id into v_order
    from public.orders o
    join public.order_items i on i.order_id = o.id
   where o.user_id = v_user and i.product_id = v_product and o.status = 'livree'
   order by o.created_at desc
   limit 1;
  if v_order is null then
    raise exception 'Tu pourras noter ce produit une fois ta commande remise.';
  end if;

  insert into public.reviews (product_id, user_id, order_id, rating, comment)
  values (v_product, v_user, v_order, v_rating, nullif(trim(p ->> 'comment'), ''))
  on conflict (product_id, user_id) do update
    set rating = excluded.rating, comment = excluded.comment, created_at = now();

  perform public.refresh_product_rating(v_product);
  return jsonb_build_object('ok', true);
end $$;

-- ----------------------------------------------------------------------------
-- 2. Badges : « Premier achat » et « Client fidèle » comptent les commandes remises
-- ----------------------------------------------------------------------------
create or replace function public.my_badges()
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then return '[]'::jsonb; end if;

  insert into public.loyalty_badges (user_id, badge)
  select v_user, b.badge
    from (values
      ('premier_achat',
       exists (select 1 from public.orders where user_id = v_user and status = 'livree')),
      ('client_fidele',
       (select count(*) from public.orders where user_id = v_user and status = 'livree') >= 3),
      ('premiere_echeance',
       exists (select 1 from public.installments i
                join public.credits c on c.id = i.credit_id
               where c.user_id = v_user and i.paid_at is not null)),
      ('credit_solde',
       exists (select 1 from public.credits where user_id = v_user and status = 'solde')),
      ('premier_avis',
       exists (select 1 from public.reviews where user_id = v_user))
    ) as b(badge, earned)
   where b.earned
  on conflict (user_id, badge) do nothing;

  return coalesce(
    (select jsonb_agg(jsonb_build_object('badge', badge, 'awarded_at', awarded_at) order by awarded_at)
       from public.loyalty_badges where user_id = v_user),
    '[]'::jsonb);
end $$;

-- Badges d'achat attribués à tort (aucune commande remise) : retirés.
delete from public.loyalty_badges b
 where b.badge in ('premier_achat', 'client_fidele')
   and (select count(*) from public.orders o where o.user_id = b.user_id and o.status = 'livree')
       < case b.badge when 'client_fidele' then 3 else 1 end;

revoke all on function public.create_review(jsonb) from public, anon, authenticated;
revoke all on function public.my_badges() from public, anon, authenticated;
grant execute on function public.create_review(jsonb) to authenticated;
grant execute on function public.my_badges() to authenticated;

commit;
