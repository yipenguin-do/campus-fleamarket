import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ success: false, message: '不正なリンク' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { data: tokenRecode } = await supabaseServer
      .from('magic_links')
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (!tokenRecode) return NextResponse.json({ success: false, message: '無効なリンクです' });

    if (tokenRecode.used_at) return NextResponse.json({ success: false, message: 'リンクはすでに使用されています' });

    if (new Date(tokenRecode.expires_at) < new Date()) {
      return NextResponse.json({ success: false, message: 'リンクの有効期限が切れています' });
    }


    let userId: string;
    const { data: userData } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', tokenRecode.email)
      .maybeSingle();

    if (userData) {
      userId = userData.id;
    } else {
      const { data: newUser } = await supabaseServer
        .from('users')
        .insert({
          email: tokenRecode.email,
          displayname: tokenRecode.email.split('@')[0],
          is_banned: false,
          is_admin: false,
        })
        .select()
        .single();
      userId = newUser.id;
    }


    const { count } = await supabaseServer
      .from('magic_links')
      .update({ used_at: new Date() })
      .eq('id', tokenRecode.id)
      .is('used_at', null);

    if (count === 0) return NextResponse.json({ success: false, message: 'リンクはすでに使用されています'});


    const sessionId = crypto.randomBytes(32).toString('hex');
    await supabaseServer.from('sessions').insert({
      id: sessionId,
      user_id: userId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: 'session_id',
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: '不明なエラーが発生しました' });
  }
}


// import { supabaseServer } from '@/lib/supabaseServerClient';
// import crypto from "crypto";
// import { randomBytes } from "crypto";

// export async function initUser(token: string) {
//   if (!token || typeof token !== 'string') {
//     return {
//       success: false,
//       message: '不正なリンクです(tokenなし)。',
//     };
//   }

//   const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

//   const { data: tokenRecode, error } = await supabaseServer
//     .from('magic_links')
//     .select('*')
//     .eq('token_hash', tokenHash)
//     .single();

//   //   const { count, error } = await supabaseServer
//   //   .from('magic_links')
//   //   .update({ used_at: new Date() })
//   //   .eq('id', tokenRecode.id)
//   //   .is('used_at', null);
//   // if (count === 0) {
//   //   return { success: false, message: 'このリンクはすでに使用されています' };
//   // }

//   if (error || !tokenRecode) {
//     return { success: false, message: '無効なリンクです。' };
//   }

//   const now = new Date();
//   if (new Date(tokenRecode.expires_at) < now) {
//     return { success: false, message: 'リンクの有効期限が切れています。' }
//   }

//   if (tokenRecode.used_at) {
//     return { success: false, message: 'このリンクはすでに使用されています。' }
//   }

//   const email = tokenRecode.email;
//   const { data: userData, error: userError } = await supabaseServer
//     .from('users')
//     .select('*')
//     .eq('email', email)
//     .maybeSingle();

//   if (userError) {
//     return { success: false, message: 'ユーザー取得に失敗しました' };
//   }

//   let userId: string;
//   if (userData) {
//     userId = userData.id;
//   } else {
//     const { data: newUser, error: insertError } = await supabaseServer
//       .from('users')
//       .insert({
//         email,
//         display_name: email.split('@')[0],
//         university: null,
//         is_banned: false,
//         is_admin: false
//       })
//       .select()
//       .single();

//     if (insertError || !newUser) {
//       return { success: false, message: 'ユーザの作成に失敗しました。' }
//     }
//     userId = newUser.id;
//   }

//   // token が有効で、ユーザーを取得または作成した後
//   const { error: updateError } = await supabaseServer
//     .from('magic_links')
//     .update({ used_at: new Date() })
//     .eq('id', tokenRecode.id);

//   if (updateError) {
//     return { success: false, message: 'トークン更新に失敗しました。' };
//   }

//   const sessionId = randomBytes(32).toString('hex');

//   const { error: sessionError } = await supabaseServer
//     .from('sessions')
//     .insert({
//       id: sessionId,
//       user_id: userId,
//       expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//     });

//   if (sessionError) {
//     return { success: false, message: 'セッション作成に失敗しました' };
//   }

//   return {
//     success: true,
//     message: 'ユーザ取得OK',
//     userId,
//     sessionId: sessionId,
//   };
// }
