import { createBrowserClient } from "@supabase/ssr";

let client;

/** Client Supabase côté navigateur (envoi de photos depuis l'espace gérant). */
export function createClient() {
  client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return client;
}
