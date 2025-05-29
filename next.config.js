/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: process.env.NEXTJS_BASE_PATH || '',
}

module.exports = nextConfig 