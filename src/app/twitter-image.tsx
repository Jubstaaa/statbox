import { createOgImage, OG_IMAGE_SIZE } from '@/lib/og/og-image'

export const alt = 'StatBox - OBS widget for League of Legends streamers'
export const contentType = 'image/png'
export const size = OG_IMAGE_SIZE

export default function TwitterImage() {
    return createOgImage({
        subtitle:
            'Generate League of Legends OBS widgets with session tracking, live rank, and recent match stats.',
        title: 'StatBox',
    })
}
