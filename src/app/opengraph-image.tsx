import { createOgImage, OG_IMAGE_SIZE } from '@/lib/og/og-image'

export const alt = 'StatBox - OBS widget for League of Legends streamers'
export const contentType = 'image/png'
export const size = OG_IMAGE_SIZE

export default function OpenGraphImage() {
    return createOgImage({
        subtitle:
            'Free OBS browser source widget with live rank, LP, recent matches, and session-based W/L.',
        title: 'StatBox',
    })
}
