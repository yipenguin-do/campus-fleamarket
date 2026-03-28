// /app/components/PostCard.tsx
"use client";

import Link from "next/link";

interface PostCardProps {
  id: string;
  title: string;
  price: number;
  image_url: string;
  status: string;
}

export default function PostCard({ id, title, price, image_url, status }: PostCardProps) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12, borderRadius: 6 }}>
      {image_url && <img src={image_url} alt={title} style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />}
      <h3>{title}</h3>
      <p>価格: ¥{price}</p>
      {status === "sold" && <span style={{ color: "red" }}>販売済み</span>}
      <Link href={`/posts/${id}`}>
        <button>詳細を見る</button>
      </Link>
    </div>
  );
}