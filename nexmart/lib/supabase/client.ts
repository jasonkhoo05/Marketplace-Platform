import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseProjectUrl,
  getSupabasePublishableKey,
} from "./project-url";

export function createClient() {
  return createBrowserClient(
    getSupabaseProjectUrl(),
    getSupabasePublishableKey(),
  );
}
