import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseProjectUrl,
  getSupabaseServiceRoleKey,
} from "./project-url";

export const supabaseAdmin = createClient(
    getSupabaseProjectUrl(),
    getSupabaseServiceRoleKey(),
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    }
);


