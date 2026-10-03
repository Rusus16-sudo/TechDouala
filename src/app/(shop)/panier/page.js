import Breadcrumb from "@/components/ui/Breadcrumb";
import CartPage from "@/components/checkout/CartPage";

export const metadata = { title: "Mon panier - TechDouala", robots: { index: false } };

export default function Page() {
  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Panier" }]} />
      <CartPage />
    </div>
  );
}
