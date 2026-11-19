'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { buttonClassName } from '@/components/button'
import Card from '@/components/card'

export default function CreateError() {
    return (
        <Card className="border-border-secondary bg-bg-elevated space-y-5 rounded-4xl p-6 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <div>
                <p className="text-loss text-[11px] font-semibold tracking-[0.22em] uppercase">
                    Summoner error
                </p>
                <h2 className="text-text mt-2 text-2xl font-black">
                    Couldn&apos;t find that account
                </h2>
                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                    Check the Riot ID and region, then try again from the home
                    page.
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Link
                    className={buttonClassName({ variant: 'secondary' })}
                    href="/">
                    <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Back home
                </Link>
            </div>
        </Card>
    )
}
