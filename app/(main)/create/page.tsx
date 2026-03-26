'use client'

import Badge from '@/components/badge/badge'
import Button from '@/components/button/button'
import Card from '@/components/card/card'
import PlayerSummary from '@/components/widget/player-summary'
import WidgetPreviewPanel from '@/components/widget-generator/widget-generator-preview-panel'
import UrlBlock from '@/components/widget-generator/widget-generator-url-block'
import { STYLES } from '@/components/widget-generator/widget-generator.constants'
import { cn } from '@/lib/cn'

import { useCreatePage } from './create.hooks'
import CreateError from './error'
import CreateLoader from './loader'

export default function CreatePage() {
    const {
        createStyleSelectHandler,
        handleAllDaySession,
        handleChangeAccount,
        handleFlexQueue,
        handleFromTimeSession,
        handleSessionTimeChange,
        handleSoloQueue,
        isError,
        isLoading,
        maxSessionTime,
        previewSession,
        puuid,
        queue,
        sessionMode,
        sessionTime,
        storageReady,
        style,
        summonerData,
        tierColor,
        urls,
    } = useCreatePage()

    if (!storageReady || !puuid || (isLoading && !summonerData)) {
        return <CreateLoader />
    }

    if (isError || !summonerData || !urls) {
        return <CreateError />
    }

    return (
        <div className="space-y-5">
            <Card className="border-border-secondary bg-bg-elevated flex flex-wrap items-center gap-3 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                <div className="min-w-0 flex-1">
                    <PlayerSummary data={summonerData} tierColor={tierColor} />
                </div>
                <Button size="sm" variant="ghost" onClick={handleChangeAccount}>
                    Change account
                </Button>
            </Card>

            <div className="flex flex-wrap gap-2">
                <Badge>Browser source</Badge>
                <Badge>Auto refresh</Badge>
                <Badge tone="success">Stream ready</Badge>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <WidgetPreviewPanel
                    initialData={summonerData}
                    session={previewSession}
                    style={style}
                />

                <Card className="border-border-secondary bg-bg-elevated space-y-3 rounded-4xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <div>
                        <p className="text-text text-sm font-semibold">
                            Choose layout
                        </p>
                        <p className="text-text-muted mt-1 text-xs">
                            See the final widget first, then lock the style and
                            copy the right URL.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {STYLES.map(item => (
                            <button
                                key={item.id}
                                className="block w-full text-left"
                                type="button"
                                onClick={createStyleSelectHandler(item.id)}>
                                <Card
                                    className={cn(
                                        'flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition',
                                        style === item.id
                                            ? 'border-accent bg-accent text-bg-base'
                                            : 'border-border-secondary bg-bg-elevated text-text hover:border-border-hover',
                                    )}>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-semibold">
                                            {item.label}
                                        </div>
                                        <div
                                            className={cn(
                                                'mt-0.5 text-xs',
                                                style === item.id
                                                    ? 'text-bg-base/75'
                                                    : 'text-text-subtle',
                                            )}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </Card>
                            </button>
                        ))}
                    </div>
                </Card>

                <Card className="border-border-secondary bg-bg-elevated space-y-3 rounded-2xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <div>
                        <p className="text-text text-sm font-semibold">Queue</p>
                        <p className="text-text-muted mt-0.5 text-xs">
                            Choose whether the widget uses SoloQ or Flex ranked
                            data.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant={queue === 'solo' ? 'primary' : 'secondary'}
                            onClick={handleSoloQueue}>
                            SoloQ
                        </Button>
                        <Button
                            size="sm"
                            variant={queue === 'flex' ? 'primary' : 'secondary'}
                            onClick={handleFlexQueue}>
                            Flex
                        </Button>
                    </div>
                </Card>

                <Card className="border-border-secondary bg-bg-elevated space-y-3 rounded-2xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <div>
                        <p className="text-text text-sm font-semibold">
                            Session tracking
                        </p>
                        <p className="text-text-muted mt-0.5 text-xs">
                            Choose whether the widget tracks today or starts
                            from a custom time.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant={
                                sessionMode === 'all-day' ? 'primary' : 'secondary'
                            }
                            onClick={handleAllDaySession}>
                            All day
                        </Button>
                        <Button
                            size="sm"
                            variant={
                                sessionMode === 'from-time'
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={handleFromTimeSession}>
                            From time
                        </Button>
                    </div>

                    {sessionMode === 'from-time' ? (
                        <div className="space-y-1">
                            <label
                                className="text-text-strong text-[11px] font-semibold tracking-[0.18em] uppercase"
                                htmlFor="session-start-time">
                                Start time
                            </label>
                            <input
                                className="border-border-secondary bg-bg-base text-text h-11 w-full rounded-xl border px-3 text-sm outline-none"
                                id="session-start-time"
                                max={maxSessionTime}
                                type="datetime-local"
                                value={sessionTime}
                                onChange={handleSessionTimeChange}
                            />
                        </div>
                    ) : null}
                </Card>
            </div>

            <UrlBlock
                description="Single browser source URL with your selected layout and session settings."
                label="Widget URL"
                url={urls.widgetUrl}
            />

            <p className="text-text-muted text-center text-xs">
                Add either URL as a Browser Source in OBS.
            </p>
        </div>
    )
}
