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

        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userUuid);

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

        console.log("data.address:", data.address);
        console.log("full data:", JSON.stringify(data, null, 2));

        const resultUser = {
            user_uuid: data.user_uuid,
            username: data.username,
            email: data.email,
            phone: data.phone,
            last_active_role: data.last_active_role,
            user_image: data.user_image,
            gender: data.gender,
            date_of_birth: data.date_of_birth,
            last_sign_in_at: authData?.user?.last_sign_in_at ?? null,
            roles: data.user_role?.map((r: any) =>
                r.role?.role_name).filter(Boolean) || [],
            address: data.address
            ? [{
                address_line: (data.address as any).address_line,
                city: (data.address as any).city,
                postcode: (data.address as any).postcode,
                is_default: (data.address as any).is_default,
            }]
            : [],


            // address: data.address?.map((a: any) => ({
            //     address_line: a.address_line,
            //     city: a.city,
            //     postcode: a.postcode,
            //     is_default: a.is_default,
            // })) || [],

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





