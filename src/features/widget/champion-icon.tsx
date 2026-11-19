'use client'

import Image from 'next/image'

import { useDdragonVersion } from '@/features/widget/ddragon-provider'
import { cn } from '@/lib/cn'
import { buildChampionIconUrl } from '@/lib/ddragon'

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
            className={cn('block', className)}
            height={128}
            src={buildChampionIconUrl(version, champion)}
            width={128}
        />
    )
}
