// components/AuthInitializer.tsx
// "use client";
// import { useEffect } from "react";
// import { supabase } from "@/lib/supabaseClient";

// export default function AuthInitializer() {
//   useEffect(() => {
//     const fetchUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;

//       // サーバーサイドで DB登録を呼ぶ
//       await fetch("/api/auth/init-user", { method: "POST" });

//       console.log("Logged in user:", user);
//     };

//     fetchUser();
//   }, []);

//   return null;
// }