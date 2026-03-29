'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    // if (!email.endsWith('@dokkyo.ac.jp')) {
    //   alert('学内メールのみ利用可能です');
    //   return;
    // }

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('ログインリンクをメールに送信しました！受信トレイを確認してください。');
      } else {
        console.error(data);
        setMessage(data.error || '送信に失敗しました');
      }
    } catch (err) {
      console.error(err);
      setMessage('送信に失敗しました');
    }
  };

  return (
    <div>
      <h1>ログイン</h1>
      <input
        type="email"
        placeholder='学内メールアドレス'
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>

  );
}