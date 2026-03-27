'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MyPage() {
  const [posts, setPosts] = useState<any[]>([])

  const fetchPosts = async () => {
    const user = await supabase.auth.getUser()
    const userId = user.data.user?.id
    if (!userId) return
    const { data } = await supabase.from('posts').select('*').eq('user_id', userId)
    setPosts(data || [])
  }

  const handleDelete = async (id: string) => {
    await supabase.from('posts').update({ is_deleted: true }).eq('id', id)
    fetchPosts()
  }

  useEffect(() => { fetchPosts() }, [])

  return (
    <div>
      <h1>マイページ</h1>
      {posts.map(p => (
        <div key={p.id}>
          <img src={p.image_url} width={100} />
          <h3>{p.title}</h3>
          <p>{p.status}</p>
          <button onClick={() => handleDelete(p.id)}>削除</button>
        </div>
      ))}
    </div>
  )
}