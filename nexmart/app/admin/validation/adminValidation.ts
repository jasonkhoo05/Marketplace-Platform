import { supabaseAdmin } from "@/lib/supabase/admin";

export async function isAdminUser(userUuid: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
    .from("user_role")
    .select("role:role_id(role_name)")
    .eq("user_uuid", userUuid);


    if (error) {
        console.error("Admin validation error: ", error.message);
        return false;
    }

    const rolesNames = data?.map((r: any) => r.role?.role_name).filter(Boolean) || [];
    return rolesNames.includes("admin");
}

