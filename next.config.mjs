/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Prevent build-time lint serialization issues; run lint separately
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;
