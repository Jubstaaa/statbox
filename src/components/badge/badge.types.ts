import type { ReactNode } from 'react'

export interface BadgeProps {
    children: ReactNode
    className?: string
    tone?: 'default' | 'accent' | 'success'
}
