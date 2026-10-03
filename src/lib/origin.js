// Adresses locales (PC, téléphone du même Wi-Fi) : servies en http, jamais en https.
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.|10\.)/;

/**
 * Origine du site telle que la voit le navigateur, d'après les en-têtes de la requête.
 * En local, Next.js reconstruit request.url avec « localhost » même quand le visiteur est sur
 * 127.0.0.1 : rediriger vers cette adresse le ferait changer de site et perdre sa session.
 */
export function originFromHeaders(headers, fallback) {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return fallback ? new URL(fallback).origin : "";
  const proto = headers.get("x-forwarded-proto")?.split(",")[0] ?? (LOCAL_HOST.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}
