import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdminUser } from "../../../../admin/validation/adminValidation";


export async function GET(
    req: Request,
    { params } : { params: Promise <{uuid: string}> }
) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await isAdminUser(user.id);

        if (!admin) {
            return NextResponse.json({ error: "Forbidden Access" }, { status: 403 });
        }

        const resolvedParams =  await params;
        const userUuid = resolvedParams.uuid;

        const { data, error } = await supabaseAdmin
            .from("user")
            .select(
                `
                user_uuid,
                username,
                email,
                phone,
                last_active_role,
                user_image,
                gender,
                date_of_birth,
                address!address_user_uuid_fkey(
                    address_line,
                    city,
                    postcode,
                    is_default
                ),
                user_role!user_role_user_uuid_fkey(
                    role!user_role_role_id_fkey(
                    role_name
                    )
                )
                `
            )
            .eq("user_uuid", userUuid)
            .single();

        if (error || !data) {
            // consider removing console after debugging
            console.error("Fetch user details error: ", error.message);
            return NextResponse.json({ error: "User not found" }, { status: 404});
        }

        const resultUser = {
            userUuid: data.user_uuid,
            username: data.username,
            email: data.email,
            phone: data.phone,
            lastActiveRole: data.last_active_role,
            userImage: data.user_image,
            gender: data.gender,
            dateOfBirth: data.date_of_birth,
            userRole: data.user_role?.map((r: any) =>
                r.role?.role_name).filter(Boolean) || [],

            address: data.address?.map((a: any) => ({
                addressLine: a.address_line,
                cityLine: a.city,
                postcode: a.postcode,
                isDefault: a.is_default,
            })) || [],

        };


        return NextResponse.json({ user: resultUser });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: "Server error fetching user detail" },
        { status: 500}
        );
    }

}








