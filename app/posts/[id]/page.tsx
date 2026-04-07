'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

type Post = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  status: string;
  contact_methods: string[];
  contact_line: string | null;
  contact_x: string | null;
  contact_instagram: string | null;
  user_id: string;
};

type User = {
  id: string;
  display_name: string;
  email: string;
  university?: string;
};

export default function PostPage() {
  const { id } = useParams(); // URLからid取得
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        // 投稿取得
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (postError || !postData) {
          console.error(postError);
          setLoading(false);
          return;
        }

        setPost(postData);

        // 投稿者情報取得
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', postData.user_id)
          .single();

        if (userError || !userData) {
          console.error(userError);
          setLoading(false);
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>読み込み中...</div>;
  if (!post) return <div>投稿が見つかりません</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{post.title}</h1>
      {post.image_url && (
        <Image
          src={post.image_url}
          alt={post.title}
          width={500}
          height={500}
        />
      )}
      <p>{post.description}</p>
      <p>価格: ¥{post.price}</p>
      <p>状態: {post.status}</p>

      <h2>連絡方法</h2>
      {post.contact_methods.includes("line") && <p>LINE: {post.contact_line}</p>}
      {post.contact_methods.includes("x") && <p>X: {post.contact_x}</p>}
      {post.contact_methods.includes("instagram") && <p>Instagram: {post.contact_instagram}</p>}

      {user && (
        <>
          <h3>出品者情報</h3>
          <p>名前: {user.display_name}</p>
          {user.university && <p>大学: {user.university}</p>}
        </>
      )}
    </div>
  );
}