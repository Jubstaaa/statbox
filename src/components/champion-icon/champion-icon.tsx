'use client'

import Image from 'next/image'

import { cn } from '@/lib/cn'
import { buildChampionIconUrl } from '@/lib/ddragon'
import { useDdragonVersion } from '@/providers/ddragon-provider/ddragon-provider'

import type { ChampionIconProps } from './champion-icon.types'

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
