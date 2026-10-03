-- ============================================================================
-- TechDouala : vente au comptoir et annulation de commande
-- À exécuter dans Supabase > SQL Editor (après 0001_init.sql).
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- Vente au comptoir (cahier 5.10) : réservée au personnel.
--   p = { customer_name?, customer_phone?, payment, notes?,
--         items: [{ variant_id, qty, color?, unit_price?, imei? }] }
--   Prix négocié sur place accepté, mais jamais sous le prix plancher (valeur non révélée).
-- ----------------------------------------------------------------------------
create or replace function public.pos_sale(p jsonb)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare
  v_item      jsonb;
  v_qty       int;
  v_unit      int;
  v_var       record;
  v_lines     jsonb := '[]'::jsonb;
  v_list      int := 0;
  v_total     int := 0;
  v_phone     text := nullif(regexp_replace(coalesce(p ->> 'customer_phone', ''), '\D', '', 'g'), '');
  v_payment   text := p ->> 'payment';
  v_imei      text;
  v_number    text;
  v_order_id  uuid;
  v_today     date := (now() at time zone 'Africa/Douala')::date;
begin
  if not public.is_staff() then
    raise exception 'Accès refusé.';
  end if;
  if v_payment not in ('mtn-momo', 'orange-money', 'cash') then
    raise exception 'Choisis un moyen de paiement.';
  end if;
  if v_phone is not null then
    v_phone := regexp_replace(v_phone, '^237(?=[0-9]{9}$)', '');
    if v_phone !~ '^6[0-9]{8}$' then raise exception 'Numéro du client invalide.'; end if;
  end if;
  if coalesce(jsonb_typeof(p -> 'items'), '') <> 'array' or jsonb_array_length(p -> 'items') = 0 then
    raise exception 'Ajoute au moins un produit à la vente.';
  end if;

  for v_item in select * from jsonb_array_elements(p -> 'items') loop
    v_qty := (v_item ->> 'qty')::int;
    if v_qty is null or v_qty < 1 or v_qty > 20 then raise exception 'Quantité invalide.'; end if;

    select v.id, v.price, v.stock, v.label, pr.id as product_id, pr.name, pr.colors, pr.requires_imei, f.floor_price
      into v_var
      from public.product_variants v
      join public.products pr on pr.id = v.product_id
      left join public.product_floor_prices f on f.variant_id = v.id
     where v.id = (v_item ->> 'variant_id')::uuid
       for update of v;
    if not found then raise exception 'Produit introuvable.'; end if;
    if v_var.stock < v_qty then
      raise exception 'Stock insuffisant pour % % (reste %).', v_var.name, coalesce(v_var.label, ''), v_var.stock;
    end if;

    v_unit := coalesce((v_item ->> 'unit_price')::int, v_var.price);
    if v_unit <= 0 then raise exception 'Prix invalide pour %.', v_var.name; end if;
    if v_var.floor_price is not null and v_unit < v_var.floor_price then
      raise exception 'Prix trop bas pour %. Le prix négocié ne peut pas descendre sous le plancher.', v_var.name;
    end if;

    v_imei := nullif(regexp_replace(coalesce(v_item ->> 'imei', ''), '\D', '', 'g'), '');
    if v_imei is not null and (v_imei !~ '^[0-9]{15}$' or v_qty <> 1) then
      raise exception 'IMEI invalide pour % : 15 chiffres, un appareil par ligne.', v_var.name;
    end if;

    update public.product_variants set stock = stock - v_qty where id = v_var.id;

    v_list := v_list + v_var.price * v_qty;
    v_total := v_total + v_unit * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_var.product_id, 'variant_id', v_var.id, 'product_name', v_var.name, 'variant_label', v_var.label,
      'color', (select c ->> 'name' from jsonb_array_elements(v_var.colors) c where c ->> 'name' = v_item ->> 'color' limit 1),
      'qty', v_qty, 'unit_price', v_unit, 'total', v_unit * v_qty, 'imei', v_imei);
  end loop;

  loop
    v_number := 'TD' || to_char(v_today, 'YYYYMMDD') || lpad(floor(random() * 10000)::text, 4, '0');
    exit when not exists (select 1 from public.orders where number = v_number);
  end loop;

  insert into public.orders (
    number, seller_id, channel, status, payment_method, payment_status, paid_at,
    customer_name, customer_phone, delivery_mode, subtotal, discount, delivery_fee, total, notes
  ) values (
    v_number, auth.uid(), 'boutique', 'livree', v_payment, 'paye', now(),
    coalesce(nullif(trim(p ->> 'customer_name'), ''), 'Client de passage'), coalesce(v_phone, ''),
    'retrait', v_list, v_list - v_total, 0, v_total, nullif(trim(p ->> 'notes'), '')
  ) returning id into v_order_id;

  insert into public.order_items (order_id, product_id, variant_id, product_name, variant_label, color, qty, unit_price, total, imei)
  select v_order_id, (l ->> 'product_id')::uuid, (l ->> 'variant_id')::uuid, l ->> 'product_name', l ->> 'variant_label',
         l ->> 'color', (l ->> 'qty')::int, (l ->> 'unit_price')::int, (l ->> 'total')::int, l ->> 'imei'
    from jsonb_array_elements(v_lines) l;

  return jsonb_build_object('id', v_order_id, 'number', v_number, 'total', v_total, 'discount', v_list - v_total);
end $$;

-- ----------------------------------------------------------------------------
-- Annulation d'une commande par le personnel : remet les articles en stock.
-- ----------------------------------------------------------------------------
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

  update public.orders set status = 'annulee' where id = p_order_id;
end $$;

revoke all on function public.pos_sale(jsonb) from public, anon, authenticated;
revoke all on function public.cancel_order(uuid) from public, anon, authenticated;
grant execute on function public.pos_sale(jsonb) to authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;

commit;
