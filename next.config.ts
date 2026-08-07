import type { NextConfig } from 'next'

import packageJson from './package.json'

const nextConfig: NextConfig = {
  // จำเป็นสำหรับ Docker image แบบ standalone (ดู Dockerfile)
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
}

export default nextConfig
