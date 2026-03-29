import { createClient } from '@supabase/supabase-js'

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // プロジェクトURL
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin権限
  {
    auth: { persistSession: false }, // サーバー用はセッション維持不要
  }
)