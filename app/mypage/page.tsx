'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";

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
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    // const handleDelete = async (postId: string) => {
    //     if (!window.confirm("本当に削除しますか？")) return;

    //     try {
    //         const token = await supabase.auth.getSession().then(r => r.data.session?.access_token);
    //         if (!token) {
    //             toast.error("ログインしてください");
    //             return;
    //         }

    //         const res = await fetch("/api/posts/delete", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Authorization": `Bearer ${token}`
    //             },
    //             body: JSON.stringify({ postId })
    //         });

    //         const result = await res.json();

    //         if (!res.ok || !result.success) {
    //             toast.error(result.error || "削除に失敗しました");
    //             return;
    //         }

    //         setPosts(prev => prev.filter(p => p.id !== postId));
    //         toast.success("投稿を削除しました");
    //     } catch (err) {
    //         console.error(err);
    //         toast.error("通信エラーが発生しました");
    //     }
    // };


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

    if (loading) return <div className="py-20 m-auto text-center text-gray-500">読み込み中...</div>;

    return (
        <div className="mx-90">
            <h1 className="text-2xl font-bold pl-5 pb-3 pt-20">マイページ</h1>
            {user && (
                <div>
                    <p className="py-1 pl-6"><strong>ユーザ名:</strong> {user.display_name}</p>
                    <p className="py-1 pl-6"><strong>メールアドレス:</strong> {user.email}</p>
                    {/* {user.university && <p><strong>大学:</strong> {user.university}</p>} */}
                </div>
            )}

            <h2 className="text-xl pl-7 pt-10 pb-8 font-bold">自分の投稿</h2>

            {!loading && posts.length === 0 && <p className="m-auto text-center text-gray-500 pt-10">投稿はまだありません</p>}

            <div className="grid grid-cols-2 m-auto justify-center item-center max-w-90 pb-30">
                {posts.map((post) => (
                    <div key={post.id} className="m-auto justify-center item-center border-3 border-[#61975b] w-45 p-5 rounded-2xl h-fit">

                        <h3 className="text-lg font-bold">{post.title}</h3>

                        {post.image_url && (
                            <Image
                                src={post.image_url}
                                alt="投稿画像"
                                width={100}
                                height={100}
                                loading="eager"
                            />
                        )}


                        <p className="pt-2 text-sm">{post.description}</p>
                        <p>価格: ¥{post.price}</p>
                        {post.status === 'active'
                            ? <p className="text-green-500">販売中</p>
                            : <p className="text-red-500">売り切れ</p>
                        }




                        {/* <button
                        key={post.id}
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingIds.includes(post.id)}
                    >
                        {deletingIds.includes(post.id) ? "削除中…" : "削除"}
                    </button> */}
                    </div>
                ))}
            </div>

        </div>
    );
}