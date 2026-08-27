import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    // Silence the Dart Sass @import deprecation warning that fires on
    // @import "tailwindcss" — this directive is handled by PostCSS, not Sass.
    silenceDeprecations: ["import"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
