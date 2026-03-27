"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import imageCompression from "browser-image-compression";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    // ① ユーザー取得
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }

    // ② usersテーブル取得（BANチェック）
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (userProfile.is_banned) {
      alert("利用停止されています");
      return;
    }

    if (!title || !price || !description) {
      alert("必須項目を入力してください");
      return;
    }

    // ③ 画像アップロード
    let image_url = "";

    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("画像ファイルのみアップロード可能です");
        return;
      }

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
      })

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, compressedFile);

      if (uploadError) {
        alert("画像アップロード失敗");
        return;
      }

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      image_url = data.publicUrl;
    }

    // ④ 投稿作成
    const { error } = await supabase.from("posts").insert({
      title,
      description,
      price: Number(price),
      image_url,
      user_id: user.id,
      status: "active",
      is_deleted: false,
    });

    if (error) {
      alert("投稿失敗");
      console.error(error);
    } else {
      alert("投稿成功！");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>新規投稿</h1>

      <input
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="価格"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <br /><br />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setFile(e.target.files?.[0] || null);
        }}
      />

      <br /><br />

      <button onClick={handleSubmit}>
        投稿する
      </button>
    </div>
  );
}