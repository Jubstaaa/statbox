import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    fullWidth?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
}
