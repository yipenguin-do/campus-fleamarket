import { NextResponse } from 'next/server';
import { Resend } from 'resend';
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
    
    const { data, error } = await supabaseServer.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (error || !data?.properties?.action_link) {
      console.error("GenerateLink Error:", error);
      return NextResponse.json({
        message: '送信されました！メールを確認してください！'
      });
    }

    const magicLink = data.properties.action_link;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const targetEmail = isDev ? process.env.DEV_MAIL : email;

    await resend.emails.send({
      from: 'onbording@resend.dev',
      to: targetEmail,
      subject: 'ログインリンク',
      html: `
        <h2 style="font-size:18px; font-weight:bold;>Campus Fleamarket Dokkyo</h2>
        <p>サービスに登録していただきありがとうございます。</p>
        <p>以下のリンクをクリックしてログインして下さい:</p>
        <a href="${magicLink}" style="color: blue; text-decoration: none;">ログイン</a>
        <br>
        <p>もし身に覚えがない場合、リンクにアクセスせずにこのメールを無視して下さい。</p>
      `,
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