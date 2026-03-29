import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServerClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email: string };

  // 学内メールチェック
  if (!email.endsWith('@dokkyo.ac.jp')) {
    return NextResponse.json(
      { error: '学内メールのみ利用可能' },
      { status: 400 }
    );
  }

  if (
    process.env.NODE_ENV === 'production' &&
    !email.endsWith('@dokkyo.ac.jp')
  ) {
    return new Response(JSON.stringify({ error: '学内メールのみ利用可能です' }), { status: 400 });
  }

  try {
    // 1. Supabaseでマジックリンク生成
    const { data, error } = await supabaseServer.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: 'http://localhost:3000/auth/callback' },
    });

    if (error || !data?.user) {
      console.error(error);
      return NextResponse.json(
        { error: 'マジックリンク生成に失敗しました' },
        { status: 500 }
      );
    }

    // 2. マジックリンクを自分で組み立て
    // SDK 最新版では data.link がないので URL を手動作成
    const magicLink = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?${new URLSearchParams(
      {
        type: 'magiclink',
        email: data.user.email!,
        redirect_to: 'http://localhost:3000/auth/callback',
      }
    ).toString()}`;

    // 3. Resendでメール送信
    await resend.emails.send({
      from: 'no-reply@example.com',
      to: email,
      subject: 'ログインリンク',
      html: `<p>こちらのリンクをクリックしてログインしてください:</p>
             <a href="${magicLink}">${magicLink}</a>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'メール送信中にエラーが発生しました' },
      { status: 500 }
    );
  }
}