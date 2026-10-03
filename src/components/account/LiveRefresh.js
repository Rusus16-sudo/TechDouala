"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Recharge les données de la page (sans recharger le navigateur) pendant que la boutique traite
 * une commande : toutes les `every` ms tant que l'onglet est visible, et dès qu'on y revient.
 */
export default function LiveRefresh({ every = 20000 }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) router.refresh();
    };
    const timer = setInterval(refresh, every);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router, every]);

  return null;
}
