import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';

export async function POST(req: NextRequest) {
  const { id, email, display_name } = await req.json();

  if (!id || !email) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  try {
    // すでに存在するか確認
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (existingUser) {
      return NextResponse.json({ ok: true }); // すでに存在すれば何もしない
    }

    // 初回登録
    await supabaseServer.from('users').insert([
      {
        id,
        email,
        display_name: display_name || email.split('@')[0],
      },
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'ユーザー作成に失敗しました' }, { status: 500 });
  }
}