import { config } from 'dotenv';
import 'dotenv/config'
import type { NextConfig } from "next"

const envFilePath = process.env.ENV_FILE_PATH

if (envFilePath) {
  config({ path: envFilePath });
}

const nextConfig: NextConfig = {
  async rewrites() {
    const destination = `${process.env.BACKEND_API_URL}/api/:path*`;
    console.log(`Proxying API requests to: ${destination}`);
    return [
      {
        source: '/api/:path*',
        destination,
      },
    ]
  },
  experimental: {
    ppr: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        hostname: "assets.pipedream.net",
      },
    ],
  },
  output: "export",
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}

export default nextConfig
