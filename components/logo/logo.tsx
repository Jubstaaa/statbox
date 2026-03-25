import Image from 'next/image'

import { cn } from '@/lib/cn'

import type { LogoProps } from './logo.types'

export default function Logo({ className, size = 'md' }: LogoProps) {
    const px = { lg: 44, md: 36, sm: 28 }[size]
    const textClass = { lg: 'text-2xl', md: 'text-lg', sm: 'text-sm' }[size]

    return (
        <div className={cn('flex items-center gap-2.5', className)}>
            <Image
                alt=""
                aria-hidden="true"
                height={px}
                src="/logo.svg"
                width={px}
            />
            <span
                className={cn('text-text font-bold tracking-tight', textClass)}>
                Stat<span className="text-accent">Box</span>
            </span>
        </div>
    )
}
