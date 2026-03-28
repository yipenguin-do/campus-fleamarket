// /app/mypage/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Post {
    id: string;
    title: string;
    price: number;
    status: string;
    is_deleted: boolean;
}

export default function MyPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyPosts = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
        } else {
            setPosts(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchMyPosts();
    }, []);

    // 販売済みにする
    const markAsSold = async (id: string) => {
        const { error } = await supabase
            .from("posts")
            .update({ status: "sold" })
            .eq("id", id);

        if (!error) {
            fetchMyPosts();
        }
    };

    // 論理削除
    const softDelete = async (id: string) => {
        const ok = confirm("削除しますか？");
        if (!ok) return;

        const { error } = await supabase
            .from("posts")
            .update({ is_deleted: true })
            .eq("id", id);

        if (!error) {
            fetchMyPosts();
        }
    };

    if (loading) return <p>読み込み中...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>マイページ</h1>

            {posts.length === 0 ? (
                <p>投稿はまだありません</p>
            ) : (
                posts.map((post) => (
                    <div
                        key={post.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: 12,
                            marginBottom: 12,
                        }}
                    >
                        <h3>{post.title}</h3>
                        <p>¥{post.price}</p>

                        {post.status === "sold" ? (
                            <p style={{ color: "red" }}>販売済み</p>
                        ) : (
                            <button
                                disabled={post.status === "solid"}
                                onClick={() => markAsSold(post.id)}
                            >
                                販売済みにする
                            </button>
                        )}

                        <br /><br />

                        <button onClick={() => softDelete(post.id)}>
                            削除
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}