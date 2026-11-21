import type { Metadata } from 'next'

export const metadata: Metadata = {
    alternates: { canonical: '/privacy' },
    title: 'Privacy',
}

export default function PrivacyPage() {
    return (
        <section className="mx-auto max-w-3xl px-6 py-16">
            <div className="space-y-8">
                <header className="space-y-3">
                    <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                        Legal
                    </p>
                    <h1 className="text-text text-4xl font-black tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-text-muted text-sm leading-relaxed">
                        StatBox is a small Riot-powered web app. This page
                        explains what data the product processes, what the
                        server caches, and what is stored locally in your
                        browser.
                    </p>
                </header>

                <div className="text-text-muted space-y-6 text-sm leading-7">
                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            What we process
                        </h2>
                        <p>
                            StatBox sends Riot ID and region data to server-side
                            API routes in order to resolve an account and fetch
                            ranked information such as tier, rank, LP, and match
                            history. Riot API requests are made on the server
                            only.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            What is stored in the browser
                        </h2>
                        <p>
                            StatBox stores a connected account identifier (the
                            Riot <code>PUUID</code>) and builder preferences
                            such as selected queue, widget style, and session
                            settings in local storage so the builder can restore
                            your last setup. Disconnecting the account in the
                            builder removes them.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            What is stored on the server
                        </h2>
                        <p>
                            To stay inside Riot&apos;s rate limits, the server
                            keeps Riot API answers in a cache on the
                            operator&apos;s server, keyed by Riot ID and PUUID:
                            the Riot ID to PUUID lookup for a day, summoner data
                            for six hours, ranked data for a day, and match
                            details for up to 90 days per PUUID. Cached entries
                            are not shared with anyone and are removed once they
                            expire. Each deploy first copies the cache to a
                            dated snapshot on the same server so a bad release
                            can be rolled back; the newest three snapshots are
                            kept and older ones are deleted.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            Widget links
                        </h2>
                        <p>
                            A widget link carries the account&apos;s PUUID,
                            region, and widget settings. Anyone who has the link
                            sees the same public ranked stats, so share it only
                            where you would show the widget itself.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            What we do not collect
                        </h2>
                        <p>
                            StatBox does not require account registration and
                            does not intentionally collect passwords, payment
                            details, or private chat content. The app only uses
                            public gameplay data available through Riot APIs for
                            the connected account flow.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            Third-party services
                        </h2>
                        <p>
                            Match, summoner, and ranked data come from Riot API
                            services. Cloudflare proxies every request to the
                            site, briefly caches public API answers at its edge,
                            and provides web analytics. The server keeps short
                            container logs of request errors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            Contact
                        </h2>
                        <p>
                            For questions about this project, use the public
                            repository or contact the maintainer through{' '}
                            <a
                                className="text-text hover:text-accent"
                                href="https://ilkerbalcilar.com"
                                rel="noopener noreferrer"
                                target="_blank">
                                ilkerbalcilar.com
                            </a>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </section>
    )
}
