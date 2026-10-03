-- ============================================================================
-- TechDouala : schéma v2 (site e-commerce + espace gérant)
-- À exécuter une seule fois dans Supabase > SQL Editor.
-- ATTENTION : supprime l'ancienne base (122 produits d'exemple et tables vides),
-- conformément à la décision « repartir de zéro ».
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 0. Nettoyage de l'ancienne base
-- ----------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop table if exists
  public.sale_items, public.sales, public.credits, public.negotiations,
  public.reviews, public.trade_ins, public.products, public.users
  cascade;

-- ----------------------------------------------------------------------------
-- 1. Profils et rôles
-- ----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'client'
              check (role in ('client', 'vendeur', 'proprietaire', 'livreur')),
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now()
);

create or replace function public.my_role()
returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(public.my_role() in ('vendeur', 'proprietaire'), false)
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(public.my_role() = 'proprietaire', false)
$$;

-- Un profil est créé à chaque inscription.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone');
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seul le propriétaire peut changer un rôle (ou le SQL Editor, où auth.uid() est nul).
create or replace function public.guard_role_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_owner() then
    raise exception 'Seul le propriétaire peut modifier les rôles.';
  end if;
  return new;
end $$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_role_change();

-- ----------------------------------------------------------------------------
-- 2. Catalogue
-- ----------------------------------------------------------------------------
create table public.categories (
  slug      text primary key,
  name      text not null,
  position  int  not null default 0
);

create table public.brands (
  slug      text primary key,
  name      text not null,
  position  int  not null default 0
);

create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                text not null check (length(trim(name)) > 0),
  brand_slug          text not null references public.brands (slug) on update cascade,
  category_slug       text not null references public.categories (slug) on update cascade,
  condition           text not null default 'Neuf' check (condition in ('Neuf', 'Reconditionné')),
  description         text not null default '',
  highlights          text[] not null default '{}',
  specs               jsonb not null default '[]',   -- [{ "label": "Écran", "value": "6,1\"" }]
  colors              jsonb not null default '[]',   -- [{ "name": "Noir", "hex": "#1D1E22" }]
  ram_gb              int,
  is_5g               boolean not null default false,
  requires_imei       boolean not null default false, -- téléphones : chaque appareil vendu est vérifié IMEI
  warranty_months     int not null default 12 check (warranty_months >= 0),
  is_featured         boolean not null default false,
  is_flash            boolean not null default false,
  is_published        boolean not null default true,
  force_out_of_stock  boolean not null default false,  -- « Marquer en rupture » manuel
  rating              numeric(2, 1) not null default 0,
  review_count        int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  position    int  not null default 0
);

create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  sku         text not null,
  label       text,                                   -- « 128 Go », « 44 mm »… (null si variante unique)
  price       int  not null check (price > 0),
  old_price   int  check (old_price is null or old_price > price),
  stock       int  not null default 0 check (stock >= 0),
  position    int  not null default 0,
  unique (product_id, sku)
);

-- Prix plancher caché (cahier 5.3) : table séparée, lisible par le propriétaire seulement.
create table public.product_floor_prices (
  variant_id   uuid primary key references public.product_variants (id) on delete cascade,
  floor_price  int not null check (floor_price > 0)
);

create index on public.products (category_slug);
create index on public.products (brand_slug);
create index on public.product_variants (product_id);
create index on public.product_images (product_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Livraison
-- ----------------------------------------------------------------------------
create table public.delivery_zones (
  id        text primary key,
  name      text not null,
  fee       int  not null check (fee >= 0),
  areas     text[] not null default '{}',
  position  int  not null default 0
);

-- ----------------------------------------------------------------------------
-- 4. Commandes (en ligne et en boutique)
-- ----------------------------------------------------------------------------
create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  number            text not null unique,
  user_id           uuid references public.profiles (id) on delete set null,
  seller_id         uuid references public.profiles (id) on delete set null,  -- vente au comptoir
  channel           text not null default 'en_ligne' check (channel in ('en_ligne', 'boutique')),
  status            text not null default 'en_attente'
                    check (status in ('en_attente', 'confirmee', 'prete', 'en_livraison', 'livree', 'annulee')),
  payment_method    text not null check (payment_method in ('mtn-momo', 'orange-money', 'cash', 'credit')),
  payment_status    text not null default 'en_attente'
                    check (payment_status in ('en_attente', 'paye', 'echoue', 'rembourse')),
  customer_name     text not null,
  customer_phone    text not null,
  customer_email    text,
  delivery_mode     text not null check (delivery_mode in ('livraison', 'retrait')),
  delivery_zone_id  text references public.delivery_zones (id),
  delivery_area     text,
  delivery_address  text,
  delivery_day      date,
  delivery_slot     text,
  subtotal          int not null check (subtotal >= 0),
  discount          int not null default 0 check (discount >= 0),
  promo_code        text,
  delivery_fee      int not null default 0 check (delivery_fee >= 0),
  total             int not null check (total >= 0),
  notes             text,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

create table public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  product_id     uuid references public.products (id) on delete set null,
  variant_id     uuid references public.product_variants (id) on delete set null,
  product_name   text not null,
  variant_label  text,
  color          text,
  qty            int not null check (qty > 0),
  unit_price     int not null check (unit_price >= 0),
  total          int not null check (total >= 0),
  imei           text
);

create index on public.orders (created_at desc);
create index on public.orders (user_id);
create index on public.orders (promo_code);
create index on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- 5. Codes promo et actualités
-- ----------------------------------------------------------------------------
create table public.promo_codes (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,30}$'),
  description         text,
  kind                text not null check (kind in ('pourcentage', 'montant')),
  value               int  not null check (value > 0),
  min_order           int  not null default 0 check (min_order >= 0),
  category_slug       text references public.categories (slug) on update cascade,
  starts_at           timestamptz,
  ends_at             timestamptz,
  max_uses            int check (max_uses is null or max_uses > 0),
  max_uses_per_phone  int default 1 check (max_uses_per_phone is null or max_uses_per_phone > 0),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  check (kind <> 'pourcentage' or value <= 90)
);

create table public.news (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (length(trim(title)) > 0),
  body          text not null default '',
  image_url     text,
  cta_label     text,
  cta_href      text,
  placement     text not null default 'accueil' check (placement in ('bandeau', 'accueil')),
  starts_at     timestamptz,
  ends_at       timestamptz,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger news_touch before update on public.news
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Règles d'accès (RLS)
-- ----------------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.categories           enable row level security;
alter table public.brands               enable row level security;
alter table public.products             enable row level security;
alter table public.product_images       enable row level security;
alter table public.product_variants     enable row level security;
alter table public.product_floor_prices enable row level security;
alter table public.delivery_zones       enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.promo_codes          enable row level security;
alter table public.news                 enable row level security;

-- Profils : chacun voit le sien, le personnel voit tout, le propriétaire gère les rôles.
create policy "profil lecture" on public.profiles for select
  using (id = auth.uid() or public.is_staff());
create policy "profil modification" on public.profiles for update
  using (id = auth.uid() or public.is_owner()) with check (id = auth.uid() or public.is_owner());

-- Référentiels : lecture publique, écriture par le personnel (zones : propriétaire).
create policy "categories lecture" on public.categories for select using (true);
create policy "categories ecriture" on public.categories for all using (public.is_staff()) with check (public.is_staff());
create policy "marques lecture" on public.brands for select using (true);
create policy "marques ecriture" on public.brands for all using (public.is_staff()) with check (public.is_staff());
create policy "zones lecture" on public.delivery_zones for select using (true);
create policy "zones ecriture" on public.delivery_zones for all using (public.is_owner()) with check (public.is_owner());

-- Produits : les clients voient les produits publiés, le personnel voit et gère tout.
create policy "produits lecture" on public.products for select
  using (is_published or public.is_staff());
create policy "produits ecriture" on public.products for all
  using (public.is_staff()) with check (public.is_staff());

create policy "images lecture" on public.product_images for select
  using (public.is_staff() or exists (select 1 from public.products p where p.id = product_id and p.is_published));
create policy "images ecriture" on public.product_images for all
  using (public.is_staff()) with check (public.is_staff());

create policy "variantes lecture" on public.product_variants for select
  using (public.is_staff() or exists (select 1 from public.products p where p.id = product_id and p.is_published));
create policy "variantes ecriture" on public.product_variants for all
  using (public.is_staff()) with check (public.is_staff());

-- Prix plancher : propriétaire uniquement (jamais exposé au client ni au vendeur).
create policy "plancher proprietaire" on public.product_floor_prices for all
  using (public.is_owner()) with check (public.is_owner());

-- Commandes : le client voit les siennes, le personnel voit et met à jour. Création via place_order().
create policy "commandes lecture" on public.orders for select
  using (user_id = auth.uid() or public.is_staff());
create policy "commandes mise a jour" on public.orders for update
  using (public.is_staff()) with check (public.is_staff());
create policy "lignes lecture" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

-- Codes promo : gérés par le propriétaire ; les clients passent par check_promo().
create policy "promos proprietaire" on public.promo_codes for all
  using (public.is_owner()) with check (public.is_owner());

-- Actualités : publiques quand elles sont publiées et dans leur période ; gérées par le propriétaire.
create policy "actualites lecture" on public.news for select
  using (
    public.is_staff()
    or (is_published and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
  );
create policy "actualites ecriture" on public.news for all
  using (public.is_owner()) with check (public.is_owner());

-- ----------------------------------------------------------------------------
-- 7. Codes promo : évaluation (partagée par check_promo et place_order)
--    p_lines : [{ "category": "smartphones", "total": 522000, "floor_total": 480000, "flash": false }]
--    Règles : pas de remise sur les ventes flash ; jamais sous le prix plancher.
-- ----------------------------------------------------------------------------
create or replace function public.promo_evaluate(p_code text, p_lines jsonb, p_phone text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_promo     public.promo_codes;
  v_subtotal  int;
  v_eligible  int;
  v_floor     int;
  v_discount  int;
  v_uses      int;
begin
  select * into v_promo from public.promo_codes where code = upper(trim(p_code));
  if not found or not v_promo.is_active then
    return jsonb_build_object('ok', false, 'message', 'Ce code promo n''existe pas ou n''est plus actif.');
  end if;
  if v_promo.starts_at is not null and v_promo.starts_at > now() then
    return jsonb_build_object('ok', false, 'message', 'Ce code promo n''est pas encore valable.');
  end if;
  if v_promo.ends_at is not null and v_promo.ends_at <= now() then
    return jsonb_build_object('ok', false, 'message', 'Ce code promo a expiré.');
  end if;

  select coalesce(sum((l ->> 'total')::int), 0) into v_subtotal from jsonb_array_elements(p_lines) l;
  if v_subtotal < v_promo.min_order then
    return jsonb_build_object('ok', false, 'message',
      format('Ce code est valable dès %s FCFA d''achat.', to_char(v_promo.min_order, 'FM999G999G999')));
  end if;

  if v_promo.max_uses is not null then
    select count(*) into v_uses from public.orders where promo_code = v_promo.code and status <> 'annulee';
    if v_uses >= v_promo.max_uses then
      return jsonb_build_object('ok', false, 'message', 'Ce code promo a atteint sa limite d''utilisation.');
    end if;
  end if;
  if v_promo.max_uses_per_phone is not null and p_phone is not null then
    select count(*) into v_uses from public.orders
      where promo_code = v_promo.code and customer_phone = p_phone and status <> 'annulee';
    if v_uses >= v_promo.max_uses_per_phone then
      return jsonb_build_object('ok', false, 'message', 'Tu as déjà utilisé ce code promo.');
    end if;
  end if;

  select coalesce(sum((l ->> 'total')::int), 0), coalesce(sum((l ->> 'floor_total')::int), 0)
    into v_eligible, v_floor
    from jsonb_array_elements(p_lines) l
   where not coalesce((l ->> 'flash')::boolean, false)
     and (v_promo.category_slug is null or l ->> 'category' = v_promo.category_slug);

  if v_eligible = 0 then
    return jsonb_build_object('ok', false, 'message', 'Ce code ne s''applique pas aux produits de ton panier.');
  end if;

  v_discount := case v_promo.kind
    when 'pourcentage' then round(v_eligible * v_promo.value / 100.0)::int
    else least(v_promo.value, v_eligible)
  end;

  -- Ne jamais descendre sous le plancher (sans en révéler la valeur).
  if v_eligible - v_discount < v_floor then
    return jsonb_build_object('ok', false, 'message', 'Ce code ne s''applique pas aux produits de ton panier.');
  end if;

  return jsonb_build_object('ok', true, 'code', v_promo.code, 'discount', v_discount,
    'label', case v_promo.kind when 'pourcentage' then '-' || v_promo.value || ' %'
                               else '-' || to_char(v_promo.value, 'FM999G999G999') || ' FCFA' end);
end $$;

-- Construit les lignes d'évaluation à partir des articles { variant_id, qty }.
create or replace function public.promo_lines(p_items jsonb)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'category', p.category_slug,
           'total', v.price * (i ->> 'qty')::int,
           'floor_total', coalesce(f.floor_price, 0) * (i ->> 'qty')::int,
           'flash', p.is_flash)), '[]'::jsonb)
    from jsonb_array_elements(p_items) i
    join public.product_variants v on v.id = (i ->> 'variant_id')::uuid
    join public.products p on p.id = v.product_id and p.is_published
    left join public.product_floor_prices f on f.variant_id = v.id
$$;

-- Vérification d'un code depuis le panier (bouton « Appliquer »).
create or replace function public.check_promo(p_code text, p_items jsonb, p_phone text default null)
returns jsonb language sql stable security definer set search_path = '' as $$
  select public.promo_evaluate(p_code, public.promo_lines(p_items), p_phone)
$$;

-- ----------------------------------------------------------------------------
-- 8. Passage de commande en ligne : une seule transaction.
--    Prix, stock, frais de livraison et remise sont recalculés ici.
-- ----------------------------------------------------------------------------
create or replace function public.place_order(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_item      jsonb;
  v_qty       int;
  v_var       record;
  v_lines     jsonb := '[]'::jsonb;
  v_subtotal  int := 0;
  v_fee       int := 0;
  v_discount  int := 0;
  v_promo     jsonb;
  v_code      text;
  v_zone      public.delivery_zones;
  v_mode      text := p ->> 'mode';
  v_phone     text := p ->> 'phone';
  v_payment   text := p ->> 'payment';
  v_day       date;
  v_number    text;
  v_order_id  uuid;
  v_today     date := (now() at time zone 'Africa/Douala')::date;
begin
  -- Contrôles des coordonnées
  if coalesce(length(trim(p ->> 'full_name')), 0) < 3 then
    raise exception 'Indique ton nom et prénom.';
  end if;
  if v_phone is null or v_phone !~ '^6[0-9]{8}$' then
    raise exception 'Numéro de téléphone invalide.';
  end if;
  if v_payment not in ('mtn-momo', 'orange-money', 'cash') then
    raise exception 'Moyen de paiement non disponible. Le crédit nécessite un compte.';
  end if;
  if v_mode = 'livraison' then
    select * into v_zone from public.delivery_zones where id = p ->> 'zone';
    if not found then raise exception 'Zone de livraison inconnue.'; end if;
    if not ((p ->> 'area') = any (v_zone.areas)) then raise exception 'Quartier hors zone.'; end if;
    if coalesce(length(trim(p ->> 'address')), 0) < 5 then raise exception 'Adresse de livraison manquante.'; end if;
    v_fee := v_zone.fee;
    v_day := case p ->> 'day' when 'demain' then v_today + 1 else v_today end;
  elsif v_mode <> 'retrait' or v_mode is null then
    raise exception 'Mode de réception invalide.';
  end if;

  if coalesce(jsonb_typeof(p -> 'items'), '') <> 'array' or jsonb_array_length(p -> 'items') = 0 then
    raise exception 'Ton panier est vide.';
  end if;
  if jsonb_array_length(p -> 'items') > 30 then
    raise exception 'Trop d''articles dans le panier.';
  end if;

  -- Articles : verrouillage des variantes, contrôle et décrément du stock
  for v_item in select * from jsonb_array_elements(p -> 'items') loop
    v_qty := (v_item ->> 'qty')::int;
    if v_qty is null or v_qty < 1 or v_qty > 5 then
      raise exception 'Quantité invalide.';
    end if;

    select v.id, v.price, v.stock, v.label, p2.id as product_id, p2.name, p2.colors, p2.force_out_of_stock
      into v_var
      from public.product_variants v
      join public.products p2 on p2.id = v.product_id and p2.is_published
     where v.id = (v_item ->> 'variant_id')::uuid
       for update of v;

    if not found or v_var.force_out_of_stock then
      raise exception 'Un article de ton panier n''est plus disponible. Mets à jour ton panier.';
    end if;
    if v_var.stock < v_qty then
      raise exception 'Il ne reste que % % % en stock. Ajuste la quantité.', v_var.stock, v_var.name, coalesce(v_var.label, '');
    end if;

    update public.product_variants set stock = stock - v_qty where id = v_var.id;

    v_subtotal := v_subtotal + v_var.price * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_var.product_id, 'variant_id', v_var.id, 'product_name', v_var.name,
      'variant_label', v_var.label,
      -- La couleur n'est gardée que si elle existe pour ce produit.
      'color', (select c ->> 'name' from jsonb_array_elements(v_var.colors) c where c ->> 'name' = v_item ->> 'color' limit 1),
      'qty', v_qty, 'unit_price', v_var.price, 'total', v_var.price * v_qty);
  end loop;

  -- Code promo
  v_code := nullif(upper(trim(coalesce(p ->> 'promo_code', ''))), '');
  if v_code is not null then
    v_promo := public.promo_evaluate(v_code, public.promo_lines(p -> 'items'), v_phone);
    if not (v_promo ->> 'ok')::boolean then
      raise exception '%', v_promo ->> 'message';
    end if;
    v_discount := (v_promo ->> 'discount')::int;
  end if;

  -- Numéro de commande : TD + date + 4 chiffres
  loop
    v_number := 'TD' || to_char(v_today, 'YYYYMMDD') || lpad(floor(random() * 10000)::text, 4, '0');
    exit when not exists (select 1 from public.orders where number = v_number);
  end loop;

  insert into public.orders (
    number, user_id, channel, payment_method, customer_name, customer_phone, customer_email,
    delivery_mode, delivery_zone_id, delivery_area, delivery_address, delivery_day, delivery_slot,
    subtotal, discount, promo_code, delivery_fee, total
  ) values (
    v_number, auth.uid(), 'en_ligne', v_payment, trim(p ->> 'full_name'), v_phone, nullif(trim(p ->> 'email'), ''),
    v_mode, v_zone.id, case when v_mode = 'livraison' then p ->> 'area' end,
    case when v_mode = 'livraison' then trim(p ->> 'address') end, v_day,
    case when v_mode = 'livraison' then p ->> 'slot' end,
    v_subtotal, v_discount, v_code, v_fee, v_subtotal - v_discount + v_fee
  ) returning id into v_order_id;

  insert into public.order_items (order_id, product_id, variant_id, product_name, variant_label, color, qty, unit_price, total)
  select v_order_id, (l ->> 'product_id')::uuid, (l ->> 'variant_id')::uuid, l ->> 'product_name', l ->> 'variant_label',
         l ->> 'color', (l ->> 'qty')::int, (l ->> 'unit_price')::int, (l ->> 'total')::int
    from jsonb_array_elements(v_lines) l;

  return jsonb_build_object(
    'number', v_number, 'subtotal', v_subtotal, 'discount', v_discount, 'promo_code', v_code,
    'delivery_fee', v_fee, 'total', v_subtotal - v_discount + v_fee, 'lines', v_lines, 'delivery_day', v_day);
end $$;

-- Supabase donne par défaut le droit d'exécution à anon/authenticated : on le retire explicitement
-- aux fonctions internes (promo_lines renvoie les totaux planchers, qui ne doivent jamais sortir).
revoke all on function public.place_order(jsonb) from public, anon, authenticated;
revoke all on function public.check_promo(text, jsonb, text) from public, anon, authenticated;
revoke all on function public.promo_evaluate(text, jsonb, text) from public, anon, authenticated;
revoke all on function public.promo_lines(jsonb) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.guard_role_change() from public, anon, authenticated;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.check_promo(text, jsonb, text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 9. Stockage des photos produits (bucket public en lecture, écriture par le personnel)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produits', 'produits', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "produits photos lecture" on storage.objects;
drop policy if exists "produits photos ajout" on storage.objects;
drop policy if exists "produits photos modification" on storage.objects;
drop policy if exists "produits photos suppression" on storage.objects;

create policy "produits photos lecture" on storage.objects for select
  using (bucket_id = 'produits');
create policy "produits photos ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'produits' and public.is_staff());
create policy "produits photos modification" on storage.objects for update to authenticated
  using (bucket_id = 'produits' and public.is_staff());
create policy "produits photos suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'produits' and public.is_staff());

-- ----------------------------------------------------------------------------
-- 10. Données de référence
-- ----------------------------------------------------------------------------
insert into public.categories (slug, name, position) values
  ('smartphones', 'Smartphones', 1),
  ('tablettes', 'Tablettes', 2),
  ('telephones-a-touches', 'Téléphones à touches', 3),
  ('ecouteurs-casques', 'Écouteurs & casques', 4),
  ('montres-connectees', 'Montres connectées', 5),
  ('chargeurs-cables', 'Chargeurs & câbles', 6),
  ('powerbanks', 'Powerbanks', 7),
  ('protection', 'Coques & verres', 8);

insert into public.brands (slug, name, position) values
  ('apple', 'Apple', 1), ('samsung', 'Samsung', 2), ('google', 'Google Pixel', 3),
  ('xiaomi', 'Xiaomi', 4), ('tecno', 'Tecno', 5), ('infinix', 'Infinix', 6),
  ('itel', 'Itel', 7), ('honor', 'Honor', 8), ('oppo', 'Oppo', 9),
  ('nokia', 'Nokia', 10), ('anker', 'Anker', 11), ('autre', 'Autre', 99);

-- Montants de la maquette ; à ajuster par le propriétaire (cahier 13).
insert into public.delivery_zones (id, name, fee, areas, position) values
  ('zone-1', 'Zone 1', 2500, array['Akwa', 'Bonanjo', 'Bonapriso', 'Deido'], 1),
  ('zone-2', 'Zone 2', 3500, array['Makepe', 'Bonamoussadi', 'Kotto', 'Logbessou'], 2),
  ('zone-3', 'Zone 3', 4500, array['Bonabéri', 'PK', 'Yassa'], 3);

commit;
