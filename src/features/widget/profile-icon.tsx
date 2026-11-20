'use client'

import Image from 'next/image'

import { useDdragonVersion } from '@/features/widget/ddragon-provider'
import { cn } from '@/lib/cn'
import { buildProfileIconUrl } from '@/lib/ddragon'

// Icons render at 24-46 CSS px; 48 gives next/image a 48/96 srcset instead of
// fetching 256 px for a 38 px slot.
const ICON_SIZE = 48

export interface ProfileIconProps {
    borderColor?: string
    className?: string
    iconId: number
    ringClassName?: string
}

export default function ProfileIcon({
    borderColor,
    className,
    iconId,
    ringClassName = 'border',
}: ProfileIconProps) {
    const version = useDdragonVersion()

    return (
        <Image
            alt=""
            className={cn('block shrink-0', ringClassName, className)}
            height={ICON_SIZE}
            src={buildProfileIconUrl(version, iconId)}
            style={borderColor ? { borderColor } : undefined}
            width={ICON_SIZE}
        />
    )
}
