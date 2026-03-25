import Image from 'next/image'

import { cn } from '@/lib/cn'
import { getProfileIconUrl } from '@/lib/ddragon-client'

import type { ProfileIconProps } from './profile-icon.types'

export default function ProfileIcon({
    borderColor,
    className,
    iconId,
    ringClassName = 'border',
}: ProfileIconProps) {
    return (
        <Image
            alt="Profile"
            className={cn('block', ringClassName, className)}
            height={128}
            src={getProfileIconUrl(iconId)}
            style={borderColor ? { borderColor } : undefined}
            width={128}
        />
    )
}
