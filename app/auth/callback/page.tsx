'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CallbackPage() {
  const [message, setMessage] = useState('ログイン処理中…');
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (!access_token || !refresh_token) {
          router.replace('/login');
          return;
        }

        // 1. セッションをセットしてログイン確定
        await supabase.auth.setSession({ access_token, refresh_token });

        // 2. 初回ユーザー作成 API 呼び出し
        const userResponse = await supabase.auth.getUser();
        const userData = userResponse.data.user;
        
        if (!userData || !userData.email) {
          router.replace('/login');
          return;
        }
        
        await fetch('/api/auth/init-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userData.id,
            email: userData.email,
            display_name: userData.user_metadata?.full_name || userData.email.split('@')[0],
          }),
        });

        setMessage('ログイン完了！マイページへ移動中…');

        // 3. マイページにリダイレクト
        router.replace('/mypage');
      } catch (err) {
        console.error(err);
        setMessage('ログインに失敗しました');
      }
    };

    handleLogin();
  }, [params, router]);

  return <div style={{ padding: 20 }}><p>{message}</p></div>;
}