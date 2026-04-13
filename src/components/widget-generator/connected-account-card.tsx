import type { UseQueryResult } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'

import Button from '@/components/button/button'
import Card from '@/components/card/card'
import PlayerSummary from '@/components/widget/player-summary'
import { TIER_COLORS } from '@/components/widget/widget.constants'
import type { RiotData } from '@/lib/riot/riot.types'

interface ConnectedAccountCardProps {
    query: UseQueryResult<RiotData>
    onChangeAccount: () => void
    onOpenBuilder: () => void
}

export default function ConnectedAccountCard({
    query,
    onChangeAccount,
    onOpenBuilder,
}: ConnectedAccountCardProps) {
    if (query.isLoading) {
        return (
            <Card className="border-border-secondary bg-bg-elevated space-y-4 rounded-4xl p-5">
                <div>
                    <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                        Connected account
                    </p>
                    <p className="text-text-muted mt-1 text-sm">
                        Restoring your last builder session.
                    </p>
                </div>
                <Button disabled fullWidth size="lg">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Loading account...
                </Button>
            </Card>
        )
    }

    if (query.isError || !query.data) {
        return (
            <Card className="border-loss/25 bg-loss/8 space-y-4 rounded-4xl border p-5">
                <div>
                    <p className="text-loss text-[11px] font-semibold tracking-[0.22em] uppercase">
                        Saved account unavailable
                    </p>
                    <p className="text-text-muted mt-1 text-sm">
                        The last connected account could not be restored. Pick
                        another account to continue.
                    </p>
                </div>

                <Button fullWidth variant="secondary" onClick={onChangeAccount}>
                    Change account
                </Button>
            </Card>
        )
    }

    return (
        <Card className="border-border-secondary bg-bg-elevated space-y-4 rounded-4xl p-5">
            <div>
                <p className="text-accent-2 text-[11px] font-semibold tracking-[0.22em] uppercase">
                    Connected account
                </p>
                <p className="text-text-muted mt-1 text-sm">
                    Your builder is ready with the saved Riot account.
                </p>
            </div>

            <PlayerSummary
                data={query.data}
                tierColor={TIER_COLORS[query.data.tier] ?? TIER_COLORS.UNRANKED}
            />

            <div className="flex flex-wrap gap-3">
                <Button onClick={onOpenBuilder}>Open builder</Button>
                <Button variant="secondary" onClick={onChangeAccount}>
                    Change account
                </Button>
            </div>
        </Card>
    )
}
