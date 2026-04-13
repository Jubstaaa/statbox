import type { Metadata } from 'next'

export const metadata: Metadata = {
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
                        explains what data the product processes and what is
                        stored locally in your browser.
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
                            StatBox stores a connected account identifier
                            (`puuid`) and builder preferences such as selected
                            queue, widget style, and session settings in local
                            storage so the builder can restore your last setup.
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
                            services. Deployment and request logs may also be
                            handled by the hosting platform used to run the app.
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
