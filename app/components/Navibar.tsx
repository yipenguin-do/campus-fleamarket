'use client'
import Link from 'next/link'
import LogoutButton  from "../components/Logout";

export default function Navbar() {
  return (
    <nav>
      <Link href="/">メイン</Link>
      <Link href="/posts/new">新規投稿</Link>
      <Link href="/mypage">マイページ</Link>
      <Link href="/login">ログイン</Link>
      <LogoutButton />
    </nav>
  )
}