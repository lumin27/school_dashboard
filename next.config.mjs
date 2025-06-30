/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
    domains: ["res.cloudinary.com", "as1.ftcdn.net"],
  },
};

export default nextConfig;
