/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'letsenhance.io',
      'example.com',
      'images.unsplash.com',
      'picsum.photos',
      'loremflickr.com',
      'placekitten.com',
      'placeimg.com',
      'via.placeholder.com',
      'source.unsplash.com',
      'randomuser.me',
      'cloudflare-ipfs.com',
    ],
  },
}

export default nextConfig
