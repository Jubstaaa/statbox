import { BarChart3, RefreshCw, Tv, Zap } from 'lucide-react'

import Badge from '@/components/badge/badge'
import Card from '@/components/card/card'
import Widget from '@/components/widget/widget'
import WidgetGeneratorForm from '@/components/widget-generator/widget-generator.form'
import type { RiotData } from '@/lib/riot/riot.types'

const EXAMPLE_SUMMONER: RiotData = {
    gameName: 'doydos enjoyer',
    hotStreak: false,
    leaguePoints: 78,
    losses: 24,
    matchHistory: [
        {
            assists: 8,
            champion: 'RekSai',
            championId: 421,
            deaths: 8,
            kills: 16,
            matchId: 'TR1_1',
            timestamp: '2026-03-24T18:49:47.019Z',
            win: false,
        },
        {
            assists: 6,
            champion: 'RekSai',
            championId: 421,
            deaths: 3,
            kills: 8,
            matchId: 'TR1_2',
            timestamp: '2026-03-24T18:07:10.953Z',
            win: true,
        },
        {
            assists: 4,
            champion: 'RekSai',
            championId: 421,
            deaths: 1,
            kills: 8,
            matchId: 'TR1_3',
            timestamp: '2026-03-24T17:34:52.867Z',
            win: true,
        },
        {
            assists: 9,
            champion: 'RekSai',
            championId: 421,
            deaths: 7,
            kills: 12,
            matchId: 'TR1_4',
            timestamp: '2026-03-24T17:09:22.768Z',
            win: false,
        },
        {
            assists: 2,
            champion: 'Camille',
            championId: 164,
            deaths: 6,
            kills: 7,
            matchId: 'TR1_5',
            timestamp: '2026-03-24T16:16:02.325Z',
            win: true,
        },
    ],
    profileIconId: 5927,
    puuid: 'example-puuid',
    rank: 'I',
    summonerLevel: 565,
    tagLine: 'TR1',
    tier: 'MASTER',
    wins: 27,
}

const FEATURE_ITEMS = [
    {
        description:
            'Use a session link to count wins and losses from the moment the stream starts.',
        icon: <Zap className="text-bg-base h-5 w-5" />,
        title: 'Session W/L',
        tone: 'bg-accent',
    },
    {
        description:
            'Show current tier, LP and recent KDA without opening another site on stream.',
        icon: <BarChart3 className="text-bg-base h-5 w-5" />,
        title: 'Live rank and KDA',
        tone: 'bg-accent-2',
    },
    {
        description:
            'Add the browser source once and let the widget refresh automatically every 30 seconds.',
        icon: <RefreshCw className="text-bg-base h-5 w-5" />,
        title: 'Set and forget',
        tone: 'bg-win',
    },
]

const STEPS = [
    {
        description: 'Type your game name, tag and region.',
        n: 1,
        title: 'Enter your summoner',
    },
    {
        description: 'See your own account inside each widget style.',
        n: 2,
        title: 'Preview your layouts',
    },
    {
        description:
            'Paste the generated URL into a Browser Source and go live.',
        n: 3,
        title: 'Add to OBS',
    },
]

const WIDGET_LAYOUTS = [
    {
        description: 'Full vertical card for side placement.',
        name: 'Classic',
        style: 'classic' as const,
    },
    {
        description: 'Slim horizontal strip for top or bottom overlays.',
        featured: true,
        name: 'Minimal',
        style: 'minimal' as const,
    },
    {
        description: 'Compact panel for corner placement.',
        name: 'Compact',
        style: 'compact' as const,
    },
]

export default function HomePage() {
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
                        <div className="grid gap-3 sm:grid-cols-3">
                            <MetricCard
                                label="Widget styles"
                                note="Classic, strip and compact"
                                value="3"
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
                        <InfoCard
                            key={item.title}
                            description={item.description}
                            icon={item.icon}
                            title={item.title}
                            tone={item.tone}
                        />
                    ))}
                </div>
            </section>

            <section className="border-border/60 bg-bg-base/70 border-y py-20">
                <div className="mx-auto max-w-6xl px-6">
                    <SectionHeading
                        eyebrow="Example widgets"
                        title="Three layouts. Same data.">
                        Pick the format that fits your scene: full card, compact
                        panel or slim horizontal strip.
                    </SectionHeading>
                    <div className="grid items-start justify-center gap-5 lg:grid-cols-[300px_1fr_260px]">
                        {WIDGET_LAYOUTS.map(layout => (
                            <WidgetShowcaseCard
                                key={layout.name}
                                description={layout.description}
                                featured={layout.featured}
                                name={layout.name}>
                                <Widget
                                    initialData={EXAMPLE_SUMMONER}
                                    puuid={EXAMPLE_SUMMONER.puuid}
                                    region="TR"
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
                        <StepCard key={step.n} {...step} />
                    ))}
                </div>
            </section>
        </>
    )
}

function SurfaceCard({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <Card
            className={`border-border-hover bg-[linear-gradient(180deg,rgba(16,32,51,0.94)_0%,rgba(10,20,35,0.92)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.35)] ${className}`}>
            {children}
        </Card>
    )
}

function SectionHeading({
    children,
    eyebrow,
    title,
}: {
    children?: React.ReactNode
    eyebrow: string
    title: string
}) {
    return (
        <div className="mb-12 text-center">
            <p className="text-accent-2 mb-3 text-[11px] font-semibold tracking-[0.22em] uppercase">
                {eyebrow}
            </p>
            <h2 className="text-text mb-3 text-3xl font-black sm:text-4xl">
                {title}
            </h2>
            {children ? (
                <p className="text-text-muted mx-auto max-w-2xl leading-relaxed">
                    {children}
                </p>
            ) : null}
        </div>
    )
}

function MetricCard({
    label,
    note,
    value,
}: {
    label: string
    note: string
    value: string
}) {
    return (
        <SurfaceCard className="p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <div className="text-text-subtle text-[11px] font-semibold tracking-[0.2em] uppercase">
                {label}
            </div>
            <div className="text-text mt-2 text-3xl font-black">{value}</div>
            <div className="text-text-muted mt-1 text-xs leading-relaxed">
                {note}
            </div>
        </SurfaceCard>
    )
}

function InfoCard({
    description,
    icon,
    title,
    tone,
}: {
    description: string
    icon: React.ReactNode
    title: string
    tone: string
}) {
    return (
        <SurfaceCard className="p-6 shadow-[0_20px_55px_rgba(0,0,0,0.2)]">
            <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
                {icon}
            </div>
            <h3 className="text-text mb-2 text-base font-bold">{title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">
                {description}
            </p>
        </SurfaceCard>
    )
}

function WidgetShowcaseCard({
    children,
    description,
    featured,
    name,
}: {
    children: React.ReactNode
    description: string
    featured?: boolean
    name: string
}) {
    return (
        <SurfaceCard
            className={
                featured
                    ? 'border-accent/70 shadow-[0_24px_70px_rgba(244,201,93,0.12)]'
                    : ''
            }>
            {featured ? (
                <div className="border-accent/20 bg-accent/10 text-accent border-b px-4 py-2 text-center text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Most used
                </div>
            ) : null}
            <div className="border-border/80 flex min-h-45 items-center justify-center border-b bg-[radial-gradient(circle_at_top,rgba(10,200,185,0.08),transparent_48%)] p-6">
                {children}
            </div>
            <div className="p-5">
                <div className="mb-2">
                    <h3 className="text-text text-base font-bold">{name}</h3>
                </div>
                <p className="text-text-muted text-sm leading-relaxed">
                    {description}
                </p>
            </div>
        </SurfaceCard>
    )
}

function StepCard({
    description,
    n,
    title,
}: {
    description: string
    n: number
    title: string
}) {
    return (
        <SurfaceCard className="p-6 text-center shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <div className="bg-accent text-bg-base mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black shadow-[0_12px_32px_rgba(244,201,93,0.2)]">
                {n}
            </div>
            <h3 className="text-text mb-2 text-base font-bold">{title}</h3>
            <p className="text-text-muted text-sm leading-relaxed">
                {description}
            </p>
        </SurfaceCard>
    )
}
