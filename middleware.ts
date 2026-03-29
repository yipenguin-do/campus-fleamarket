import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from './lib/supabaseServerClient';

// 保護対象ページ
const protectedPaths = ['/mypage', '/posts/new'];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // 保護対象のパスか確認
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    try {
      // Cookie から Supabase のアクセストークンを取得
      const access_token = req.cookies.get('sb-access-token')?.value;

      if (!access_token) {
        // 未ログインなら /login にリダイレクト
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      // サーバー側でユーザー情報を確認
      const { data: { user }, error } = await supabaseServer.auth.getUser(access_token);

      if (!user || error) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      // ログイン済みなら通過
      return NextResponse.next();
    } catch (err) {
      console.error('Middleware error:', err);
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // 保護対象でない場合は通過
  return NextResponse.next();
}

// この middleware を適用するパス
export const config = {
  matcher: ['/mypage', '/posts/new'],
};