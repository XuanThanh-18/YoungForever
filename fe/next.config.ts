import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Backend local – ảnh upload lưu tại http://localhost:8080/api/v1/images/...
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      {
        // Cho phép mọi HTTPS domain (Cloudinary, CDN, v.v.)
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
