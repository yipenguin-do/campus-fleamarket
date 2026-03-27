'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{ display:'flex', gap:'15px', marginBottom:'20px' }}>
      <Link href="/">メイン</Link>
      <Link href="/posts/new">新規投稿</Link>
      <Link href="/mypage">マイページ</Link>
      <Link href="/login">ログイン</Link>
    </nav>
  )
}