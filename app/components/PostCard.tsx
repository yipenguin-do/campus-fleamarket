// /app/components/PostCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";


interface PostCardProps {
  id: string;
  title: string;
  price: number;
  image_url: string;
  status: string;
}

export default function PostCard({ id, title, price, image_url, status }: PostCardProps) {
  return (
    <div className="w-fit h-fit p-5 border-[#61975b] border-3 rounded-2xl">
      <Link href={`/posts/${id}`}>
        {image_url && <Image src={image_url} alt={title} width={300} height={300} loading="eager" className="cover" />}
        <h3 className="pt-5 text-lg font-bold">{title}</h3>
        <p>価格: ¥{price}</p>
        {status === "sold" && <span style={{ color: "red" }}>販売済み</span>}
      </Link>
    </div>
  );
}