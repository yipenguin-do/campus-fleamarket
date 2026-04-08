import './globals.css'
import Navbar from './components/Navibar'
import { Toaster } from "react-hot-toast";
// import AuthInitializer from "./components/AuthInitializer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className='bg-[#f6f3ed]'>
        {/* <AuthInitializer /> */}
        <Navbar />
        <main>{children}</main>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}