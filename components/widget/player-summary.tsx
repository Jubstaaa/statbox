import ProfileIcon from '@/components/profile-icon/profile-icon'
import { cn } from '@/lib/cn'
import type { RiotData } from '@/lib/riot/riot.types'

export default function PlayerSummary({
    data,
    size = 'md',
    tierColor,
}: {
    data: RiotData
    size?: 'sm' | 'md'
    tierColor: string
}) {
    const compact = size === 'sm'

    return (
        <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-2.5')}>
            <div className="relative shrink-0">
                <ProfileIcon
                    borderColor={`${tierColor}${compact ? '70' : '80'}`}
                    iconId={data.profileIconId}
                    ringClassName={compact ? 'border' : 'border-[1.5px]'}
                    className={cn(
                        compact
                            ? 'h-7 w-7 rounded-[9px]'
                            : 'h-11.5 w-11.5 rounded-xl'
                    )}
                />
                {!compact && (
                    <div
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold whitespace-nowrap"
                        style={{ background: tierColor, color: '#07111f' }}>
                        LV {data.summonerLevel}
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div
                    className={cn(
                        'text-text truncate font-extrabold',
                        compact ? 'text-xs' : 'text-sm'
                    )}>
                    {data.gameName}
                    <span className="text-text-subtle font-semibold">
                        {compact ? '' : ' '}#{data.tagLine}
                    </span>
                </div>
                <div
                    className={cn(
                        'flex flex-wrap items-center gap-1.5',
                        compact ? 'mt-0.5' : 'mt-1'
                    )}>
                    <span
                        className="text-[10px] font-extrabold tracking-[0.14em] uppercase"
                        style={{ color: tierColor }}>
                        {data.tier === 'UNRANKED'
                            ? 'Unranked'
                            : `${data.tier} ${data.rank}`}
                    </span>
                    {data.tier !== 'UNRANKED' && (
                        <span className="text-text-muted text-[10px] font-bold">
                            {data.leaguePoints} LP
                        </span>
                    )}
                    {data.hotStreak && <span className="text-xs">🔥</span>}
                </div>
            </div>
        </div>
    )
}
