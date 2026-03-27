"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email.endsWith("@dokkyo.ac.jp")) {
      alert("学内メールのみ利用可能です");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      console.error(error);
      setMessage("送信に失敗しました");
    } else {
      setMessage("ログインリンクをメールに送信しました！");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>ログイン</h1>

      <input
        type="email"
        placeholder="example@dokkyo.ac.jp"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ border: "1px solid #ccc", padding: 8 }}
      />

      <br /><br />

      <button onClick={handleLogin}>
        ログインリンク送信
      </button>

      <p>{message}</p>
    </div>
  );
}