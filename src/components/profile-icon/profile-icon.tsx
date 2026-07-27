'use client'

import Image from 'next/image'

import { cn } from '@/lib/cn'
import { buildProfileIconUrl } from '@/lib/ddragon'
import { useDdragonVersion } from '@/providers/ddragon-provider/ddragon-provider'

import type { ProfileIconProps } from './profile-icon.types'

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
