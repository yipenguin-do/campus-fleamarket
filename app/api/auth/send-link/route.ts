import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    // 1. リクエストの body を JSON として取得
    const body = await request.json();
    const { email } = body; // クライアントから送られた email を取得

    // バリデーション
    if (!email) {
      return NextResponse.json({ error: 'メールアドレスを入力して下さい。' }, { status: 400 });
    }
    const isTest = process.env.NODE_ENV === 'development';

    if (!isTest && !email.endsWith('@dokkyo.ac.jp')) {
      return NextResponse.json({ error: '学内メールアドレスのみ使用可能です' }, { status: 400 });
    }

    const targetEmail = isTest ? 'porarius332@gmail.com' : email;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const token = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const magicLink = `${baseUrl}/auth/callback?token=${token}`;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const normalizedEmail = email.trim().toLowerCase();

    // tokenをDBに入れる
    const { error: dbError } = await supabase
      .from('magic_links')
      .insert({
        email: normalizedEmail,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      })

    if (dbError) {
      console.error(dbError);
      return NextResponse.json(
        { error: 'トークン保存に失敗しました。' },
        { status: 500 }
      );
    }

    const { error: mailError } = await resend.emails.send({
      from: 'onboarding@resend.dev', //test
      to: targetEmail,
      subject: 'ログインリンク',
      html: `<p>以下のリンクをクリックしてログインしてください:</p>
             <a href="${magicLink}">ログイン</a>`,
    });

    if (mailError) {
      console.error(mailError);
      return NextResponse.json(
        { error: 'メール送信に失敗しました。' },
        { status: 500 }
      );
    }

    // -----------------------------
    // 5. 成功レスポンス
    // -----------------------------
    return NextResponse.json({ message: 'メール送信に成功しました！' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: '不明なエラーが発生しました。' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'GETは使えません' }, { status: 405 });
}