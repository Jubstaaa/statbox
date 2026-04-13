import ChampionIcon from '@/components/champion-icon/champion-icon'
import { cn } from '@/lib/cn'

import FooterMark from './footer-mark'
import KdaLine from './kda-line'
import MetricTile from './metric-tile'
import PlayerSummary from './player-summary'
import SectionLabel from './section-label'
import type { ComputedData } from './widget.types'
import { getMatchResultColors } from './widget.utils'

export default function ClassicWidget({
    avgAssists,
    avgDeaths,
    avgKills,
    data,
    kdaRatio,
    recent,
    session,
    sessionGames,
    sessionLosses,
    sessionWins,
    tierColor,
    winRate,
}: ComputedData) {
    return (
        <div
            className="border-hover w-75 overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,30,0.68)_0%,rgba(7,17,31,0.42)_100%)] shadow-[0_18px_48px_rgba(0,0,0,0.32)] backdrop-blur-md"
            style={{
                boxShadow: `0 18px 48px rgba(0,0,0,0.32), 0 0 0 1px ${tierColor}22`,
            }}>
            <div
                className="border border-b border-white/10 px-3.5 py-3.5"
                style={{
                    background: `radial-gradient(circle at top left, ${tierColor}28, transparent 42%), linear-gradient(180deg, rgba(16,32,51,0.66) 0%, rgba(11,23,39,0.4) 100%)`,
                }}>
                <PlayerSummary data={data} tierColor={tierColor} />
            </div>

            <div className="border border-b border-white/10 bg-[rgba(6,13,24,0.34)] px-3.5 py-3">
                <SectionLabel>
                    {session ? 'Session snapshot' : 'Recent snapshot'}
                </SectionLabel>
                <div
                    className={cn(
                        'grid grid-cols-3 gap-2',
                        sessionGames > 0 ? 'mb-2.5' : 'mb-0'
                    )}>
                    <MetricTile
                        label="Wins"
                        tone="win"
                        value={String(sessionWins)}
                    />
                    <MetricTile
                        label="Losses"
                        tone="loss"
                        value={String(sessionLosses)}
                    />
                    <MetricTile
                        label="WR"
                        tone="blue"
                        value={winRate !== null ? `${winRate}%` : '--'}
                    />
                </div>
                {sessionGames > 0 && (
                    <div className="flex items-center justify-between gap-2.5">
                        <span className="text-text-subtle text-[10px] font-bold tracking-[0.14em] uppercase">
                            Avg K / D / A
                        </span>
                        <KdaLine
                            assists={avgAssists.toFixed(1)}
                            deaths={avgDeaths.toFixed(1)}
                            kdaRatio={kdaRatio}
                            kills={avgKills.toFixed(1)}
                        />
                    </div>
                )}
            </div>

            <div className="bg-[rgba(6,13,24,0.24)] px-3.5 py-3">
                <SectionLabel>Recent matches</SectionLabel>
                <div className="flex flex-col gap-1.5">
                    {recent.length === 0 && (
                        <div className="text-text-subtle py-2.5 text-center text-[11px]">
                            No ranked games found
                        </div>
                    )}
                    {recent.map(match => {
                        const resultColors = getMatchResultColors(match)
                        return (
                            <div
                                key={match.matchId}
                                className="rounded-2.5 grid grid-cols-[24px_1fr_auto_auto] items-center gap-2 border px-2 py-1.75"
                                style={{
                                    background: resultColors.bg,
                                    borderColor: resultColors.border,
                                }}>
                                <ChampionIcon
                                    champion={match.champion}
                                    className="h-6 w-6 rounded-md"
                                />
                                <span className="text-text min-w-0 truncate text-[11px] font-bold">
                                    {match.champion}
                                </span>
                                <KdaLine
                                    assists={match.assists}
                                    deaths={match.deaths}
                                    kills={match.kills}
                                />
                                <span
                                    className={cn(
                                        'text-[10px] font-extrabold tracking-[0.12em]',
                                        match.isRemake
                                            ? 'text-text-subtle'
                                            : match.win
                                              ? 'text-win'
                                              : 'text-loss'
                                    )}>
                                    {match.isRemake
                                        ? 'REMAKE'
                                        : match.win
                                          ? 'WIN'
                                          : 'LOSS'}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <FooterMark />
        </div>
    )
}
