import ProfileIcon from '@/components/profile-icon/profile-icon'

import StripStat from './strip-stat'
import { GAME_COLORS } from './widget.constants'
import type { ComputedData } from './widget.types'
import { formatTierRank, getMatchResultColors } from './widget.utils'

export default function MinimalWidget({
    data,
    recent,
    sessionLosses,
    sessionWins,
    tierColor,
    winRate,
}: ComputedData) {
    return (
        <div className="border-border-hover grid h-[72px] w-[480px] grid-cols-[4px_44px_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(90deg,rgba(7,17,31,0.44)_0%,rgba(16,32,51,0.28)_100%)] pr-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-md">
            <div
                className="self-stretch"
                style={{
                    background: `linear-gradient(180deg, ${tierColor} 0%, #7dd3fc 100%)`,
                }}
            />

            <div className="relative shrink-0">
                <ProfileIcon
                    borderColor={`${tierColor}70`}
                    className="h-9 w-9 rounded-[10px]"
                    iconId={data.profileIconId}
                    ringClassName="border-[1.5px]"
                />
                <div
                    className="absolute -bottom-1.5 left-1/2 min-w-5.5 -translate-x-1/2 rounded-full px-1 py-px text-center text-[8px] font-extrabold"
                    style={{ background: tierColor, color: '#07111f' }}>
                    {data.summonerLevel}
                </div>
            </div>

            <div className="min-w-0">
                <div className="text-text truncate text-xs font-extrabold">
                    {data.gameName}
                </div>
                <div
                    className="mt-0.5 truncate text-[10px] font-bold"
                    style={{ color: tierColor }}>
                    {formatTierRank(data.tier, data.rank)}
                    {data.tier !== 'UNRANKED' && (
                        <span className="text-text-subtle ml-1">
                            {data.leaguePoints} LP
                        </span>
                    )}
                </div>
            </div>

            <div className="border-border flex items-center gap-2.5 border-l border-white/10 pl-2.5">
                <div className="border-border flex shrink-0 items-center gap-1.5 border-r border-white/10 pr-2.5">
                    <StripStat
                        color={GAME_COLORS.win}
                        label="W"
                        value={String(sessionWins)}
                    />
                    <StripStat
                        color={GAME_COLORS.loss}
                        label="L"
                        value={String(sessionLosses)}
                    />
                    <StripStat
                        color={GAME_COLORS.accent}
                        label="WR"
                        value={winRate !== null ? `${winRate}%` : '--'}
                    />
                </div>

                <div className="flex min-w-0 items-center justify-end gap-0.75">
                    {recent.length === 0 && (
                        <span className="text-text-subtle text-[10px] font-bold">
                            No games
                        </span>
                    )}
                    {recent.map(match => {
                        const resultColors = getMatchResultColors(match)
                        return (
                            <div
                                key={match.matchId}
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[9px] font-black"
                                style={{
                                    background: resultColors.bg,
                                    borderColor: resultColors.border,
                                    color: resultColors.color,
                                }}>
                                {match.isRemake ? 'R' : match.win ? 'W' : 'L'}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
