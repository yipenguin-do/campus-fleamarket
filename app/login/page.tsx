'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    if (!email) {
      setMessage("メールアドレスを入力して下さい。");
      return;
    }

    if (!email.endsWith("@dokkyo.ac.jp")) {
      setMessage("学内メールアドレスのみ使用可能です。");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const data = await res.json();

      if (!res.ok)
        setMessage(data.error || "送信エラーが発生しました。")
      else
        setMessage("送信されました！")
    } catch (err) {
      console.error(err);
      setMessage("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div>
      <h1>ログイン</h1>
      <input
        type="email"
        placeholder="学内メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className=''
      />
      <button
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? '送信中...' : '送信'}
      </button>

      <p>
        {message}
      </p>
    </div>

  );
}