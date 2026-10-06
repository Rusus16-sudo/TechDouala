"use client";

import { useEffect } from "react";

/**
 * Fait apparaître les éléments marqués `data-reveal` quand ils entrent à l'écran (une seule fois).
 * Les styles sont dans globals.css ; sans JavaScript, rien n'est masqué.
 * `data-reveal` : montée en fondu ; `data-reveal="drop"` : chute avec rebond.
 * `style={{ "--i": n }}` décale l'entrée des éléments d'une même rangée.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]:not([data-shown])");
    const show = (el) => el.setAttribute("data-shown", "");
    if (!("IntersectionObserver" in window)) {
      els.forEach(show);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
