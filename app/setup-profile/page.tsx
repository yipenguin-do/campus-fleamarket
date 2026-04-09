'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { sanitize } from "@/lib/sanitize";

export default function SetupProfile() {
    const [name, setName] = useState("");
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (submitting) return; // 二重送信防止
        setSubmitting(true);

        if (!name) {
            toast.error("ユーザー名を入力してください");
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("ログインしてください");
            return;
        }

        // 既に登録済みチェック
        const { data: existing } = await supabase
            .from("users")
            .select("display_name")
            .eq("id", session.user.id)
            .single();

        if (existing?.display_name) {
            router.push("/");
            return;
        }

        const safeName = sanitize(name);

        if (!(safeName.length > 0 || safeName.length < 15)) {
            toast.error("文字数は15文字以下にしてください。")
            return;
        }

        const { error } = await supabase.from("users").upsert({
            id: session.user.id,
            email: session.user.email,
            display_name: safeName,
        });

        if (error) {
            toast.error("登録失敗");
            setSubmitting(false);
            return;
        }

        toast.success("登録完了！")
        setSubmitting(false);
        router.push("/");
    };

    return (
        <div className="pt-10 pb-100 text-center">
            <h1 className="text-xl">ユーザー名を設定してください。</h1>
            <p className="text-xs text-gray-500 pt-1">※安全上、一度決めたユーザ名は変更できません。</p>
            <p className="text-xs text-gray-500">また、不適切な名前であると判断された場合は退会措置とします。</p>
            <div className="flex gap-5 m-auto justify-center pt-5">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ユーザー名"
                    className="border-2 border-[#61975b] rounded-lg pl-2 w-60"
                />
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="border-1 border-[#61975b] px-1 rounded-lg text-sm"    
                >
                    {submitting ? "登録中..." : "登録" }
                </button>
            </div>

        </div>
    );
}