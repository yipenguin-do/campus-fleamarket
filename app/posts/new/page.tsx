'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
    if (submitting) return; // 二重送信防止
    setSubmitting(true);

    try {
      const { toast } = await import("react-hot-toast");
      const heic2any = (await import("heic2any")).default;
      const imageCompression = (await import("browser-image-compression")).default;
      // 🔹 入力チェック
      if (!title || !price || !description) {
        toast.error("必須項目を入力してください");
        return;
      }

      if (title.length < 0 || title.length > 20) {
        toast.error("タイトルは0~20文字以内で書いてください。")
        return;
      }

      if (description.length < 0 || description.length > 300) {
        toast.error("説明は0~300文字以内で書いてください。")
        return;
      }

      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 100000) {
        toast.error("価格は0〜100000の数字で入力してください");
        return;
      }

      if (contactMethods.length === 0) {
        toast.error("連絡手段を1つ以上選択してください");
        return;
      }

      if (!file) {
        toast.error("画像は必須です");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("画像ファイルのみアップロード可能です");
        return;
      }

      let targetFile = file;

      if (
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif")
      ) {
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });

          targetFile = new File(
            [convertedBlob as Blob],
            "converted.jpg",
            { type: "image/jpeg" }
          );
        } catch (err) {
          console.error(err);
          toast.error("HEIC画像の変換に失敗しました");
          toast.error(
            "この画像は対応していません。\n" +
            "iPhoneの設定で「互換性優先」に変更してください。"
          );
          return;
        }
      }

      let finalFile: File;

      if (targetFile.size <= 400 * 1024) {
        // 🔹 200KB未満 → そのまま使う
        finalFile = targetFile;
      } else {
        // 🔹 200KB以上 → 圧縮
        finalFile = await imageCompression(targetFile, {
          maxSizeMB: 0.4,
          maxWidthOrHeight: 1000,
          initialQuality: 0.7,
          useWebWorker: true,
          fileType: "image/webp",
        });
      }

      // 🔹 サイズチェック（超重要）
      if (finalFile.size > 1 * 1024 * 1024) {
        toast.error("画像サイズが大きすぎます（1MB以下にしてください）");
        return;
      }

      // 🔹 セッション取得
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("ログインしてください");
        router.replace("/login");
        return;
      }

      const user = session.user;
      const token = session.access_token;

      // 🔹 Storageに直接アップロード
      const filePath = `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.webp`;

      const { error: uploadError } = await supabase.storage
        .from("campus-fleamarket")
        .upload(filePath, finalFile, {
          contentType: "image/webp",
        });

      if (uploadError) {
        console.error(uploadError);
        toast.error("画像アップロードに失敗しました");
        return;
      }

      // 🔹 公開URL取得
      const { data } = supabase.storage
        .from("campus-fleamarket")
        .getPublicUrl(filePath);

      const imageUrl = data.publicUrl;

      // 🔹 API送信（JSON）
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          price: parsedPrice,
          contactMethods,
          line,
          x,
          instagram,
          image_url: imageUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "投稿失敗");
        return;
      }

      toast.success("投稿完了！")
      router.push("/mypage");

    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="pt-10 pb-50 max-w-90 m-auto justify-center">
      <h1 className="pl-5 text-3xl font-bold">新規投稿</h1>
      <section className="pl-10 pt-5">
        <input
          placeholder="タイトル"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={50}
          className="border-2 border-[#61975b] rounded-lg pl-2 w-60"
        />

        <div className="pt-2">
          <textarea
            placeholder="説明"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={300}
            rows={5}
            className="border-2 border-[#61975b] rounded-lg pl-2 pt-1 w-60"
          />
        </div>




        <br /><br />

        <input
          type="number"
          min="0"
          max="100000"
          placeholder="価格"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="border-2 border-[#61975b] rounded-lg pl-2 w-60"
        />

        <br /><br />

        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="border-2 border-[#61975b] rounded-lg w-fit"
        />

        <h3 className="pt-5 text-lg font-bold">連絡手段</h3>

        <label>
          <input
            type="checkbox"
            checked={contactMethods.includes("line")}
            onChange={() => toggleMethod("line")}
          /> LINE
        </label>
        <div className="pl-5">
          {contactMethods.includes("line") && (
            <input placeholder="LINE ID" value={line || ""} onChange={e => setLine(e.target.value)} className="pl-2 border-2 border-[#61975b] rounded-lg" />
          )}
        </div>
        <br />

        <label>
          <input
            type="checkbox"
            checked={contactMethods.includes("x")}
            onChange={() => toggleMethod("x")}
          /> X
        </label>
        <div className="pl-5">
          {contactMethods.includes("x") && (
            <input placeholder="Xユーザー名" value={x || ""} onChange={e => setX(e.target.value)} className="pl-2 border-2 border-[#61975b] rounded-lg" />
          )}
        </div>

        <br />

        <label>
          <input
            type="checkbox"
            checked={contactMethods.includes("instagram")}
            onChange={() => toggleMethod("instagram")}
          /> Instagram
        </label>
        <div className="pl-5">
          {contactMethods.includes("instagram") && (
            <input placeholder="Instagramユーザー名" value={instagram || ""} onChange={e => setInstagram(e.target.value)} className="pl-2 border-2 border-[#61975b] rounded-lg" />
          )}
        </div>

        <br /><br />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="border-2 border-[#61975b] rounded-lg w-fit px-3 text-sm"
        >
          {submitting ? "投稿中..." : "投稿する"}
        </button>      </section>
    </div>

  );
}