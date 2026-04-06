'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type User = {
    id: string;
    display_name: string;
    email: string;
    university?: string;
    is_admin: boolean;
    is_banned: boolean;
    created_at: string;
};

type Post = {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    status: string;
    is_deleted: boolean;
    contact_methods: string[];
    contact_line: string | null;
    contact_x: string | null;
    contact_instagram: string | null;
    user_id: string;
    created_at: string;
};

export default function MyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    router.replace("/login");
                    return;
                }

                // DB からユーザ情報取得
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (userError || !userData) {
                    console.error(userError);
                    router.replace("/login");
                    return;
                }

                const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: false });

                if (postsError) {
                    console.error(postsError);
                }
                if (!postsError && postsData) {
                    setPosts(postsData);
                }

                setUser(userData);
            } catch (err) {
                console.error(err);
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading) return <div>読み込み中...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h1>マイページ</h1>
            {user && (
                <div>
                    <p><strong>名前:</strong> {user.display_name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    {user.university && <p><strong>大学:</strong> {user.university}</p>}
                </div>
            )}

            <h2>自分の投稿</h2>

            {!loading && posts.length === 0 && <p>投稿はまだありません</p>}

            {posts.map((post) => (
                <div key={post.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>

                    <h3>{post.title}</h3>

                    {post.image_url && (
                        <img
                            src={post.image_url}
                            alt="投稿画像"
                            style={{ width: 200, height: "auto" }}
                        />
                    )}


                    <p>{post.description}</p>
                    <p>価格: ¥{post.price}</p>
                    <p>状態: {post.status}</p>

                </div>
            ))}
        </div>
    );
}