import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms',
}

export default function TermsPage() {
    return (
        <section className="mx-auto max-w-3xl px-6 py-16">
            <div className="space-y-8">
                <header className="space-y-3">
                    <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                        Legal
                    </p>
                    <h1 className="text-text text-4xl font-black tracking-tight">
                        Terms of Use
                    </h1>
                    <p className="text-text-muted text-sm leading-relaxed">
                        These terms are intentionally simple. StatBox is an open
                        source tool for stream overlays and ranked widget
                        generation.
                    </p>
                </header>

                <div className="text-text-muted space-y-6 text-sm leading-7">
                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            Usage
                        </h2>
                        <p>
                            You may use StatBox to generate OBS-ready widget
                            URLs for League of Legends stream overlays. Do not
                            abuse the service, attempt to bypass rate limits, or
                            use the app in a way that breaks Riot API policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            Availability
                        </h2>
                        <p>
                            StatBox is provided as-is. The app may change,
                            pause, or stop working at any time, especially if
                            Riot API access changes or a production key is not
                            available.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            Riot disclaimer
                        </h2>
                        <p>
                            StatBox is not endorsed by Riot Games and does not
                            reflect the views or opinions of Riot Games or
                            anyone officially involved in producing or managing
                            Riot Games properties. League of Legends and Riot
                            Games are trademarks or registered trademarks of
                            Riot Games, Inc.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-text mb-2 text-base font-bold">
                            Open source
                        </h2>
                        <p>
                            The source code is publicly available. Repository
                            usage, contributions, and redistribution are subject
                            to the project license.
                        </p>
                    </section>
                </div>
            </div>
        </section>
    )
}
