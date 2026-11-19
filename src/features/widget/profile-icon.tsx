'use client'

import Image from 'next/image'

import { useDdragonVersion } from '@/features/widget/ddragon-provider'
import { cn } from '@/lib/cn'
import { buildProfileIconUrl } from '@/lib/ddragon'

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
            alt="Profile"
            className={cn('block', ringClassName, className)}
            height={128}
            src={buildProfileIconUrl(version, iconId)}
            style={borderColor ? { borderColor } : undefined}
            width={128}
        />
    )
}
