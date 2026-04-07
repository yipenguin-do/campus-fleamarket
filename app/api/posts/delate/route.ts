import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  try {
    // 🔹 token取得
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
    }

    // 🔹 ユーザー取得
    const { data: { user }, error: userError } =
      await supabaseServer.auth.getUser(token);

    if (!user || userError) {
      return NextResponse.json({ error: "認証エラー" }, { status: 401 });
    }

    // 🔹 body取得
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "投稿IDが必要です" }, { status: 400 });
    }

    // 🔹 論理削除
    const { error } = await supabaseServer
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", postId);

    if (error) {
      return NextResponse.json({ error: "削除失敗: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("delete error:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}