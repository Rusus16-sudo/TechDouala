-- ============================================================================
-- TechDouala : crédit 40/60 (cahier 5.5 et 5.8)
-- À exécuter dans Supabase > SQL Editor (après 0001 à 0003).
--   - acompte de 40 % à l'achat, 60 % en 6 mensualités arrondies à la centaine ;
--   - un seul crédit actif, deux pour un « Bon payeur » ;
--   - aucune pénalité ; au-delà de 30 jours de retard, nouveau crédit bloqué.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Tables
-- ----------------------------------------------------------------------------
create table if not exists public.credits (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null unique references public.orders (id) on delete cascade,
  user_id        uuid not null references public.profiles (id) on delete cascade,
  total_amount   int not null check (total_amount > 0),
  down_payment   int not null check (down_payment > 0),   -- acompte de 40 %
  monthly_amount int not null check (monthly_amount > 0), -- mensualité arrondie à la centaine
  months         int not null default 6 check (months > 0),
  status         text not null default 'en_cours' check (status in ('en_cours', 'solde', 'annule')),
  down_paid_at   timestamptz,                             -- acompte encaissé (validé par la boutique)
  created_at     timestamptz not null default now()
);

create table if not exists public.installments (
  id             uuid primary key default gen_random_uuid(),
  credit_id      uuid not null references public.credits (id) on delete cascade,
  number         int not null check (number > 0),
  amount         int not null check (amount > 0),
  due_date       date not null,
  paid_at        timestamptz,
  payment_method text check (payment_method in ('mtn-momo', 'orange-money', 'cash')),
  validated_by   uuid references public.profiles (id) on delete set null,
  unique (credit_id, number)
);

create index if not exists credits_user_idx on public.credits (user_id);
create index if not exists installments_credit_idx on public.installments (credit_id);
create index if not exists installments_due_idx on public.installments (due_date) where paid_at is null;

alter table public.credits enable row level security;
alter table public.installments enable row level security;

drop policy if exists "credits lecture" on public.credits;
drop policy if exists "credits mise a jour" on public.credits;
drop policy if exists "echeances lecture" on public.installments;

create policy "credits lecture" on public.credits for select
  using (user_id = auth.uid() or public.is_staff());
create policy "credits mise a jour" on public.credits for update
  using (public.is_staff()) with check (public.is_staff());
create policy "echeances lecture" on public.installments for select
  using (exists (select 1 from public.credits c where c.id = credit_id and (c.user_id = auth.uid() or public.is_staff())));

-- ----------------------------------------------------------------------------
-- 2. Statut de payeur et droit à un nouveau crédit (cahier 5.8)
-- ----------------------------------------------------------------------------
create or replace function public.credit_state(p_user uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  with actifs as (
    select id from public.credits where user_id = p_user and status = 'en_cours'
  ),
  retard as (
    select coalesce(max((now() at time zone 'Africa/Douala')::date - i.due_date), 0) as jours
      from public.installments i
      join actifs a on a.id = i.credit_id
     where i.paid_at is null and i.due_date < (now() at time zone 'Africa/Douala')::date
  ),
  ponctuelles as (
    select count(*) as n
      from public.installments i
      join public.credits c on c.id = i.credit_id
     where c.user_id = p_user and i.paid_at is not null
       and (i.paid_at at time zone 'Africa/Douala')::date <= i.due_date
  )
  select jsonb_build_object(
    'actifs', (select count(*) from actifs),
    'retard_jours', (select jours from retard),
    'echeances_a_temps', (select n from ponctuelles),
    'statut', case
      when (select jours from retard) > 30 then 'Crédit suspendu'
      when (select jours from retard) > 0 then 'À surveiller'
      when (select n from ponctuelles) >= 3 then 'Bon payeur'
      else 'Nouveau client'
    end)
$$;

/** Le client peut-il ouvrir un nouveau crédit ? */
create or replace function public.credit_eligibility(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_state jsonb := public.credit_state(p_user);
  v_max   int;
begin
  v_max := case when v_state ->> 'statut' = 'Bon payeur' then 2 else 1 end;
  if (v_state ->> 'statut') = 'Crédit suspendu' then
    return jsonb_build_object('ok', false, 'statut', v_state ->> 'statut',
      'message', 'Une échéance a plus de 30 jours de retard. Régularise-la pour ouvrir un nouveau crédit.');
  end if;
  if (v_state ->> 'statut') = 'À surveiller' then
    return jsonb_build_object('ok', false, 'statut', v_state ->> 'statut',
      'message', 'Tu as une échéance en retard. Règle-la pour pouvoir acheter de nouveau à crédit.');
  end if;
  if (v_state ->> 'actifs')::int >= v_max then
    return jsonb_build_object('ok', false, 'statut', v_state ->> 'statut',
      'message', case when v_max = 1
        then 'Tu as déjà un crédit en cours. Termine-le pour en ouvrir un autre.'
        else 'Tu as déjà deux crédits en cours.' end);
  end if;
  return jsonb_build_object('ok', true, 'statut', v_state ->> 'statut', 'max', v_max);
end $$;

revoke all on function public.credit_state(uuid) from public, anon, authenticated;
revoke all on function public.credit_eligibility(uuid) from public, anon, authenticated;
grant execute on function public.credit_state(uuid) to authenticated;
grant execute on function public.credit_eligibility(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 3. Commande : prise en charge du paiement à crédit
--    (remplace place_order de 0001 ; même contrat, plus le mode « credit »)
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
  v_total     int;
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
  v_user      uuid := auth.uid();
  v_elig      jsonb;
  v_monthly   int;
  v_down      int;
  v_credit_id uuid;
  v_credit    jsonb := null;
begin
  -- Contrôles des coordonnées
  if coalesce(length(trim(p ->> 'full_name')), 0) < 3 then
    raise exception 'Indique ton nom et prénom.';
  end if;
  if v_phone is null or v_phone !~ '^6[0-9]{8}$' then
    raise exception 'Numéro de téléphone invalide.';
  end if;
  if v_payment not in ('mtn-momo', 'orange-money', 'cash', 'credit') then
    raise exception 'Moyen de paiement non disponible.';
  end if;
  if v_payment = 'credit' then
    if v_user is null then
      raise exception 'Connecte-toi à ton compte pour acheter à crédit.';
    end if;
    v_elig := public.credit_eligibility(v_user);
    if not (v_elig ->> 'ok')::boolean then
      raise exception '%', v_elig ->> 'message';
    end if;
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

  v_total := v_subtotal - v_discount + v_fee;

  loop
    v_number := 'TD' || to_char(v_today, 'YYYYMMDD') || lpad(floor(random() * 10000)::text, 4, '0');
    exit when not exists (select 1 from public.orders where number = v_number);
  end loop;

  insert into public.orders (
    number, user_id, channel, payment_method, customer_name, customer_phone, customer_email,
    delivery_mode, delivery_zone_id, delivery_area, delivery_address, delivery_day, delivery_slot,
    subtotal, discount, promo_code, delivery_fee, total
  ) values (
    v_number, v_user, 'en_ligne', v_payment, trim(p ->> 'full_name'), v_phone, nullif(trim(p ->> 'email'), ''),
    v_mode, v_zone.id, case when v_mode = 'livraison' then p ->> 'area' end,
    case when v_mode = 'livraison' then trim(p ->> 'address') end, v_day,
    case when v_mode = 'livraison' then p ->> 'slot' end,
    v_subtotal, v_discount, v_code, v_fee, v_total
  ) returning id into v_order_id;

  insert into public.order_items (order_id, product_id, variant_id, product_name, variant_label, color, qty, unit_price, total)
  select v_order_id, (l ->> 'product_id')::uuid, (l ->> 'variant_id')::uuid, l ->> 'product_name', l ->> 'variant_label',
         l ->> 'color', (l ->> 'qty')::int, (l ->> 'unit_price')::int, (l ->> 'total')::int
    from jsonb_array_elements(v_lines) l;

  -- Crédit 40/60 : mensualité = (total × 60 %) / 6 arrondie à la centaine, l'acompte absorbe l'arrondi.
  if v_payment = 'credit' then
    v_monthly := round(v_total * 0.6 / 6 / 100) * 100;
    v_down := v_total - v_monthly * 6;
    insert into public.credits (order_id, user_id, total_amount, down_payment, monthly_amount, months)
    values (v_order_id, v_user, v_total, v_down, v_monthly, 6)
    returning id into v_credit_id;

    insert into public.installments (credit_id, number, amount, due_date)
    select v_credit_id, n, v_monthly, (v_today + (n || ' month')::interval)::date
      from generate_series(1, 6) as n;

    v_credit := jsonb_build_object('down_payment', v_down, 'monthly_amount', v_monthly, 'months', 6,
      'first_due_date', (v_today + interval '1 month')::date);
  end if;

  return jsonb_build_object(
    'number', v_number, 'subtotal', v_subtotal, 'discount', v_discount, 'promo_code', v_code,
    'delivery_fee', v_fee, 'total', v_total, 'lines', v_lines, 'delivery_day', v_day, 'credit', v_credit);
end $$;

revoke all on function public.place_order(jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. Encaissements validés par la boutique (cahier 5.4 : le cash fait avancer la jauge)
-- ----------------------------------------------------------------------------
create or replace function public.pay_installment(p_installment uuid, p_method text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_credit uuid;
  v_reste  int;
begin
  if not public.is_staff() then raise exception 'Accès refusé.'; end if;
  if p_method not in ('mtn-momo', 'orange-money', 'cash') then raise exception 'Moyen de paiement invalide.'; end if;

  update public.installments
     set paid_at = now(), payment_method = p_method, validated_by = auth.uid()
   where id = p_installment and paid_at is null
  returning credit_id into v_credit;
  if v_credit is null then raise exception 'Échéance introuvable ou déjà payée.'; end if;

  select count(*) into v_reste from public.installments where credit_id = v_credit and paid_at is null;
  if v_reste = 0 then
    update public.credits set status = 'solde' where id = v_credit;
    update public.orders o set payment_status = 'paye', paid_at = now()
      from public.credits c where c.id = v_credit and o.id = c.order_id;
  end if;

  return jsonb_build_object('credit_id', v_credit, 'restantes', v_reste);
end $$;

/** Acompte de 40 % encaissé par la boutique. */
create or replace function public.pay_down_payment(p_credit uuid, p_method text)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Accès refusé.'; end if;
  if p_method not in ('mtn-momo', 'orange-money', 'cash') then raise exception 'Moyen de paiement invalide.'; end if;
  update public.credits set down_paid_at = now() where id = p_credit and down_paid_at is null;
  if not found then raise exception 'Acompte introuvable ou déjà encaissé.'; end if;
end $$;

revoke all on function public.pay_installment(uuid, text) from public, anon, authenticated;
revoke all on function public.pay_down_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.pay_installment(uuid, text) to authenticated;
grant execute on function public.pay_down_payment(uuid, text) to authenticated;

-- Annulation d'une commande à crédit : le crédit suit.
create or replace function public.cancel_order(p_order_id uuid)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare
  v_status text;
begin
  if not public.is_staff() then
    raise exception 'Accès refusé.';
  end if;
  select status into v_status from public.orders where id = p_order_id for update;
  if not found then raise exception 'Commande introuvable.'; end if;
  if v_status = 'annulee' then return; end if;
  if v_status = 'livree' then raise exception 'Une commande livrée ne peut pas être annulée.'; end if;

  update public.product_variants v
     set stock = v.stock + i.qty
    from public.order_items i
   where i.order_id = p_order_id and i.variant_id = v.id;

  update public.credits set status = 'annule' where order_id = p_order_id and status = 'en_cours';
  update public.orders set status = 'annulee' where id = p_order_id;
end $$;

revoke all on function public.cancel_order(uuid) from public, anon, authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;

commit;
