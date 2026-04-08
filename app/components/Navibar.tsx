'use client'
import Link from 'next/link'
import LogoutButton  from "../components/Logout";

export default function Navbar() {
  return (
    <nav className='w-fit m-auto justify-center flex gap-2 text-sm pt-10'>
      <Link href="/">メイン</Link>
      <Link href="/posts/new">新規投稿</Link>
      <Link href="/mypage">マイページ</Link>
      <Link href="/login">ログイン</Link>
      <LogoutButton />
    </nav>
  )
}