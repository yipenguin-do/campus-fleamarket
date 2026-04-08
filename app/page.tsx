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
      <h1 className="text-2xl font-bold py-5">Campus Fleamarket Dokkyo</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : posts.length === 0 ? (
        <p>投稿はまだありません</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>
            <PostCard {...post} />
          </div>

        ))
      )}
      <Link
        href='/posts/new'
        className="w-fit h-fit bg-blue-500 p-1 px-5 rounded-full fixed bottom-5 right-5 text-[40px] text-white"
      >
        +
      </Link>
    </div>
  );
}