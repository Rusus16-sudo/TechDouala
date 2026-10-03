import CartProvider from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import NewsBanner from "@/components/layout/NewsBanner";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import BottomNav from "@/components/ui/BottomNav";
import { getActiveBrands, getCategories, getNews } from "@/lib/data/catalog";
import { getSession, isStaff } from "@/lib/auth";

// Mise en page du site e-commerce (client). L'espace gérant a son propre groupe (gerant).
export default async function ShopLayout({ children }) {
  const [categories, brands, news, session] = await Promise.all([getCategories(), getActiveBrands(), getNews(), getSession()]);
  const accountName = session ? (session.profile.full_name ?? "").split(" ")[0] || "Mon compte" : null;
  // Le personnel n'a pas d'espace client : son icône « compte » mène à l'espace gérant.
  const accountHref = !session ? "/connexion" : isStaff(session.profile.role) ? "/gerant" : "/compte";
  const banner = news.find((n) => n.placement === "bandeau");

  return (
    <CartProvider>
      <NewsBanner news={banner ?? null} signedIn={!!session} />
      <SiteHeader categories={categories} brands={brands} accountName={accountName} accountHref={accountHref} />
      <main>{children}</main>
      <SiteFooter categories={categories} />
      <WhatsAppButton />
      <BottomNav accountHref={accountHref} />
      <CartDrawer />
    </CartProvider>
  );
}
