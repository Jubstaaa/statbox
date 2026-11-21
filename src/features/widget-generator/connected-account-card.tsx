import { RefreshCw } from 'lucide-react'

import Button from '@/components/button'
import Card from '@/components/card'
import PlayerSummary from '@/features/widget/player-summary'
import { TIER_COLORS } from '@/features/widget/widget.constants'
import type { RiotData } from '@/lib/riot/riot.types'

import { describeSavedAccountError } from './widget-generator.messages'

interface ConnectedAccountCardProps {
    query: {
        data: RiotData | undefined
        error: unknown
        isError: boolean
        isLoading: boolean
    }
    onChangeAccount: () => void
    onOpenBuilder: () => void
    onRetry: () => void
}

export default function ConnectedAccountCard({
    query,
    onChangeAccount,
    onOpenBuilder,
    onRetry,
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
        const { message, needsNewAccount } = describeSavedAccountError(
            query.error
        )

        return (
            <Card className="border-loss/25 bg-loss/8 space-y-4 rounded-4xl border p-5">
                <div>
                    <p className="text-loss text-[11px] font-semibold tracking-[0.22em] uppercase">
                        Saved account unavailable
                    </p>
                    <p className="text-text-muted mt-1 text-sm" role="alert">
                        {message}
                    </p>
                </div>

                {needsNewAccount ? (
                    <Button
                        fullWidth
                        variant="secondary"
                        onClick={onChangeAccount}>
                        Change account
                    </Button>
                ) : (
                    <Button fullWidth variant="secondary" onClick={onRetry}>
                        Try again
                    </Button>
                )}
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
