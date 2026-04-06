'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // フォームステート
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [contactMethods, setContactMethods] = useState<string[]>([]);
  const [line, setLine] = useState<string | null>(null);
  const [x, setX] = useState<string | null>(null);
  const [instagram, setInstagram] = useState<string | null>(null);

  // ログインチェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          router.replace("/login");
          return;
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    };
    checkAuth();
  }, [router]);

  const toggleMethod = (method: string) => {
    setContactMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  // 🔹 投稿送信
  const handleSubmit = async () => {
    // 🔹 入力チェック
    if (!title || !price || !description) {
      alert("必須項目を入力してください");
      return;
    }
  
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 100000) {
      alert("価格は0〜100000の数字で入力してください");
      return;
    }
  
    if (contactMethods.length === 0) {
      alert("連絡手段を1つ以上選択してください");
      return;
    }
  
    // 🔹 画像圧縮
    let compressedFile: File | null = null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("画像ファイルのみアップロード可能です");
        return;
      }
      compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        fileType: "image/webp",
        initialQuality: 0.7,
        useWebWorker: true,
      });
    } else {
      alert("画像は必須です");
      return;
    }
  
    // 🔹 FormData作成
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", String(parsedPrice));
    formData.append("contactMethods", JSON.stringify(contactMethods));
    if (line) formData.append("line", line);
    if (x) formData.append("x", x);
    if (instagram) formData.append("instagram", instagram);
    formData.append("file", compressedFile);
  
    try {
      // 🔹 セッション取得
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("ログインしてください");
        router.replace("/login");
        return;
      }
  
      const token = session.access_token;
  
      // 🔹 API送信
      const res = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        alert(result.error || "投稿失敗");
        return;
      }
  
      // 🔹 成功時はマイページに遷移
      router.push("/mypage");
  
    } catch (err: any) {
      console.error("投稿エラー:", err);
      alert("通信エラーが発生しました");
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>新規投稿</h1>

      <input
        placeholder="タイトル"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        placeholder="説明"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        min="0"
        max="100000"
        placeholder="価格"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />

      <br /><br />

      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />

      <h3>連絡手段</h3>

      <label>
        <input
          type="checkbox"
          checked={contactMethods.includes("line")}
          onChange={() => toggleMethod("line")}
        /> LINE
      </label>
      {contactMethods.includes("line") && (
        <input placeholder="LINE ID" value={line || ""} onChange={e => setLine(e.target.value)} />
      )}
      <br />

      <label>
        <input
          type="checkbox"
          checked={contactMethods.includes("x")}
          onChange={() => toggleMethod("x")}
        /> X
      </label>
      {contactMethods.includes("x") && (
        <input placeholder="Xユーザー名" value={x || ""} onChange={e => setX(e.target.value)} />
      )}
      <br />

      <label>
        <input
          type="checkbox"
          checked={contactMethods.includes("instagram")}
          onChange={() => toggleMethod("instagram")}
        /> Instagram
      </label>
      {contactMethods.includes("instagram") && (
        <input placeholder="Instagramユーザー名" value={instagram || ""} onChange={e => setInstagram(e.target.value)} />
      )}

      <br /><br />

      <button onClick={handleSubmit}>投稿する</button>
    </div>
  );
}