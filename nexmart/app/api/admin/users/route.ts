
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam , 10) : null;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //
  const { data: adminRoles } = await supabase
  .from("role")
  .select("role_id")
  .eq("role_name", "admin")
  .single();

  const adminRoleId = adminRoles?.role_id;

  const { data: adminData } = await supabase
    .from("user_role")
    .select("user_uuid")
    .eq("role_id", adminRoleId);

  const adminUuids = adminData?.map((r: any) => r.user_uuid) || [];

  let query =  supabase
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
    `,
    { count: "exact" }
    );

    if (adminUuids.length > 0) {
      query = query.not("user_uuid", "in", `(${adminUuids.join(",")})`);
    }

    if (limit) {
      query = query.limit(limit); // TODO: Replace with pagination in next milestone
    }

    const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resultUsers = (data ?? []).map((user) => ({
    ...user,
    user_role: {
      role_name: user.user_role.map((userRole) => userRole.role.role_name),
    },
    // roles: user.user_role.map((ur) => (ur.role as { role_name: string }).role_name),
    // user_role: undefined,
  }));



  return NextResponse.json({
    users: resultUsers,
    totalCount: count || 0,
  });
}


// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const limit = parseInt(searchParams.get("limit") || "5" , 10);

//   const supabase = await createClient();

//   const {
//     data: { user },
//     error: authError,
//   } = await supabase.auth.getUser();

//   if (authError || !user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { data, error, count } = await supabase
//     .from("user")
//     .select(
//       `
//       user_uuid,
//       username,
//       email,
//       phone,
//       last_active_role,
//       user_image,
//       gender,
//       date_of_birth,
//       address!address_user_uuid_fkey(
//         address_line,
//         city,
//         postcode,
//         is_default
//       ),
//       user_role(
//         role(
//           role_name
//         )
//       )
//     `,
//       { count: "exact" }
//     );

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   const users = data ?? [];

//   const limitedUsers = users.slice(0, limit);
//   // const resultUsers = limit ? users.slice(0, limit) : users

//   return NextResponse.json({
//     users: limitedUsers,
//     totalCount: count || 0,
//   });
// }