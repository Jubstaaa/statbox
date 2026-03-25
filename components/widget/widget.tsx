'use client'

import ClassicWidget from './classic-widget'
import CompactWidget from './compact-widget'
import MinimalWidget from './minimal-widget'
import { TIER_COLORS } from './widget.constants'
import WidgetError from './widget.error'
import WidgetLoader from './widget.loader'
import type { ComputedData, WidgetProps } from './widget.types'

export default function Widget({
    data,
    isError = false,
    isLoading = false,
    session,
    style,
}: WidgetProps) {
    if (isLoading || !data) return <WidgetLoader style={style} />
    if (isError) return <WidgetError style={style} />

    const filteredMatchHistory = session
        ? data.matchHistory.filter(
              match => new Date(match.timestamp).getTime() >= session
          )
        : data.matchHistory

    const sessionWins = filteredMatchHistory.filter(match => match.win).length
    const sessionLosses = filteredMatchHistory.filter(
        match => !match.win
    ).length
    const sessionGames = sessionWins + sessionLosses
    const winRate =
        sessionGames > 0 ? Math.round((sessionWins / sessionGames) * 100) : null

    const totalKills = filteredMatchHistory.reduce(
        (sum, match) => sum + match.kills,
        0
    )
    const totalDeaths = filteredMatchHistory.reduce(
        (sum, match) => sum + match.deaths,
        0
    )
    const totalAssists = filteredMatchHistory.reduce(
        (sum, match) => sum + match.assists,
        0
    )
    const avgKills = sessionGames > 0 ? totalKills / sessionGames : 0
    const avgDeaths = sessionGames > 0 ? totalDeaths / sessionGames : 0
    const avgAssists = sessionGames > 0 ? totalAssists / sessionGames : 0
    const kdaRatio =
        totalDeaths === 0
            ? null
            : ((totalKills + totalAssists) / totalDeaths).toFixed(2)

    const computed: ComputedData = {
        avgAssists,
        avgDeaths,
        avgKills,
        data,
        kdaRatio,
        recent: filteredMatchHistory.slice(0, 5),
        session,
        sessionGames,
        sessionLosses,
        sessionWins,
        tierColor: TIER_COLORS[data.tier] ?? TIER_COLORS.UNRANKED,
        winRate,
    }

    if (style === 'minimal') return <MinimalWidget {...computed} />
    if (style === 'compact') return <CompactWidget {...computed} />
    return <ClassicWidget {...computed} />
}
