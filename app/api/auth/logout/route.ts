import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    await supabaseServer
      .from("sessions")
      .delete()
      .eq("id", sessionId);
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: "session_id",
    value: "",
    expires: new Date(0),
    path: "/",
  });

  return response;
}