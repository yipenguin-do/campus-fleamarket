'use client';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut(); // ← 必須
    router.replace("/login");
  };

  return <button onClick={handleLogout}>ログアウト</button>;
}