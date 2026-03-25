'use client'

import { ExternalLink } from 'lucide-react'

import Card from '@/components/card/card'
import CopyButton from '@/components/copy-button/copy-button'

import type { UrlBlockProps } from './widget-generator.types'

export default function UrlBlock({
    action,
    description,
    label,
    url,
}: UrlBlockProps) {
    return (
        <Card className="border-border-secondary bg-bg-elevated space-y-3 rounded-2xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-text text-sm font-semibold">{label}</p>
                    <p className="text-text-muted mt-0.5 text-xs">
                        {description}
                    </p>
                </div>
                <a
                    aria-label={`${label} preview`}
                    className="text-text-muted hover:text-accent mt-0.5 transition-colors"
                    href={url}
                    rel="noopener noreferrer"
                    target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </div>
            <div className="border-border-secondary bg-bg-base flex items-center gap-2 rounded-xl border px-2.5 py-2.5">
                <code className="text-text-strong flex-1 truncate font-mono text-xs">
                    {url}
                </code>
                <div className="flex shrink-0 items-center gap-1.5">
                    {action}
                    <CopyButton text={url} />
                </div>
            </div>
        </Card>
    )
}
