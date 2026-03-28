// pages/api/auth/init-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return res.status(401).json({ error: "Not logged in" });

  try {
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      display_name: user.email?.split("@")[0],
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB registration failed" });
  }
}