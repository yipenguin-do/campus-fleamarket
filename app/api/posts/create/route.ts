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

    const body = await req.json();

    const title = body.title || "";
    const description = body.description || "";
    const price = Number(body.price || 0);
    const contactMethods = body.contactMethods || [];
    const line = body.line || null;
    const x = body.x || null;
    const instagram = body.instagram || null;
    const image_url = body.image_url || null;

    if (!title || !description || isNaN(price) || contactMethods.length === 0) {
      return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
    }

    if (!image_url) {
      return NextResponse.json({ error: "画像のURLがありません" }, { status: 400 });
    }

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

      if (insertError) {
        return NextResponse.json(
          { error: `投稿作成失敗: ${insertError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("POST /create error:", err);
    return NextResponse.json({ error: err.message || "サーバーエラー" }, { status: 500 });
  }
}