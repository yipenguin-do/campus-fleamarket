'use client'

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('リンクを確認中です...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('不正なアクセスです。');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/auth/init-user', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (data.success) {
          router.replace('/')
        } else {
          setMessage(
            data.success
              ? "ログインしました"
              : "リンクが無効または期限切れです"
          );
        }
      } catch (err) {
        console.error(err);
        setMessage('ネットワークエラーが発生しました。');
      }
    })();
  }, [searchParams, router]);

  return <div>{message}</div>
}

// import { initUser } from "@/app/api/auth/init-user";
// import { NextResponse } from "next/server";

// export default async function CallbackPage({ searchParams }: { searchParams: { token?: string } }) {
//   const token = searchParams.token;
//   if (!token) return <div>不正なアクセスです。</div>

//   const result = await initUser(token);

//   if (!result.success) return <div>{result.message}</div>

//   const sessionId = result.sessionId;
//   if (!sessionId) {
//     return <div>セッション作成に失敗しました。</div>;
//   }

//   const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL));
//   response.cookies.set({
//     name: 'session_id',
//     value: sessionId,
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax',
//     path: '/',
//     expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
//   });

//   return response
// }