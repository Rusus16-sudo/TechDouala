/** @type {import('next').NextConfig} */
const nextConfig = {
  // En développement : 127.0.0.1 (Chrome force https sur « localhost ») et téléphone du même Wi-Fi.
  allowedDevOrigins: ["127.0.0.1", "192.168.1.183"],
  // Exports des commandes : ExcelJS et pdfkit (qui lit ses polices sur le disque) s'exécutent en Node natif.
  serverExternalPackages: ["exceljs", "pdfkit"],
  images: {
    // Photos produits et actualités stockées dans Supabase Storage.
    remotePatterns: [{ protocol: "https", hostname: "oorzijumzsmvwpwizqft.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    // Photos envoyées depuis l'espace gérant via des actions serveur.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
