'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PostCard from './components/PostCard'

type Post = {
  id: string
  title: string
  price: number
  image_url: string
  is_deleted: boolean
}

export default function MainPage() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('is_deleted', false)
      setPosts(data || [])
    }
    fetchPosts()
  }, [])

  return (
    <div>
      <h1>投稿一覧</h1>
      <div style={{ display:'flex', flexWrap:'wrap' }}>
        {posts.map(p => (
          <PostCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  )
}