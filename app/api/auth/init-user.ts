import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';
import crytpo from "crypto";

export async function initUser(token: string) {
  if (!token || typeof token !== 'string') {
    return {
      success: false,
      mesasge: '不正なリンクです(tokenなし)。',
    };
  }

  const tokenHash = crytpo.createHash('sha256').update(token).digest('hex');

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
    return { success: false, message: 'リンクの有効期限が切れています。'}
  }

  if (tokenRecode.used_at) {
    return { success: false, message: 'このリンクはすでに使用されています。'}
  }

  const email = tokenRecode.email;
  const { data: userData, error: userError} = await supabaseServer
  .from('users')
  .select('*')
  .eq('email', email)
  .single();

  let userId: string;
  if (userData) {
    userId = userData.id;
  } else {
    const { data: newUser, error: insertError } = await supabaseServer
    .from('user')
    .insert({ email })
    .select()
    .single();

    if (insertError || !newUser) {
      return { success: false, message: 'ユーザの作成に失敗しました。'}
    }
  }

  return {
    success: true,
    message: 'token検証OK',
    email: tokenRecode.email
  };
}
