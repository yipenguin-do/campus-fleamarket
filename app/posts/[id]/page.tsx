'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function PostDetail() {
  const params = useParams()
  const [post, setPost] = useState<any>(null)

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase.from('posts').select('*').eq('id', params.id).single()
      setPost(data)
    }
    fetchPost()
  }, [params.id])

  if (!post) return <div>読み込み中...</div>

  return (
    <div>
      <h2>{post.title}</h2>
      <img src={post.image_url} width={200} />
      <p>{post.description}</p>
      <h4>連絡方法</h4>
      {post.contact_methods?.map((m: string) => (
        <div key={m}><a href="#">{m}</a></div>
      ))}
    </div>
  )
}