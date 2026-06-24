/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    '@whiskeysockets/baileys',
    'pino',
    'qrcode',
  ],
}

export default nextConfig
