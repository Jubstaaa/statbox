import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Self-hosted on a DigitalOcean droplet: standalone emits a minimal server.js
    // plus traced node_modules, which is what the runner image starts.
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                hostname: 'ddragon.leagueoflegends.com',
                protocol: 'https',
            },
        ],
    },
}

export default nextConfig
