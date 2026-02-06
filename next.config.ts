import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan baris ini agar bisa diakses dari IP lokal (HP)
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.1.2:3000'] 
    }
  }
};

export default nextConfig;