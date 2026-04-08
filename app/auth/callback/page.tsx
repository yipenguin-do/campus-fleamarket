'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { POST } from "@/app/api/auth/send-link/route";

export default function CallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('リンクを確認中です...');

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          console.error("[CALLBACK] error:", error);
          setMessage("リンクが無効または期限切れです");
          return;
        }

        const user = data.session.user;

        try {
          const res = await fetch('/api/auth/init-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              university: user.email?.split('@')[1],
              is_banned: false,
              is_admin: false,
            })
          });

          if (!res.ok) {
            const errData = await res.json();
            console.error('API エラー: ', errData.error);
            alert('ユーザ登録に失敗しました: ' + (errData.err || '原因不明'));
            return;
          }

          const result = await res.json();
          if (!result.success) {
            console.error('登録失敗: ', result.error);
            alert('ユーザ登録に失敗しました: ' + (result.error || '原因不明'));
            return;
          }

          const { data: userData } = await supabase
            .from("users")
            .select("display_name")
            .eq("id", user.id)
            .single();

          if (!userData?.display_name) {
            router.replace("/setup-profile");
            return;
          }

          // 既に設定済みなら通常遷移
          router.replace("/");

        } catch (err: any) {
          console.error('ネットワークエラー: ', err);
          alert('ネットワークエラーが発生しました。再度お試しください。')
        }
      } catch (err) {
        console.error(err);
        setMessage('ネットワークエラーが発生しました。');
      }
    };

    handleLogin();
  }, [router]);

  return <div>{message}</div>;
}