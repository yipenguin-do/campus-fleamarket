import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // サーバー用キー
  {
    // サーバー専用オプション（必要に応じて）
    auth: {
      persistSession: false, // サーバーではセッション自動保存不要
    },
  }
);