import { AlertTriangle, Tv } from 'lucide-react'

import Badge from '@/components/badge/badge'
import FeatureCard from '@/components/card/feature-card'
import MetricCard from '@/components/card/metric-card'
import StepCard from '@/components/card/step-card'
import SurfaceCard from '@/components/card/surface-card'
import WidgetShowcaseCard from '@/components/card/widget-showcase-card'
import SectionHeading from '@/components/section-heading/section-heading'
import Widget from '@/components/widget/widget'
import WidgetGeneratorForm from '@/components/widget-generator/widget-generator.form'

import {
    EXAMPLE_SUMMONER,
    FEATURE_ITEMS,
    STEPS,
    WIDGET_LAYOUTS,
} from './landing.constants'

export default function LandingPage() {
    return (
        <>
            <section className="relative overflow-hidden">
                <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div className="max-w-2xl">
                        <Badge className="mb-8" tone="accent">
                            <Tv className="h-3 w-3" />
                            League stream widget
                        </Badge>
                        <h1 className="text-text mb-5 text-5xl leading-[0.98] font-black tracking-tight sm:text-[4.1rem]">
                            Show rank, recent games
                            <span className="text-accent block">
                                and session W/L live
                            </span>
                        </h1>
                        <p className="text-text-strong mb-4 max-w-xl text-lg leading-relaxed sm:text-xl">
                            StatBox gives League streamers a clean widget for
                            tier, LP, KDA and recent ranked results with a
                            single browser source URL.
                        </p>
                        <p className="text-text-muted mb-10 max-w-lg text-sm leading-relaxed">
                            Pick a layout, generate the link and drop it into
                            OBS. No plugin, no client install, no extra setup.
                        </p>
                        <div className="border-loss/35 bg-loss/12 mb-10 max-w-xl rounded-2xl border px-4 py-3 shadow-[0_12px_32px_rgba(255,122,138,0.08)]">
                            <div className="text-loss flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Beta status
                            </div>
                            <p className="text-text mt-2 text-sm leading-relaxed">
                                Riot production-key approval is still pending.
                                Until the app is fully approved, requests may
                                occasionally be slower or fail temporarily.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <MetricCard
                                label="Widget styles"
                                note="Classic, strip, compact and topbar"
                                value="4"
                            />
                            <MetricCard
                                label="Setup time"
                                note="Paste directly into OBS"
                                value="60s"
                            />
                            <MetricCard
                                label="Refresh"
                                note="Automatic Riot data updates"
                                value="30s"
                            />
                        </div>
                    </div>

                    <SurfaceCard className="p-5">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                                    Generator
                                </p>
                                <p className="text-text-muted mt-1 text-sm">
                                    Fetch your account, then continue to the
                                    builder.
                                </p>
                            </div>
                            <Badge tone="accent">OBS Ready</Badge>
                        </div>
                        <WidgetGeneratorForm />
                    </SurfaceCard>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-20">
                <SectionHeading
                    eyebrow="Features"
                    title="Made for League of Legends streams">
                    Everything is focused on ranked broadcast use: faster
                    reading, cleaner sizing and layouts that fit different parts
                    of the scene.
                </SectionHeading>
                <div className="grid gap-4 sm:grid-cols-3">
                    {FEATURE_ITEMS.map(item => (
                        <FeatureCard key={item.title} item={item} />
                    ))}
                </div>
            </section>

            <section className="border-border/60 bg-bg-base/70 border-y py-20">
                <div className="mx-auto max-w-6xl px-6">
                    <SectionHeading
                        eyebrow="Example widgets"
                        title="Four layouts. Same data.">
                        Pick the format that fits your scene: side card, compact
                        panel, slim strip or broadcast topbar.
                    </SectionHeading>
                    <div className="grid items-start gap-5 md:grid-cols-2">
                        {WIDGET_LAYOUTS.map(layout => (
                            <WidgetShowcaseCard
                                key={layout.label}
                                description={layout.description}
                                name={layout.label}>
                                <Widget
                                    data={EXAMPLE_SUMMONER}
                                    isError={false}
                                    isLoading={false}
                                    session={null}
                                    style={layout.style}
                                />
                            </WidgetShowcaseCard>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 py-20">
                <SectionHeading eyebrow="Setup" title="Up in 60 seconds" />
                <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
                    {STEPS.map(step => (
                        <StepCard key={step.step} {...step} />
                    ))}
                </div>
            </section>
        </>
    )
}
