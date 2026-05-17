export function normalizeSupabaseProjectUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
  if (u.toLowerCase().endsWith("/rest/v1")) {
    u = u.slice(0, -"/rest/v1".length);
  }
  return u.replace(/\/+$/, "");
}

export function getSupabaseProjectUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!raw.trim()) return "";
  return normalizeSupabaseProjectUrl(raw);
}

export function getSupabasePublishableKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseProjectUrl() && getSupabasePublishableKey());
}

export function getSupabaseServiceRoleKey(): string {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
}
