import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
};

module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
