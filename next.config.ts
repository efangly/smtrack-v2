import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // จำเป็นสำหรับ Docker image แบบ standalone (ดู Dockerfile)
  output: 'standalone'
}

export default nextConfig
