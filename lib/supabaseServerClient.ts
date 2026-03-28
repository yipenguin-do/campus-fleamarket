// lib/supabaseServerClient.ts
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export function createServerSupabaseClient(req?: NextRequest) {
  const cookieMethods = req
    ? {
        get: (name: string) => {
          const cookie = req.cookies.get(name);
          return cookie ? cookie.value : null;
        },
        getAll: () => {
          // RequestCookies には getAll があるので map して変換
          return req.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
        },
        set: () => {},    // 読み取り専用なら空
        delete: () => {}, // 読み取り専用なら空
      }
    : undefined; // App Router Server Component では不要

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods!, // undefined は渡さない
    }
  );
}