import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';
import crypto from "crypto";

export async function initUser(token: string) {
  if (!token || typeof token !== 'string') {
    return {
      success: false,
      message: '不正なリンクです(tokenなし)。',
    };
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { data: tokenRecode, error } = await supabaseServer
    .from('magic_links')
    .select('*')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !tokenRecode) {
    return { success: false, message: '無効なリンクです。' };
  }

  const now = new Date();
  if (new Date(tokenRecode.expires_at) < now) {
    return { success: false, message: 'リンクの有効期限が切れています。' }
  }

  if (tokenRecode.used_at) {
    return { success: false, message: 'このリンクはすでに使用されています。' }
  }

  const email = tokenRecode.email;
  const { data: userData, error: userError } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

    if (userError) {
      return { success: false, message: 'ユーザー取得に失敗しました' };
    }

  let userId: string;
  if (userData) {
    userId = userData.id;
  } else {
    const { data: newUser, error: insertError } = await supabaseServer
      .from('users')
      .insert({
        email,
        display_name: email.split('@')[0],
        university: null,
        is_banned: false,
        is_admin: false
      })
      .select()
      .single();

    if (insertError || !newUser) {
      return { success: false, message: 'ユーザの作成に失敗しました。' }
    }
    userId = newUser.id;
  }

  // token が有効で、ユーザーを取得または作成した後
  const { error: updateError } = await supabaseServer
    .from('magic_links')
    .update({ used_at: new Date() })
    .eq('id', tokenRecode.id);

    if (updateError) {
      return {success: false, message: 'トークン更新に失敗しました。'};
    }

  return {
    success: true,
    message: 'ユーザ取得OK',
    userId
  };
}
