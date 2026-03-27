import './globals.css'
import Navbar from './components/Navibar'
import AuthInitializer from "./components/AuthInitializer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthInitializer />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}