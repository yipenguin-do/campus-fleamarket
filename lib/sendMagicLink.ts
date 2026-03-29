// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function sendMagicLink(to: string, magicLink: string) {
//   try {
//     await resend.emails.send({
//       from: "no-reply@yourdomain.com", // 本番用の送信ドメインに変更
//       to,
//       subject: "ログインリンク（大学内フリマ）",
//       html: `
//         <p>以下のリンクをクリックしてログインしてください。</p>
//         <a href="${magicLink}">ログインリンク</a>
//       `,
//     });
//     console.log(`Magic link sent to ${to}`);
//   } catch (error) {
//     console.error("Failed to send magic link:", error);
//     throw error;
//   }
// }