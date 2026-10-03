import Breadcrumb from "@/components/ui/Breadcrumb";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { normalizeCmPhone } from "@/lib/checkout";

export const metadata = { title: "Commande - TechDouala", robots: { index: false } };

export default async function CheckoutPage() {
  const session = await getSession();
  // Droit au crédit 40/60 : calculé en base (crédits en cours, retards, statut de payeur).
  let creditInfo = null;
  if (session) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("credit_eligibility", { p_user: session.user.id });
    creditInfo = data ?? null;
  }
  // Client connecté : coordonnées préremplies depuis son profil.
  const prefill = session
    ? {
        fullName: session.profile.full_name ?? "",
        phone: normalizeCmPhone(session.profile.phone ?? "") ?? "",
        email: session.user.email ?? "",
      }
    : null;
  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Panier", href: "/panier" }, { label: "Commande" }]} />
      <CheckoutForm prefill={prefill} creditInfo={creditInfo} />
    </div>
  );
}
