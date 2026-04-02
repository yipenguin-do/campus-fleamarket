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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

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
    <div style={{ padding: 20 }}>
      <button onClick={() => handleLogout()}>ログアウト</button>
      <h1>教科書フリマ</h1>
      <Link href="/posts/new">
        <button>＋ 投稿する</button>
      </Link>

      {loading ? (
        <p>読み込み中...</p>
      ) : posts.length === 0 ? (
        <p>投稿はまだありません</p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))
      )}
    </div>
  );
}