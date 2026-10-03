-- ============================================================================
-- TechDouala : avis clients (cahier 5.9) et badges de fidélité (cahier 5.8)
-- À exécuter dans Supabase > SQL Editor (après 0001 à 0004).
--   - seul un client qui a acheté le produit peut le noter, une fois ;
--   - la note moyenne du produit est recalculée à chaque avis ;
--   - les badges se débloquent tout seuls à partir des achats et des paiements.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Avis
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  order_id     uuid references public.orders (id) on delete set null,
  rating       int  not null check (rating between 1 and 5),
  comment      text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "avis lecture" on public.reviews;
drop policy if exists "avis moderation" on public.reviews;

create policy "avis lecture" on public.reviews for select
  using (is_published or user_id = auth.uid() or public.is_staff());
create policy "avis moderation" on public.reviews for all
  using (public.is_staff()) with check (public.is_staff());

/** Recalcule la note moyenne et le nombre d'avis affichés sur la fiche produit. */
create or replace function public.refresh_product_rating(p_product uuid)
returns void language sql volatile security definer set search_path = '' as $$
  update public.products p
     set rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r
                             where r.product_id = p_product and r.is_published), 0),
         review_count = (select count(*) from public.reviews r
                          where r.product_id = p_product and r.is_published)
   where p.id = p_product;
$$;

/** Dépose un avis : réservé à un client qui a acheté ce produit (commande non annulée). */
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
   where o.user_id = v_user and i.product_id = v_product and o.status <> 'annulee'
   order by o.created_at desc
   limit 1;
  if v_order is null then
    raise exception 'Seuls les clients qui ont acheté ce produit peuvent le noter.';
  end if;

  insert into public.reviews (product_id, user_id, order_id, rating, comment)
  values (v_product, v_user, v_order, v_rating, nullif(trim(p ->> 'comment'), ''))
  on conflict (product_id, user_id) do update
    set rating = excluded.rating, comment = excluded.comment, created_at = now();

  perform public.refresh_product_rating(v_product);
  return jsonb_build_object('ok', true);
end $$;

/** Modération : supprimer un avis et remettre la note du produit à jour (personnel). */
create or replace function public.delete_review(p_review uuid)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare
  v_product uuid;
begin
  if not public.is_staff() then raise exception 'Accès refusé.'; end if;
  delete from public.reviews where id = p_review returning product_id into v_product;
  if v_product is null then raise exception 'Avis introuvable.'; end if;
  perform public.refresh_product_rating(v_product);
end $$;

/** Modération : publier ou masquer un avis (personnel). */
create or replace function public.set_review_published(p_review uuid, p_published boolean)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare
  v_product uuid;
begin
  if not public.is_staff() then raise exception 'Accès refusé.'; end if;
  update public.reviews set is_published = p_published where id = p_review returning product_id into v_product;
  if v_product is null then raise exception 'Avis introuvable.'; end if;
  perform public.refresh_product_rating(v_product);
end $$;

-- ----------------------------------------------------------------------------
-- 2. Badges de fidélité (symboliques au lancement, cahier 5.8)
-- ----------------------------------------------------------------------------
create table if not exists public.loyalty_badges (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  badge      text not null check (badge in ('premier_achat', 'premiere_echeance', 'credit_solde', 'client_fidele', 'premier_avis')),
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge)
);

alter table public.loyalty_badges enable row level security;

drop policy if exists "badges lecture" on public.loyalty_badges;
create policy "badges lecture" on public.loyalty_badges for select
  using (user_id = auth.uid() or public.is_staff());

/**
 * Attribue les badges mérités et renvoie la liste du client.
 * Les badges sont calculés à partir des commandes, des échéances et des avis :
 * aucune saisie manuelle, aucun risque d'oubli.
 */
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
       exists (select 1 from public.orders where user_id = v_user and status <> 'annulee')),
      ('client_fidele',
       (select count(*) from public.orders where user_id = v_user and status <> 'annulee') >= 3),
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

revoke all on function public.create_review(jsonb) from public, anon, authenticated;
revoke all on function public.set_review_published(uuid, boolean) from public, anon, authenticated;
revoke all on function public.delete_review(uuid) from public, anon, authenticated;
revoke all on function public.refresh_product_rating(uuid) from public, anon, authenticated;
revoke all on function public.my_badges() from public, anon, authenticated;
grant execute on function public.create_review(jsonb) to authenticated;
grant execute on function public.set_review_published(uuid, boolean) to authenticated;
grant execute on function public.delete_review(uuid) to authenticated;
grant execute on function public.my_badges() to authenticated;

commit;
