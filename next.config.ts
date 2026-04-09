import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  reactStrictMode: true,
  images: {
    domains: ['mnzhsbuzwhqmkhmtpuwk.supabase.co'], // ← Supabase ストレージのホスト名
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mnzhsbuzwhqmkhmtpuwk.supabase.co", // 例: your-project.supabase.co
        port: "",
        pathname: "/storage/v1/**", // Supabase Storage のパスに合わせる
      },
    ]
  },
};

export default nextConfig;
