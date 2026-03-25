import ChampionIcon from '@/components/champion-icon/champion-icon'
import ProfileIcon from '@/components/profile-icon/profile-icon'

import FooterMark from './footer-mark'
import MetricTile from './metric-tile'
import ScoreBox from './score-box'
import SectionLabel from './section-label'
import type { ComputedData } from './widget.types'

export default function CompactWidget({
    avgAssists,
    avgDeaths,
    avgKills,
    data,
    kdaRatio,
    recent,
    sessionGames,
    sessionLosses,
    sessionWins,
    tierColor,
    winRate,
}: ComputedData) {
    return (
        <div className="border-border-hover w-[260px] overflow-hidden rounded-[22px] border bg-[linear-gradient(165deg,#102033_0%,#07111f_100%)] shadow-[0_18px_48px_rgba(0,0,0,0.44)]">
            <div
                className="border-border border-b px-[14px] py-[14px]"
                style={{
                    background: `radial-gradient(circle at top, ${tierColor}26, transparent 58%), linear-gradient(180deg, rgba(16,32,51,0.96) 0%, rgba(11,23,39,0.96) 100%)`,
                }}>
                <div className="mb-[10px] flex items-center gap-2">
                    <ProfileIcon
                        borderColor={`${tierColor}70`}
                        className="h-7 w-7 rounded-[9px]"
                        iconId={data.profileIconId}
                        ringClassName="border"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="text-text truncate text-xs font-extrabold">
                            {data.gameName}
                        </div>
                        <div className="text-text-muted truncate text-[10px]">
                            #{data.tagLine}
                        </div>
                    </div>
                    {data.hotStreak && <span className="text-xs">🔥</span>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <ScoreBox
                        color="#5ef2a2"
                        label="Wins"
                        value={String(sessionWins)}
                    />
                    <ScoreBox
                        color="#ff7a8a"
                        label="Losses"
                        value={String(sessionLosses)}
                    />
                </div>

                <div className="mt-[10px] flex items-center justify-between">
                    <span
                        className="text-[10px] font-extrabold tracking-[0.14em] uppercase"
                        style={{ color: tierColor }}>
                        {data.tier === 'UNRANKED'
                            ? 'Unranked'
                            : `${data.tier} ${data.rank}`}
                    </span>
                    <span className="text-text text-xs font-extrabold">
                        {winRate !== null ? `${winRate}% WR` : '--'}
                    </span>
                </div>
            </div>

            <div className="border-border border-b px-[14px] py-3">
                <SectionLabel>Combat line</SectionLabel>
                {sessionGames > 0 ? (
                    <>
                        <div className="mb-2 grid grid-cols-3 gap-1.5">
                            <MetricTile
                                label="Kills"
                                tone="win"
                                value={avgKills.toFixed(1)}
                            />
                            <MetricTile
                                label="Deaths"
                                tone="loss"
                                value={avgDeaths.toFixed(1)}
                            />
                            <MetricTile
                                label="Assists"
                                tone="blue"
                                value={avgAssists.toFixed(1)}
                            />
                        </div>
                        <div className="text-text-muted text-center text-[11px] font-bold">
                            {kdaRatio ? `${kdaRatio} KDA` : 'Perfect game'}
                        </div>
                    </>
                ) : (
                    <div className="text-text-subtle text-center text-[11px]">
                        No session games yet
                    </div>
                )}
            </div>

            <div className="px-[14px] py-3">
                <SectionLabel>Recent</SectionLabel>
                <div className="flex flex-wrap justify-center gap-1.5">
                    {recent.length === 0 && (
                        <span className="text-text-subtle text-[11px]">
                            No games
                        </span>
                    )}
                    {recent.map(match => (
                        <div
                            key={match.matchId}
                            className="h-[38px] w-[38px] overflow-hidden rounded-xl border-2 bg-[#162b42]"
                            style={{
                                borderColor: match.win ? '#5ef2a2' : '#ff7a8a',
                            }}>
                            <ChampionIcon
                                champion={match.champion}
                                className="h-[38px] w-[38px]"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <FooterMark />
        </div>
    )
}
