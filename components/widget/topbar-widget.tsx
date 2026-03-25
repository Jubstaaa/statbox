import { cn } from '@/lib/cn'

import type { ComputedData } from './widget.types'

export default function TopbarWidget({
    data,
    recent,
    sessionLosses,
    sessionWins,
    tierColor,
    winRate,
}: ComputedData) {
    return (
        <div className="h-10 w-[460px] overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(8,20,28,0.72)_10%,rgba(8,20,28,0.82)_50%,rgba(8,20,28,0.72)_90%,rgba(0,0,0,0)_100%)] px-3 shadow-[0_12px_32px_rgba(0,0,0,0.2)] backdrop-blur-md">
            <div
                className="flex h-full items-center justify-center gap-2.5 border-b"
                style={{
                    borderImage:
                        'linear-gradient(90deg, transparent 0%, rgba(125,211,252,0.2) 12%, rgba(125,211,252,0.32) 50%, rgba(125,211,252,0.2) 88%, transparent 100%) 1',
                }}>
                <div className="flex items-center gap-2">
                    <span
                        className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]"
                        style={{ backgroundColor: tierColor, color: tierColor }}
                    />
                    <span
                        className="text-[12px] font-black tracking-[0.18em] uppercase"
                        style={{ color: tierColor }}>
                        {data.tier === 'UNRANKED'
                            ? 'Unranked'
                            : `${data.tier} ${data.rank}`}
                    </span>
                </div>

                <div className="rounded-md border border-white/10 bg-white/6 px-1.5 py-1 text-[11px] font-bold text-white/90">
                    {data.tier === 'UNRANKED'
                        ? '-- LP'
                        : `${data.leaguePoints} LP`}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold uppercase">
                    <span className="text-win">{sessionWins}W</span>
                    <span className="text-white/30">/</span>
                    <span className="text-loss">{sessionLosses}L</span>
                </div>

                <div className="text-[11px] font-bold uppercase">
                    <span className="text-accent-2">
                        {winRate !== null ? `${winRate}%` : '--'}
                    </span>
                    <span className="ml-1 text-white/60">WR</span>
                </div>

                <div className="flex items-center gap-1">
                    {recent.slice(0, 5).map(match => (
                        <span
                            key={match.matchId}
                            className={cn(
                                'inline-flex h-5 min-w-4.5 items-center justify-center rounded-md border px-1 text-[9px] font-black',
                                match.win
                                    ? 'border-win/45 bg-win/12 text-win'
                                    : 'border-loss/45 bg-loss/12 text-loss'
                            )}>
                            {match.win ? 'W' : 'L'}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
