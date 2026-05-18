import { createClient } from "./supabase/server";

export async function isAdmin(userId: String){
    const supabase = await createClient();

    const {data, error} = await supabase
            .from("user_role")
            .select('role_id')
            .eq('user_uuid', userId)
            .single();
    
    if (error || !data) return false;

    return data.role_id == 3;
}