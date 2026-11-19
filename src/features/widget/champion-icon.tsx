'use client'

import Image from 'next/image'

import { useDdragonVersion } from '@/features/widget/ddragon-provider'
import { cn } from '@/lib/cn'
import { buildChampionIconUrl } from '@/lib/ddragon'

// Icons render at 24-46 CSS px; 48 gives next/image a 48/96 srcset instead of
// fetching 256 px for a 38 px slot.
const ICON_SIZE = 48

export interface ChampionIconProps {
    champion: string
    className?: string
}

export default function ChampionIcon({
    champion,
    className,
}: ChampionIconProps) {
    const version = useDdragonVersion()

    return (
        <Image
            alt={champion}
            className={cn('block shrink-0', className)}
            height={ICON_SIZE}
            src={buildChampionIconUrl(version, champion)}
            width={ICON_SIZE}
        />
    )
}
