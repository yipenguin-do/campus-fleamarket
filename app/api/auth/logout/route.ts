'use server';
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";

export async function POST(request: Request) {
  // クライアント側でログアウトする場合
  // supabase.auth.signOut() を使うのが正しい

  const response = NextResponse.json({ success: true });

  // サーバー側でトークンを削除したい場合
  response.cookies.delete('sb-access-token'); // pathは不要
  response.cookies.delete('sb-refresh-token');

  return response;
}