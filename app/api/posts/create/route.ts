import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  try {
    // Authorization
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "ログインしてください" }, { status: 401 });

    // ユーザー取得
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
    if (!user || userError) return NextResponse.json({ error: "ユーザー情報が取得できません" }, { status: 401 });
    const userId = user.id;

    // フォームデータ取得
    const formData = await req.formData();
    const title = formData.get("title")?.toString() || "";
    const description = formData.get("description")?.toString() || "";
    const price = Number(formData.get("price")?.toString() || "0");
    const contactMethods = JSON.parse(formData.get("contactMethods")?.toString() || "[]");
    const line = formData.get("line")?.toString() || null;
    const x = formData.get("x")?.toString() || null;
    const instagram = formData.get("instagram")?.toString() || null;
    const file = formData.get("file") as File | null;

    // バリデーション
    if (!title || !description || isNaN(price) || contactMethods.length === 0) {
      return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "画像は必須です" }, { status: 400 });
    }

    // 画像アップロード
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.normalize("NFKD").replace(/[^\w.-]/g, "_");
    const filePath = `${userId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseServer.storage
      .from("campus-fleamarket")
      .upload(filePath, buffer, { contentType: file.type });
    if (uploadError) return NextResponse.json({ error: `画像アップロード失敗: ${uploadError.message}` }, { status: 500 });

    const { data: publicUrlData } = supabaseServer.storage
      .from("campus-fleamarket")
      .getPublicUrl(filePath);
    const image_url = publicUrlData.publicUrl ?? null;

    // 投稿をDBに保存
    const { error: insertError } = await supabaseServer
      .from("posts")
      .insert({
        title,
        description,
        price,
        image_url,
        status: "active",
        is_deleted: false,
        contact_methods: contactMethods,
        contact_line: line,
        contact_x: x,
        contact_instagram: instagram,
        user_id: userId,
      });

    if (insertError) return NextResponse.json({ error: `投稿作成失敗: ${insertError.message}` }, { status: 500 });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("POST /create error:", err);
    return NextResponse.json({ error: err.message || "サーバーエラー" }, { status: 500 });
  }
}