import Card from '@/components/card/card'
import Spinner from '@/components/spinner/spinner'

export default function CreateLoader() {
    return (
        <Card className="border-border-secondary bg-bg-elevated flex min-h-105 flex-col items-center justify-center gap-4 rounded-4xl p-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <Spinner className="h-8 w-8 border-[3px]" />
            <div>
                <p className="text-text text-base font-semibold">
                    Fetching account
                </p>
                <p className="text-text-muted mt-1 text-sm">
                    Pulling Riot data for your builder screen.
                </p>
            </div>
        </Card>
    )
}
