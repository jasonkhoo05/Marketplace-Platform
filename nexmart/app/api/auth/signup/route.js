import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseServer';

export async function POST(request) {
  const { username, email, phone, password } = await request.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { data: newUser, error: userError } = await supabase
    .from('user')
    .insert({
      user_uuid: authData.user.id,
      username,
      email,
      phone: phone || null,
      password,
      last_active_role: 'buyer',
    })
    .select('user_id')
    .single();

  if (userError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  const { data: buyerRole } = await supabase
    .from('role')
    .select('role_id')
    .eq('role_name', 'buyer')
    .single();

  if (buyerRole) {
    await supabase.from('user_role').insert({
      user_id: newUser.user_id,
      role_id: buyerRole.role_id,
    });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
