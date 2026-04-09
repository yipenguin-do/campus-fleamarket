'use client';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut(); // ← 必須
    router.replace("/login");
  };

  return <button onClick={handleLogout} className="border-1 border-gray-400 rounded-md bg-gray-100 px-1 dark:bg-gray-500">ログアウト</button>;
}