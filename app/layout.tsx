import './globals.css'
import Navbar from './components/Navibar'
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Josefin_Sans } from "next/font/google";
// import AuthInitializer from "./components/AuthInitializer";

const JosefinSans = Josefin_Sans({
  style: "normal",
  subsets: ["latin"],
  variable: "--font-JosefinSans"
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className='bg-[#f6f3ed]'>
        {/* <AuthInitializer /> */}
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-center" />

        <Link
        href='/posts/new'
        className="w-fit h-fit bg-blue-500 p-1 px-5 rounded-full fixed bottom-5 right-5 text-[40px] text-white"
      >
        +
      </Link>

        <footer className='h-100 pt-10 bg-[#6c9286]'>
          <div className='text-center'>
            <p className='pb-3 text-md'>powered by</p>
            <h1 className={`${JosefinSans.className} text-5xl`}>Dokkyo-Info.</h1>
          </div>
          <section className='flex justify-center gap-x-10'>
              <div>
                <h2 className='pt-10 text-xl font-bold pb-2'>SNS</h2>
                <p className='text-md'>Instagram: <a href="https://www.instagram.com/dokkyo_info?igsh=bnF0dXRtbmUxOG9n&utm_source=qr">@dokkyo_info</a></p>
                <p className='text-md'>Twitter:　　<a href="https://x.com/Duinfo_koho"></a>@Duinfo_koho</p>
              </div>
              <div>
                <h2 className='pt-10 text-xl font-bold pb-2'>フォーム類</h2>
                <p className='text-xs py-1'>※現在アクセス不可</p>
                <p className='text-md'><a href="#">・被害相談窓口</a></p>
                <p className='text-md'><a href="#"></a>・お問い合わせ</p>
              </div>
            </section>
        </footer>
      </body>
    </html>
  )
}