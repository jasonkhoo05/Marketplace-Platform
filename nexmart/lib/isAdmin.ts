import { createClient } from "./supabase/server";

export async function isAdmin(userId: string){
    const supabase = await createClient();

    const {data, error} = await supabase
            .from("user_role")
            .select('role_id')
            .eq('user_uuid', userId);

    if (error || !data) return false;

    return data.some(r => r.role_id === 3);
}