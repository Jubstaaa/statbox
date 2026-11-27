import Link from 'next/link'

import { buttonClassName } from '@/components/button'

export default function NotFound() {
    return (
        <main className="text-text bg-page min-h-screen">
            <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
                <div className="space-y-6">
                    <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                        404
                    </p>
                    <div className="space-y-3">
                        <h1 className="text-text text-5xl font-black tracking-tight">
                            That page doesn&apos;t exist.
                        </h1>
                        <p className="text-text-muted max-w-xl text-sm leading-relaxed">
                            The route may have changed, the widget URL may be
                            invalid, or the page may no longer exist.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link className={buttonClassName()} href="/">
                            Back home
                        </Link>
                        <Link
                            className={buttonClassName({
                                variant: 'secondary',
                            })}
                            href="/create">
                            Open builder
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
