import { supabaseServer } from '@/lib/supabaseServerClient';

export async function checkRateLimit(key: string) {
  const { data, error } = await supabaseServer
    .rpc('check_rate_limit', { p_key: key });

  if (error) {
    console.error("RateLimit error:", error);
    return { allowed: false }; // fail-safe（安全側に倒す）
  }

  return { allowed: data === true };
}