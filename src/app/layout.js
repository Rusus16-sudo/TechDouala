import localFont from "next/font/local";
import "./globals.css";

// DM Sans, hébergée avec le site (plus d'appel à Google Fonts) : axes graisse et taille optique.
const dmSans = localFont({
  src: [
    { path: "./fonts/DMSans-latin.woff2", weight: "100 1000", style: "normal" },
    { path: "./fonts/DMSans-latin-ext.woff2", weight: "100 1000", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
});

export const metadata = {
  title: "TechDouala - La tech qui te comprend",
  description: "Boutique d'électronique et de téléphones à Douala, Cameroun. Catalogue, achat, négociation et crédit.",
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={dmSans.variable}>
      <body>{children}</body>
    </html>
  );
}
