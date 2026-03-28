import type { WidgetStyle } from '@/lib/riot/riot.types'

import { TIER_COLORS, WIDGET_STYLE_DEFINITIONS } from './widget.constants'
import type { ComputedData, WidgetData } from './widget.types'

export function getWidgetWidth(style: WidgetStyle) {
    return WIDGET_STYLE_DEFINITIONS[style].width
}

export function getWidgetHeight(style: WidgetStyle) {
    return WIDGET_STYLE_DEFINITIONS[style].height
}

export function formatTierRank(tier: string, rank: string) {
    return tier === 'UNRANKED' ? 'Unranked' : `${tier} ${rank}`
}

export function computeWidgetData({
    data,
    session,
}: {
    data: WidgetData
    session: number | null
}): ComputedData {
    const filteredMatchHistory = session
        ? data.matchHistory.filter(
              match => new Date(match.timestamp).getTime() >= session
          )
        : data.matchHistory
    const statMatches = filteredMatchHistory.filter(match => !match.isRemake)

    const sessionWins = statMatches.filter(match => match.win).length
    const sessionLosses = statMatches.filter(match => !match.win).length
    const sessionGames = sessionWins + sessionLosses
    const winRate =
        sessionGames > 0 ? Math.round((sessionWins / sessionGames) * 100) : null

    const totalKills = statMatches.reduce((sum, match) => sum + match.kills, 0)
    const totalDeaths = statMatches.reduce(
        (sum, match) => sum + match.deaths,
        0
    )
    const totalAssists = statMatches.reduce(
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

    return {
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
}
