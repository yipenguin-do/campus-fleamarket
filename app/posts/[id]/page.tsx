// /app/posts/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface Post {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    contact_methods: string[];
    contact_line?: string;
    contact_x?: string;
    contact_instagram?: string;
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
    const [post, setPost] = useState<Post | null>(null);
    const [user, setUser] = useState<any>(null);

    const templateMessage = encodeURIComponent(
        `はじめまして！\nこの教科書はまだ購入可能でしょうか？`
    );

    useEffect(() => {
        const fetchData = async () => {
            // 投稿取得
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("id", params.id)
                .single();

            if (error) {
                console.error(error);
            } else {
                setPost(data);
            }

            // ユーザー取得
            const { data: userData } = await supabase.auth.getUser();
            setUser(userData.user);
        };

        fetchData();
    }, [params.id]);

    if (!post) return <p>読み込み中...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>{post.title}</h1>

            {post.image_url && (
                <Image
                    src={post.image_url}
                    alt={post.title}
                    style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
                />
            )}

            <p>価格: ¥{post.price}</p>
            <p>{post.description}</p>

            <hr />

            {/* ログインしている場合のみ表示 */}
            {user ? (
                <div>
                    <h3>出品者に連絡</h3>

                    {/* LINE */}
                    {post.contact_methods?.includes("line") && post.contact_line && (
                        <a
                            href={`https://line.me/R/ti/p/${post.contact_line}`}
                            target="_blank"
                        >
                            <button>LINEで連絡</button>
                        </a>
                    )}

                    {/* X（旧Twitter） */}
                    {post.contact_methods?.includes("x") && post.contact_x && (
                        <a
                            href={`https://twitter.com/${post.contact_x}?text=${templateMessage}`}
                            target="_blank"
                        >
                            <button>Xで連絡</button>
                        </a>
                    )}

                    {/* Instagram */}
                    {post.contact_methods?.includes("instagram") && post.contact_instagram && (
                        <a
                            href={`https://instagram.com/${post.contact_instagram}`}
                            target="_blank"
                        >
                            <button>Instagramで連絡</button>
                        </a>
                    )}

                    <p style={{ marginTop: 10, fontSize: 12 }}>
                        ※ 上記リンクから直接メッセージを送ってください
                    </p>
                </div>
            ) : (
                <p>※ 連絡するにはログインが必要です</p>
            )}
        </div>
    );
}