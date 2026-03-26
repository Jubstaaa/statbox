import { BarChart3, RefreshCw, Zap } from 'lucide-react'

import type { FeatureCardItemProps } from '@/components/card/feature-card/feature-card.types'
import type { StepCardProps } from '@/components/card/step-card/step-card.types'
import { WIDGET_STYLE_OPTIONS } from '@/components/widget/widget.constants'
import type { RiotData } from '@/lib/riot/riot.types'

import type { LandingWidgetLayout } from './landing.types'

export const EXAMPLE_SUMMONER: RiotData = {
    gameName: 'doydos enjoyer',
    hotStreak: true,
    leaguePoints: 912,
    losses: 11,
    matchHistory: [
        {
            assists: 11,
            champion: 'RekSai',
            championId: 421,
            deaths: 2,
            kills: 14,
            matchId: 'TR1_1',
            timestamp: '2026-03-24T18:49:47.019Z',
            win: true,
        },
        {
            assists: 9,
            champion: 'Viego',
            championId: 234,
            deaths: 4,
            kills: 12,
            matchId: 'TR1_2',
            timestamp: '2026-03-24T18:07:10.953Z',
            win: true,
        },
        {
            assists: 10,
            champion: 'Sylas',
            championId: 517,
            deaths: 5,
            kills: 9,
            matchId: 'TR1_3',
            timestamp: '2026-03-24T17:34:52.867Z',
            win: true,
        },
        {
            assists: 3,
            champion: 'Zed',
            championId: 238,
            deaths: 6,
            kills: 11,
            matchId: 'TR1_4',
            timestamp: '2026-03-24T17:09:22.768Z',
            win: false,
        },
        {
            assists: 7,
            champion: 'Talon',
            championId: 91,
            deaths: 2,
            kills: 13,
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
    tier: 'CHALLENGER',
    wins: 41,
}

export const FEATURE_ITEMS: FeatureCardItemProps[] = [
    {
        className: 'bg-accent',
        description:
            'Use a session link to count wins and losses from the moment the stream starts.',
        icon: Zap,
        title: 'Session W/L',
    },
    {
        className: 'bg-accent-2',
        description:
            'Show current tier, LP and recent KDA without opening another site on stream.',
        icon: BarChart3,
        title: 'Live rank and KDA',
    },
    {
        className: 'bg-win',
        description:
            'Add the browser source once and let the widget refresh automatically every 30 seconds.',
        icon: RefreshCw,
        title: 'Set and forget',
    },
]

export const STEPS: StepCardProps[] = [
    {
        description: 'Type your game name, tag and region.',
        step: 1,
        title: 'Enter your summoner',
    },
    {
        description: 'See your own account inside each widget style.',
        step: 2,
        title: 'Preview your layouts',
    },
    {
        description:
            'Paste the generated URL into a Browser Source and go live.',
        step: 3,
        title: 'Add to OBS',
    },
]

export const WIDGET_LAYOUTS: LandingWidgetLayout[] = [
    WIDGET_STYLE_OPTIONS.find(option => option.style === 'topbar')!,
    WIDGET_STYLE_OPTIONS.find(option => option.style === 'minimal')!,
    WIDGET_STYLE_OPTIONS.find(option => option.style === 'classic')!,
    WIDGET_STYLE_OPTIONS.find(option => option.style === 'compact')!,
]
