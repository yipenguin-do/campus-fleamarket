// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { supabaseServer } from "@/lib/supabaseServerClient";

// export async function GET() {
//   try {
//     const cookieStore = await cookies();
//     const sessionId = cookieStore.get("session_id")?.value;

//     if (!sessionId) {
//       return NextResponse.json({ user: null });
//     }

//     // セッション取得
//     const { data: session, error: sessionError } = await supabaseServer
//     .from("sessions")
//     .select("*")
//     .eq("id", sessionId)
//     .maybeSingle();
  
//   if (sessionError || !session) {
//     return NextResponse.json({ user: null });
//   }

//     // 期限チェック
//     if (new Date(session.expires_at) < new Date()) {
//       return NextResponse.json({ user: null });
//     }

//     // ユーザー取得
//     const { data: user } = await supabaseServer
//       .from("users")
//       .select("*")
//       .eq("id", session.user_id)
//       .maybeSingle();

//     return NextResponse.json({ user });

//   } catch (err) {
//     console.error("[ME API ERROR]", err);
//     return NextResponse.json({ user: null });
//   }
// }