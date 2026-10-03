// Coordonnées de la boutique (cahier, section 13).
export const STORE = {
  name: "TechDouala",
  tagline: "La tech qui te comprend",
  address: "Ancien Troisième, Douala",
  city: "Douala, Cameroun",
  phone: "+237 676 54 72 89",
  whatsapp: "237676547289", // format international sans « + », pour wa.me
  email: "techdouala@gmail.com",
};

export function whatsappLink(message = "Bonjour TechDouala !") {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}
