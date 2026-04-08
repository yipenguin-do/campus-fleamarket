import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  try {
    const { id, email, university, is_banned, is_admin } = await req.json();

    // user が存在するか確認
    const { data: existingUser, error: selectError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("id", id)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    if (!existingUser) {
      // 存在しなければ登録
      const { error: insertError } = await supabaseServer
        .from("users")
        .insert({
          id,
          email,
          university,
          is_banned,
          is_admin
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "サーバーエラー" }, { status: 500 });
  }
}