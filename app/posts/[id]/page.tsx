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

  if (loading) return <div className="pt-20 pb-100 m-auto text-center text-gray-500">読み込み中...</div>;
  if (!post) return <div className="pt-20 pb-100 m-auto text-center text-gray-500">投稿が見つかりません</div>;

  return (
    <div className="px-10 pt-10 pb-30">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      {post.image_url && (
        <Image
          src={post.image_url}
          alt={post.title}
          width={500}
          height={500}
          loading="eager"
          className="py-5"
        />
      )}
      <p className="text-lg pb-2">{post.description}</p>
      <p className="text-lg">価格: ¥{post.price}</p>
      {post.status === 'active'
        ? <p className="text-green-600 text-md">販売中</p>
        : <p className="text-red-500 text-md">売り切れ</p>
      }
      
      {!user && (
        <div className="pt-5 text-gray-500 text-sm pb-20">
          <h1>出品者情報や連絡方法はログイン後に閲覧できます。</h1>
        </div>
      )}

      {/* user が存在する場合のみ連絡方法・出品者情報を表示 */}
      {user && (
        <>
           {/* {encodeURIComponent(`はじめまして！\nこの教科書はまだ購入可能でしょうか？`)} */}
          <h2 className="text-xl pt-5">連絡方法</h2>
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

          <h3 className="text-xl pt-5">出品者情報</h3>
          <p className="text-sm pb-2">※通報する場合に使用するため、購入する際はユーザ名をメモしておいてください。</p>
          <p>ユーザ名: "{user.display_name}"</p>
          {/* {user.university && <p>大学: {user.university}</p>} */}
        </>
      )}
    </div>
  );
}