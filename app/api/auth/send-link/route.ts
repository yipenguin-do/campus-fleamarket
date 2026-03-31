import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { supabaseServer } from '@/lib/supabaseServerClient';
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email) return NextResponse.json({ message: '送信されました！' });

    // ★ IP修正
    const rawIp = request.headers.get('x-forwarded-for') || '';
    const ip = rawIp.split(',')[0].trim() || 'unknown';

    // ★ Rate Limit（ここだけでOK）
    const emailLimit = await checkRateLimit(`email:${email}`);
    const ipLimit = await checkRateLimit(`ip:${ip}`);

    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json({
        message: '送信されました！メールを確認してください。'
      });
    }

    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev && !email.endsWith('@dokkyo.ac.jp')) {
      return NextResponse.json({ message: '送信されました！' });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    const token = crypto.randomBytes(32).toString('hex'); // ★改善
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const magicLink = `${baseUrl}/auth/callback?token=${token}`;

    // ★ supabaseServer使用
    await supabaseServer.from('magic_links').insert({
      email,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const targetEmail = isDev ? 'porarius332@gmail.com' : email;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: targetEmail,
      subject: 'ログインリンク',
      html: `<p>以下のリンクをクリックしてログインしてください:</p>
             <a href="${magicLink}">ログイン</a>`,
    });

    return NextResponse.json({
      message: '送信されました！メールを確認してください。'
    });

  } catch (err) {
    console.error("SendLink Error:", err);
    return NextResponse.json({
      message: '送信されました！メールを確認してください。'
    });
  }
}