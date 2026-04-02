import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('session_id')?.value;

  const publicPathsRegex = [
    /^\/login$/,
    /^\/auth\/callback$/,
    /^\/$/,
    /^\/posts\/\d+$/
  ];

  if (publicPathsRegex.some((re) => re.test(request.nextUrl.pathname))) {
    return NextResponse.next();
  }

  // ❌ cookieなし
  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // DBチェック
  const { data: session } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  // ❌ 無効セッション
  if (!session || new Date(session.expires_at) < new Date()) {
    const response = NextResponse.redirect(new URL('/login', request.url));

    // 👇 cookie強制削除（重要）
    response.cookies.set("session_id", "", {
      path: "/",
      expires: new Date(0),
    });

    return response;
  }

  // OK
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico).*)',
  ]
}