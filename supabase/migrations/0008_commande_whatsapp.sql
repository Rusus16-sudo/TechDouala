-- ============================================================================
-- TechDouala : commande sur WhatsApp (décision du 30/09/2026)
-- À exécuter dans Supabase > SQL Editor (après 0001 à 0007 ; 0006 facultative).
--   - plus de paiement en ligne ni de livraison organisée par le site ;
--   - la commande est enregistrée (numéro, stock réservé, code promo), puis
--     paiement et remise se conviennent avec la boutique sur WhatsApp ;
--   - le moyen de paiement est noté par le gérant à l'encaissement ;
--   - le crédit 40/60 est une demande : le gérant ouvre le dossier lui-même.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. Commandes : paiement et réception ne sont plus choisis sur le site
-- ----------------------------------------------------------------------------
alter table public.orders alter column payment_method drop not null;
alter table public.orders alter column delivery_mode drop not null;
alter table public.orders add column if not exists credit_requested boolean not null default false;

-- ----------------------------------------------------------------------------
-- 2. Paiement en ligne (0006) retiré
-- ----------------------------------------------------------------------------
drop function if exists public.create_payment_intent(jsonb);
drop function if exists public.confirm_payment(jsonb);
drop function if exists public.payment_state(text);
drop table if exists public.payments;
do $$
begin
  if to_regclass('public.store_settings') is not null then
    delete from public.store_settings where key = 'payment_webhook_secret';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 3. Enregistrement d'une commande (remplace place_order de 0004)
--    Entrée : full_name, phone, email?, note?, credit_requested?, promo_code?, items.
-- ----------------------------------------------------------------------------
create or replace function public.place_order(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_item      jsonb;
  v_qty       int;
  v_var       record;
  v_lines     jsonb := '[]'::jsonb;
  v_subtotal  int := 0;
  v_discount  int := 0;
  v_total     int;
  v_promo     jsonb;
  v_code      text;
  v_phone     text := p ->> 'phone';
  v_note      text := nullif(left(trim(coalesce(p ->> 'note', '')), 500), '');
  v_number    text;
  v_order_id  uuid;
  v_today     date := (now() at time zone 'Africa/Douala')::date;
begin
  if coalesce(length(trim(p ->> 'full_name')), 0) < 3 then
    raise exception 'Indique ton nom et prénom.';
  end if;
  if v_phone is null or v_phone !~ '^6[0-9]{8}$' then
    raise exception 'Numéro de téléphone invalide.';
  end if;

  if coalesce(jsonb_typeof(p -> 'items'), '') <> 'array' or jsonb_array_length(p -> 'items') = 0 then
    raise exception 'Ton panier est vide.';
  end if;
  if jsonb_array_length(p -> 'items') > 30 then
    raise exception 'Trop d''articles dans le panier.';
  end if;

  -- Articles : verrouillage des variantes, contrôle et réservation du stock
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

  v_total := v_subtotal - v_discount;

  loop
    v_number := 'TD' || to_char(v_today, 'YYYYMMDD') || lpad(floor(random() * 10000)::text, 4, '0');
    exit when not exists (select 1 from public.orders where number = v_number);
  end loop;

  insert into public.orders (
    number, user_id, channel, customer_name, customer_phone, customer_email,
    subtotal, discount, promo_code, total, notes, credit_requested
  ) values (
    v_number, auth.uid(), 'en_ligne', trim(p ->> 'full_name'), v_phone, nullif(trim(p ->> 'email'), ''),
    v_subtotal, v_discount, v_code, v_total, v_note, coalesce((p ->> 'credit_requested')::boolean, false)
  ) returning id into v_order_id;

  insert into public.order_items (order_id, product_id, variant_id, product_name, variant_label, color, qty, unit_price, total)
  select v_order_id, (l ->> 'product_id')::uuid, (l ->> 'variant_id')::uuid, l ->> 'product_name', l ->> 'variant_label',
         l ->> 'color', (l ->> 'qty')::int, (l ->> 'unit_price')::int, (l ->> 'total')::int
    from jsonb_array_elements(v_lines) l;

  return jsonb_build_object(
    'number', v_number, 'subtotal', v_subtotal, 'discount', v_discount, 'promo_code', v_code,
    'total', v_total, 'lines', v_lines);
end $$;

revoke all on function public.place_order(jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. Passage d'une commande en crédit 40/60, par le gérant
--    Mensualité = (total × 60 %) / 6 arrondie à la centaine ; l'acompte absorbe l'arrondi.
-- ----------------------------------------------------------------------------
create or replace function public.order_to_credit(p_order uuid)
returns uuid language plpgsql volatile security definer set search_path = '' as $$
declare
  v_order     public.orders;
  v_elig      jsonb;
  v_monthly   int;
  v_down      int;
  v_credit_id uuid;
  v_today     date := (now() at time zone 'Africa/Douala')::date;
begin
  if not public.is_staff() then raise exception 'Accès refusé.'; end if;

  select * into v_order from public.orders where id = p_order for update;
  if not found then raise exception 'Commande introuvable.'; end if;
  if v_order.status in ('annulee', 'livree') then raise exception 'Cette commande est close.'; end if;
  if v_order.payment_status = 'paye' then raise exception 'Cette commande est déjà payée.'; end if;
  if v_order.user_id is null then
    raise exception 'Le client doit avoir un compte TechDouala pour acheter à crédit.';
  end if;
  if exists (select 1 from public.credits where order_id = p_order) then
    raise exception 'Un crédit existe déjà pour cette commande.';
  end if;

  v_elig := public.credit_eligibility(v_order.user_id);
  if not (v_elig ->> 'ok')::boolean then
    raise exception '%', v_elig ->> 'message';
  end if;

  v_monthly := round(v_order.total * 0.6 / 6 / 100) * 100;
  v_down := v_order.total - v_monthly * 6;

  insert into public.credits (order_id, user_id, total_amount, down_payment, monthly_amount, months)
  values (p_order, v_order.user_id, v_order.total, v_down, v_monthly, 6)
  returning id into v_credit_id;

  insert into public.installments (credit_id, number, amount, due_date)
  select v_credit_id, n, v_monthly, (v_today + (n || ' month')::interval)::date
    from generate_series(1, 6) as n;

  update public.orders set payment_method = 'credit' where id = p_order;
  return v_credit_id;
end $$;

revoke all on function public.order_to_credit(uuid) from public, anon, authenticated;
grant execute on function public.order_to_credit(uuid) to authenticated;

commit;
