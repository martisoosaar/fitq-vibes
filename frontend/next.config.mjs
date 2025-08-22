/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'old.fitq.me',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'app.fitq.me',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      }
    ],
  }
};

export default nextConfig;

