import Card from '@/components/card/card'
import Widget from '@/components/widget/widget'

import type { WidgetPreviewPanelProps } from './widget-generator.types'

export default function WidgetPreviewPanel({
    initialData,
    session,
    style,
}: WidgetPreviewPanelProps) {
    return (
        <Card className="border-border-secondary bg-bg-elevated overflow-hidden rounded-4xl p-3 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                    <p className="text-text text-sm font-semibold">
                        Live preview
                    </p>
                    <p className="text-text-muted mt-0.5 text-xs">
                        Current style with your fetched account data.
                    </p>
                </div>
                <span className="border-border-secondary bg-bg-base text-text-subtle rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
                    {style}
                </span>
            </div>
            <div className="border-border-secondary overflow-x-auto rounded-[1.375rem] border bg-[#05070b] p-4">
                <div className="mx-auto w-fit">
                    <Widget
                        data={initialData}
                        isError={false}
                        isLoading={false}
                        session={session}
                        style={style}
                    />
                </div>
            </div>
        </Card>
    )
}
