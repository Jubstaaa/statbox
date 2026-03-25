import ProfileIcon from '@/components/profile-icon/profile-icon'

import StripStat from './strip-stat'
import type { ComputedData } from './widget.types'

export default function MinimalWidget({
    data,
    recent,
    sessionLosses,
    sessionWins,
    tierColor,
    winRate,
}: ComputedData) {
    return (
        <div className="border-border-hover grid h-[72px] w-[480px] grid-cols-[4px_48px_minmax(0,120px)_auto_minmax(108px,1fr)] items-center gap-3 overflow-hidden rounded-[18px] border bg-[linear-gradient(90deg,#07111f_0%,#102033_100%)] pr-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.38)]">
            <div
                className="self-stretch"
                style={{
                    background: `linear-gradient(180deg, ${tierColor} 0%, #7dd3fc 100%)`,
                }}
            />

            <div className="relative shrink-0">
                <ProfileIcon
                    borderColor={`${tierColor}70`}
                    className="h-10 w-10 rounded-[11px]"
                    iconId={data.profileIconId}
                    ringClassName="border-[1.5px]"
                />
                <div
                    className="absolute -bottom-1.5 left-1/2 min-w-[22px] -translate-x-1/2 rounded-full px-[5px] py-px text-center text-[8px] font-extrabold"
                    style={{ background: tierColor, color: '#07111f' }}>
                    {data.summonerLevel}
                </div>
            </div>

            <div className="min-w-0">
                <div className="text-text truncate text-xs font-extrabold">
                    {data.gameName}
                </div>
                <div
                    className="mt-[3px] truncate text-[10px] font-bold"
                    style={{ color: tierColor }}>
                    {data.tier === 'UNRANKED'
                        ? 'Unranked'
                        : `${data.tier} ${data.rank}`}
                    {data.tier !== 'UNRANKED' && (
                        <span className="text-text-subtle ml-1">
                            {data.leaguePoints} LP
                        </span>
                    )}
                </div>
            </div>

            <div className="border-border flex items-center gap-[10px] border-x px-[14px]">
                <StripStat
                    color="#5ef2a2"
                    label="W"
                    value={String(sessionWins)}
                />
                <StripStat
                    color="#ff7a8a"
                    label="L"
                    value={String(sessionLosses)}
                />
                <StripStat
                    color="#7dd3fc"
                    label="WR"
                    value={winRate !== null ? `${winRate}%` : '--'}
                />
            </div>

            <div className="flex min-w-0 items-center justify-end gap-1">
                {recent.length === 0 && (
                    <span className="text-text-subtle text-[10px] font-bold">
                        No games
                    </span>
                )}
                {recent.map(match => (
                    <div
                        key={match.matchId}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[9px] font-black"
                        style={{
                            background: match.win
                                ? 'rgba(94,242,162,0.2)'
                                : 'rgba(255,122,138,0.2)',
                            borderColor: match.win
                                ? 'rgba(94,242,162,0.55)'
                                : 'rgba(255,122,138,0.55)',
                            color: match.win ? '#5ef2a2' : '#ff7a8a',
                        }}>
                        {match.win ? 'W' : 'L'}
                    </div>
                ))}
            </div>
        </div>
    )
}
