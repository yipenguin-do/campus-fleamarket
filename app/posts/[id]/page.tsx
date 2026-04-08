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
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
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

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', postData.user_id)
          .single();

        if (!userData || userError) {
          // 非ログインの場合は user を null のまま
          setUser(null);
        } else {
          setUser(userData);
        }
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
          loading="eager"
        />
      )}
      <p>{post.description}</p>
      <p>価格: ¥{post.price}</p>
      {post.status === 'active'
        ? <p className="text-green-500">販売中</p>
        : <p className="text-red-500">売り切れ</p>
      }
      
      {!user && (
        <div className="pt-5 text-gray-500 text-sm">
          <h1>出品者情報や連絡方法はログイン後に閲覧できます。</h1>
        </div>
      )}

      {/* user が存在する場合のみ連絡方法・出品者情報を表示 */}
      {user && (
        <>
          <h2>連絡方法</h2>
          {post.contact_methods.includes("line") && post.contact_line && (
            <p>
              LINE:{" "}
              <a
                href={`https://line.me/R/ti/p/${post.contact_line}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {post.contact_line}
              </a>
            </p>
          )}
          {post.contact_methods.includes("x") && post.contact_x && (
            <p>
              X:{" "}
              <a
                href={`https://twitter.com/${post.contact_x}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                @{post.contact_x}
              </a>
            </p>
          )}
          {post.contact_methods.includes("instagram") && post.contact_instagram && (
            <p>
              Instagram:{" "}
              <a
                href={`https://www.instagram.com/${post.contact_instagram}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                @{post.contact_instagram}
              </a>
            </p>
          )}

          <h3>出品者情報</h3>
          <p>名前: {user.display_name}</p>
          {user.university && <p>大学: {user.university}</p>}
        </>
      )}
    </div>
  );
}