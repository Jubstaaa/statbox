export const buttonVariants = {
    ghost: 'bg-transparent text-text-muted hover:bg-bg-elevated/70 hover:text-text',
    outline:
        'bg-transparent text-text border border-border-secondary hover:border-accent hover:text-accent',
    primary:
        'bg-accent text-bg-base shadow-[0_14px_34px_rgba(244,201,93,0.2)] hover:bg-[#ffd978]',
    secondary:
        'bg-bg-elevated text-text border border-border-secondary hover:border-border-hover hover:bg-bg-soft',
} as const

export const buttonSizes = {
    lg: 'h-12 px-4 text-sm rounded-2xl',
    md: 'h-10 px-4 text-sm rounded-xl',
    sm: 'h-9 px-3 text-sm rounded-xl',
} as const
