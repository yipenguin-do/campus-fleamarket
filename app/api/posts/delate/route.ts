import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  console.error("DELETE API called"); // ここが出るか確認

  try {
    const authHeader = req.headers.get("Authorization") || "";
    console.error("authHeader:", authHeader); // ここも確認

    const token = authHeader.replace("Bearer ", "").trim();
    console.error("token after trim:", token); // ここまで出るか確認

    if (!token) {
      return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
    console.error("userError:", userError, "user:", user);
    if (!user || userError) {
      return NextResponse.json({ error: "ユーザー情報が取得できません" }, { status: 401 });
    }

    const userId = user.id;
    console.error("Received userId:", userId);

    // リクエストボディから postId 取得
    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "投稿IDが必要です" }, { status: 400 });
    }

    // 投稿を取得して本人確認
    const { data: post, error: fetchError } = await supabaseServer
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "投稿が存在しません" }, { status: 404 });
    }

    if (post.user_id !== userId) {
      return NextResponse.json({ error: "他人の投稿は削除できません", status: 403 });
    }

    // 削除フラグ更新
    const { error: updateError } = await supabaseServer
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", postId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("delete error:", err);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}