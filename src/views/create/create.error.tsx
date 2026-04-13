'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import Button from '@/components/button/button'
import Card from '@/components/card/card'

import type { CreateErrorProps } from './create.types'

export default function CreateError({}: CreateErrorProps) {
    return (
        <Card className="border-border-secondary bg-bg-elevated space-y-5 rounded-4xl p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <div>
                <p className="text-loss text-[11px] font-semibold tracking-[0.22em] uppercase">
                    Summoner error
                </p>
                <h1 className="text-text mt-2 text-2xl font-black">
                    Couldn&apos;t find that account
                </h1>
                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                    Check the Riot ID and region, then try again from the home
                    page.
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Link href="/">
                    <Button variant="secondary">
                        <ArrowLeft className="h-4 w-4" />
                        Back home
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
