'use client';

import { useState } from 'react';
import Link from "next/link";

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

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setMessage("有効なメールアドレスを入力してください。");
      return;
    }

    if (!email.endsWith("@dokkyo.ac.jp")) {
      setMessage("学内メールアドレスのみ使用可能です。");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      setMessage("送信されました！メールを確認して下さい。") //表記統一

    } catch (err) {
      console.error(err)
      setMessage("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div>
      <h1 className='text-2xl pt-10 pb-1 pl-4'>ログイン</h1>
      <p className='text-xs text-gray-500 pl-5 pb-7'>※サービスを利用する場合、<Link href={'/policy'}><u>利用規約・個人情報保護方針</u></Link>に同意したものとみなします。</p>
      <section className='flex'>
        <div className='pl-6 pr-4 pb-7'>
          <input
            type="email"
            placeholder="学内メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='border-2 border-[#61975b] rounded-lg pl-2 w-60'
          />
        </div>
        <div className=''>
          <button
            onClick={handleLogin}
            disabled={loading}
            className='border-1 border-[#61975b] px-1 rounded-lg text-sm'
          >
            {loading ? '送信中...' : '送信'}
          </button>
        </div>
      </section>



      <p className='pb-100 pl-10'>
        {message}
      </p>
    </div>

  );
}