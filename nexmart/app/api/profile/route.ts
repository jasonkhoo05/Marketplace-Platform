import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// 1. GET Request: Fetch user profile data
export async function GET() {
  try {
    const supabase = await createClient()

    // Verify current authenticated session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user row matching the authenticated id and join the address table
    const { data: profile, error: dbError } = await supabase
      .from("user")
      .select("username, full_name, email, phone, address(address_line, city, postcode, is_default), gender, date_of_birth, user_image, last_active_role")
      .eq("user_uuid", user.id)
      .maybeSingle() // Handles empty rows gracefully without throwing hard exceptions

    if (dbError) {
      if (dbError.code === "PGRST116") {
        return NextResponse.json({
          username: "",
          full_name: "",
          email: user.email || "", 
          phone: "",
          address: "",
          gender: "",
          dob_day: "",
          dob_month: "",
          dob_year: "",
          user_image: "",
          last_active_role: "buyer"
        })      
      }
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // If the database row doesn't exist at all yet, return the empty skeleton structure
    if (!profile) {
      return NextResponse.json({
        username: "",
        full_name: "",
        email: user.email || "", 
        phone: "",
        address: "",
        gender: "",
        dob_day: "",
        dob_month: "",
        dob_year: "",
        user_image: "",
        last_active_role:"buyer"
      })
    }

    // FIX 1: Split the unified date_of_birth string ("YYYY-MM-DD") back into parts for React
    let dob_day = "";
    let dob_month = "";
    let dob_year = "";

    if (profile.date_of_birth) {
      const [year, month, day] = profile.date_of_birth.split("-");
      dob_year = year;
      // parseInt removes leading zeros (e.g., "05" -> "5") to match your frontend select options
      dob_month = String(parseInt(month, 10));
      dob_day = String(parseInt(day, 10));
    }

    // Flattens the joined address array into the fields the form expects.
    const joinedAddressArray = profile.address as any[];
    const addressRow = joinedAddressArray?.[0];

    // Construct the formatted response object expected by FormState
    const formattedProfile = {
      username: profile.username || "",
      full_name: profile.full_name || "",
      email: profile.email || user.email || "",
      phone: profile.phone || "",
      address: addressRow?.address_line || "",
      city: addressRow?.city || "",
      postcode: addressRow?.postcode || "",
      is_default: addressRow?.is_default ?? false,
      gender: profile.gender || "",
      user_image: profile.user_image || "",
      dob_day,
      dob_month,
      dob_year,
      last_active_role: profile.last_active_role || "buyer"
    }

    return NextResponse.json(formattedProfile)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// 2. PUT Request: Save / Update profile details
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Extract expected properties safely
    const { username, full_name, phone, address, city, postcode, is_default, gender, dob_day, dob_month, dob_year, user_image } = body

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Combine split frontend dropdown strings into a safe YYYY-MM-DD PostgreSQL DATE format
    let formattedDob = null;
    if (dob_year && dob_month && dob_day) {
      const paddedMonth = dob_month.padStart(2, "0");
      const paddedDay = dob_day.padStart(2, "0");
      formattedDob = `${dob_year}-${paddedMonth}-${paddedDay}`; // Becomes e.g., "2004-03-18"
    }

    const { data: existingUser } = await supabase
    .from("user")
    .select("last_active_role")
    .eq("user_uuid", user.id)
    .maybeSingle();

    // 2. If they have an existing role, preserve it! Otherwise, default fresh accounts to "buyer"
    const assignedRole = existingUser?.last_active_role || "buyer";

    // Save core details to your "user" table
    const { error: userUpdateError } = await supabase
      .from("user")
      .upsert({
        user_uuid: user.id, // Primary Key match
        username,
        full_name,
        email: user.email,
        phone,
        gender,
        date_of_birth: formattedDob, // FIX 2: Updated property key to match date_of_birth column
        user_image, 
        is_new_user: false,
        last_active_role: assignedRole,
        //updated_at: new Date().toISOString(),
      }, { onConflict: "user_uuid" })

    if (userUpdateError) {
      return NextResponse.json({ error: userUpdateError.message }, { status: 500 })
    }

    // Save the address string into your dedicated "address" table linked via your FK
    const { error: addressUpdateError } = await supabase
      .from("address")
      .upsert({
        user_uuid: user.id,
        address_line: address || "",
        city: city || "",
        postcode: postcode || "",
        is_default: is_default ?? false,
      }, { onConflict: "user_uuid" })  // Overwrites older addresses seamlessly on change

    if (addressUpdateError) {
      return NextResponse.json({ error: addressUpdateError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Profile and address updated successfully!" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}