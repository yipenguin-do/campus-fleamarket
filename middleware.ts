import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;

  // ログイン不要ページ
  const publicPaths = ['/login', '/auth/callback', '/', '/posts/[id]'];

  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // セッションなし → ログインへ
  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // DBでセッション確認
  const { data: session } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  // 無効 or 期限切れ
  if (!session || new Date(session.expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // OK
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}