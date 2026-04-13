import Link from 'next/link'

import Button from '@/components/button/button'

export default function NotFound() {
    return (
        <main className="text-text min-h-screen bg-[radial-gradient(circle_at_top,rgba(10,200,185,0.1),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(244,201,93,0.1),transparent_22%),linear-gradient(180deg,#07111f_0%,#060e1a_45%,#07111f_100%)]">
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
                        <Link href="/">
                            <Button>Back home</Button>
                        </Link>
                        <Link href="/create">
                            <Button variant="secondary">Open builder</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
