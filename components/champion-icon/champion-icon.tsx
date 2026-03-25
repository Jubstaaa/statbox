import Image from 'next/image'

import { cn } from '@/lib/cn'
import { getChampionIconUrl } from '@/lib/ddragon-client'

import type { ChampionIconProps } from './champion-icon.types'

export default function ChampionIcon({
    champion,
    className,
}: ChampionIconProps) {
    return (
        <Image
            alt={champion}
            className={cn('block', className)}
            height={128}
            src={getChampionIconUrl(champion)}
            width={128}
        />
    )
}
