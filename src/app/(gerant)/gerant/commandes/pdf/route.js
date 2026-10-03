import { assertStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { describeOrderFilters, queryOrders, readOrderFilters } from "@/lib/data/orders";
import { ordersPdf } from "@/lib/orders-pdf";

const MAX_ROWS = 2000;
const DOUALA = 60 * 60 * 1000;

const SELECT = `
  number, created_at, channel, status, payment_method, payment_status,
  customer_name, customer_phone, credit_requested, total,
  items:order_items(product_name, variant_label, qty)
`;

/** Liste des commandes en PDF, avec les mêmes filtres que l'écran et l'export Excel. */
export async function GET(request) {
  try {
    await assertStaff();
  } catch {
    return new Response("Accès refusé.", { status: 403 });
  }

  const filters = readOrderFilters(Object.fromEntries(request.nextUrl.searchParams));
  const supabase = await createClient();
  const { data: orders, error } = await queryOrders(supabase, filters, { select: SELECT, limit: MAX_ROWS });
  if (error) return new Response(`Export impossible : ${error.message}`, { status: 500 });

  const pdf = await ordersPdf(orders, { filtersText: describeOrderFilters(filters), limit: MAX_ROWS });

  const today = new Date(Date.now() + DOUALA).toISOString().slice(0, 10);
  const suffix = filters.period ? `-${filters.period}` : "";
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="commandes-techdouala-${today}${suffix}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
