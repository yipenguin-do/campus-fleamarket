// /app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; // fuckin problem is here
import PostCard from "./components/PostCard";

interface Post {
  id: string;
  title: string;
  price: number;
  image_url: string;
  status: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false }); // .orderでidが高いように並べ替える。

      if (error) {
        console.error(error);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="w-fit m-auto justify-center item-center">
      <h1 className="text-2xl font-bold py-5 pb-10">Campus Fleamarket Dokkyo</h1>

      <div className="w-[90%] border-1 m-auto justify-center py-2">
        <details open>
          <summary>ニュース</summary>
          <ol>
            <li className="pl-4 text-sm"><Link href={'/policy'}>通報機能について</Link></li>
            <li className="pl-4 text-sm"><Link href={'/policy'}>利用規約、個人情報保護方針について</Link></li>
          </ol>
        </details>

      </div>
      

      {loading ? (
        <p className="pt-20 pb-100 m-auto text-center text-gray-500">読み込み中...</p>
      ) : posts.length === 0 ? (
        <p className="m-auto text-center text-gray-500 pt-20 pb-100">投稿はまだありません</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="py-3">
            <PostCard {...post} />
          </div>

        ))
      )}
    </div>
  );
}