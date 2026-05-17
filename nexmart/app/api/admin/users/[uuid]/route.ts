import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAdminUser } from "../../../../admin/validation/adminValidation";
import { Meera_Inimai } from "next/font/google";


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


export async function DELETE(
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

        if (userUuid === user.id) {
            return NextResponse.json(
                { error: "Admin cannot delete themselves." },
                { status: 400 }
            );
        }

        // delete address
        const { error: addressError } = await supabaseAdmin
            .from("address")
            .delete()
            .eq("user_uuid", userUuid);

        if (addressError) {
            return NextResponse.json(
                { error: "Failed to delete address record." },
                { status: 500 }
            );
        }

        // delete user role
        const { error: userRoleError } = await supabaseAdmin
            .from("user_role")
            .delete()
            .eq("user_uuid", userUuid);

        if (userRoleError) {
            return NextResponse.json(
                { error: "Failed to delete user role record." },
                { status: 500 }
            );
        }

        // delete user
        const { error: userError } = await supabaseAdmin
            .from("user")
            .delete()
            .eq("user_uuid", userUuid);

        if (userError) {
            return NextResponse.json(
                { error: "Failed to delete user record." },
                { status: 500 }
            );
        }

        // delete user from auth section
        const { error: userAuthError } = await supabaseAdmin.auth.admin.deleteUser(userUuid);


        if (userAuthError) {
            return NextResponse.json(
                { error: "Failed to delete user in authentication" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "User deleted successfully" }
        );
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: "Server error in deleting user" },
            { status: 500 }
        );
    }
}





