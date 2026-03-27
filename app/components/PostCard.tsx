'use client'
import Link from 'next/link'

type Props = {
  id: string
  title: string
  price: number
  image_url: string
}

export default function PostCard({ id, title, price, image_url }: Props) {
  return (
    <div style={{ border:'1px solid #ccc', padding:'10px', margin:'10px' }}>
      <Link href={`/posts/${id}`}>
        <img src={image_url} width={150} />
        <h3>{title}</h3>
        <p>{price}円</p>
      </Link>
    </div>
  )
}