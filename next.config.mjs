/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["10.0.60.123", "168.231.64.178", "images.unsplash.com", "https://picsum.photos", "10.0.60.126"],
  },
  serverActions: {
    bodySizeLimit: '10mb', // or whatever size you need
  },
};

export default nextConfig;
