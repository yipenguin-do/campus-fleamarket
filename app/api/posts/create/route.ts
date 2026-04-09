import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { sanitize, sanitizeObject } from "@/lib/sanitize";

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

    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);

    const title = sanitizedBody.title || "";
    const description = sanitizedBody.description || "";
    const price = Number(body.price || 0);
    const contactMethods = sanitizedBody.contactMethods || [];
    const line = sanitizedBody.line || null;
    const x = sanitizedBody.x || null;
    const instagram = sanitizedBody.instagram || null;
    const image_url = sanitizedBody.image_url || null;

    if (title.length > 50 || description.length > 300) {
      return NextResponse.json({ error: "文字数オーバー" }, { status: 400 });
    }

    if (isNaN(price)) {
      return NextResponse.json({ error: "価格が不正です" }, { status: 400 });
    }
    if (price < 0 || price > 100000) {
      return NextResponse.json({ error: "価格が不正です" }, { status: 400 });
    }

    const allowedMethods = ["line", "x", "instagram"];

    if (!Array.isArray(contactMethods) ||
      !contactMethods.every(m => allowedMethods.includes(m))) {
      return NextResponse.json({ error: "連絡手段が不正です" }, { status: 400 });
    }

    if (!image_url) {
      return NextResponse.json({ error: "画像のURLがありません" }, { status: 400 });
    }

    if (!image_url.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
      return NextResponse.json({ error: "不正な画像URLです" }, { status: 400 });
    }

    if (!title || !description || isNaN(price) || contactMethods.length === 0) {
      return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
    }

    if (!image_url) {
      return NextResponse.json({ error: "画像のURLがありません" }, { status: 400 });
    }

    const { data: existingPosts } = await supabaseServer
      .from("posts")
      .select("id")
      .eq("user_id", userId)
      .eq("title", title)
      .eq("price", price)
      .eq("image_url", image_url)
      .limit(1);

    if (existingPosts?.length) {
      return NextResponse.json({ error: "同じ内容の投稿が既に存在します" }, { status: 400 });
    }

    const { data: insertedPost, error: insertError } = await supabaseServer
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
      })
      .select() // 👈 これ追加（ID取るため）
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `投稿作成失敗: ${insertError.message}` },
        { status: 500 }
      );
    }

    try {
      await supabaseServer.from("audit_logs").insert({
        user_id: userId,
        action: "create_post",
        target_id: insertedPost.id,
        metadata: { title, price },
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
      });
    } catch (err) {
      console.error("Audit log insert failed:", err);
      // 監査ログ失敗でも処理は続行
    }
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("POST /create error:", err);
    return NextResponse.json({ error: err.message || "サーバーエラー" }, { status: 500 });
  }
}