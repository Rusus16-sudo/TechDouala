import OrderConfirmation from "@/components/checkout/OrderConfirmation";

export const metadata = { title: "Commande confirmée - TechDouala", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <div className="container">
      <OrderConfirmation />
    </div>
  );
}
