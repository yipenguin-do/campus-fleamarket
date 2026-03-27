"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthInitializer() {
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // ✅ usersテーブルに登録（または更新）
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        display: user.email?.split("@")[0],
      });

      if (error) {
        console.error("users登録エラー", error);
      }
    };

    initUser();
  }, []);

  return null;
}