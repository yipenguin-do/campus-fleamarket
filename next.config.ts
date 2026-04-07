import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  reactStrictMode: true,
  images: {
    domains: ['mnzhsbuzwhqmkhmtpuwk.supabase.co'], // ← Supabase ストレージのホスト名
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
