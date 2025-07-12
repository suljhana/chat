import { config } from 'dotenv';
import 'dotenv/config'
import type { NextConfig } from "next"

const envFilePath = process.env.ENV_FILE_PATH

if (envFilePath) {
  config({ path: envFilePath });
}

const nextConfig: NextConfig = {
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
  output: "standalone",
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    NEXT_PUBLIC_AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
  }
}

export default nextConfig
