'use client'

import { useId } from 'react'

import Badge from '@/app/(main)/_components/badge'
import Button from '@/components/button'
import Card from '@/components/card'
import { STYLES } from '@/features/widget-generator/widget-generator.constants'
import PlayerSummary from '@/features/widget/player-summary'
import { cn } from '@/lib/cn'

import CreateError from './_components/create-error'
import CreateLoader from './_components/create-loader'
import CreatePreviewPanel from './_components/preview-panel'
import CreateUrlBlock from './_components/url-block'
import { useCreatePage } from './use-create-page'

export default function CreateView() {
    const {
        createStyleSelectHandler,
        error,
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
        settingsNotSaved,
        storageReady,
        style,
        summonerData,
        tierColor,
        urls,
    } = useCreatePage()
    const layoutLabelId = useId()
    const queueLabelId = useId()
    const sessionLabelId = useId()
    const sessionTimeId = useId()

    if (!storageReady || !puuid || (isLoading && !summonerData)) {
        return <CreateLoader />
    }

    if (isError || !summonerData || !urls) {
        return <CreateError error={error} />
    }

    return (
        <div className="space-y-5">
            <Card className="border-border-secondary bg-bg-elevated flex flex-wrap items-center gap-3 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                <div className="min-w-0 flex-1">
                    <PlayerSummary data={summonerData} tierColor={tierColor} />
                </div>
                <Button onClick={handleChangeAccount} size="sm" variant="ghost">
                    Change account
                </Button>
            </Card>

            <div className="flex flex-wrap gap-2">
                <Badge>Browser source</Badge>
                <Badge>Auto refresh</Badge>
                <Badge tone="success">Stream ready</Badge>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <CreatePreviewPanel
                    initialData={summonerData}
                    session={previewSession}
                    style={style}
                />

                <Card className="border-border-secondary bg-bg-elevated space-y-3 rounded-4xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <div>
                        <p
                            className="text-text text-sm font-semibold"
                            id={layoutLabelId}>
                            Choose layout
                        </p>
                        <p className="text-text-muted mt-1 text-xs">
                            See the final widget first, then lock the style and
                            copy the right URL.
                        </p>
                    </div>

                    <div
                        aria-labelledby={layoutLabelId}
                        className="space-y-2"
                        role="group">
                        {STYLES.map(item => (
                            <button
                                aria-pressed={style === item.id}
                                className={cn(
                                    'block w-full rounded-2xl border px-3.5 py-3 text-left transition',
                                    style === item.id
                                        ? 'border-accent bg-accent text-bg-base'
                                        : 'border-border-secondary bg-bg-elevated text-text hover:border-border-hover'
                                )}
                                key={item.id}
                                onClick={createStyleSelectHandler(item.id)}
                                type="button">
                                <span className="block text-xs font-semibold">
                                    {item.label}
                                </span>
                                <span
                                    className={cn(
                                        'mt-0.5 block text-xs',
                                        style === item.id
                                            ? 'text-bg-base/75'
                                            : 'text-text-subtle'
                                    )}>
                                    {item.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </Card>

                <Card className="border-border-secondary bg-bg-elevated space-y-3 rounded-2xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <div>
                        <p
                            className="text-text text-sm font-semibold"
                            id={queueLabelId}>
                            Queue
                        </p>
                        <p className="text-text-muted mt-0.5 text-xs">
                            Choose whether the widget uses SoloQ or Flex ranked
                            data.
                        </p>
                    </div>

                    <div
                        aria-labelledby={queueLabelId}
                        className="flex flex-wrap gap-2"
                        role="group">
                        <Button
                            aria-pressed={queue === 'solo'}
                            onClick={handleSoloQueue}
                            size="sm"
                            variant={
                                queue === 'solo' ? 'primary' : 'secondary'
                            }>
                            SoloQ
                        </Button>
                        <Button
                            aria-pressed={queue === 'flex'}
                            onClick={handleFlexQueue}
                            size="sm"
                            variant={
                                queue === 'flex' ? 'primary' : 'secondary'
                            }>
                            Flex
                        </Button>
                    </div>
                </Card>

                <Card className="border-border-secondary bg-bg-elevated space-y-3 rounded-2xl p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    <div>
                        <p
                            className="text-text text-sm font-semibold"
                            id={sessionLabelId}>
                            Session tracking
                        </p>
                        <p className="text-text-muted mt-0.5 text-xs">
                            Choose whether the widget tracks today or starts
                            from a custom time.
                        </p>
                    </div>

                    <div
                        aria-labelledby={sessionLabelId}
                        className="flex flex-wrap gap-2"
                        role="group">
                        <Button
                            aria-pressed={sessionMode === 'all-day'}
                            onClick={handleAllDaySession}
                            size="sm"
                            variant={
                                sessionMode === 'all-day'
                                    ? 'primary'
                                    : 'secondary'
                            }>
                            All day
                        </Button>
                        <Button
                            aria-pressed={sessionMode === 'from-time'}
                            onClick={handleFromTimeSession}
                            size="sm"
                            variant={
                                sessionMode === 'from-time'
                                    ? 'primary'
                                    : 'secondary'
                            }>
                            Start time
                        </Button>
                    </div>

                    {sessionMode === 'from-time' ? (
                        <div className="space-y-1.5">
                            <label
                                className="text-text-muted block text-xs"
                                htmlFor={sessionTimeId}>
                                Session start
                            </label>
                            <input
                                className="bg-bg-base text-text border-border-secondary focus:border-accent focus-visible:ring-accent/60 h-11 w-full rounded-2xl border px-4 text-sm outline-none focus-visible:ring-2"
                                id={sessionTimeId}
                                max={maxSessionTime}
                                onChange={handleSessionTimeChange}
                                type="datetime-local"
                                value={sessionTime}
                            />
                        </div>
                    ) : null}
                </Card>
            </div>

            {settingsNotSaved ? (
                <p
                    className="border-loss/25 bg-loss/10 text-loss rounded-xl border px-3 py-2.5 text-xs"
                    role="alert">
                    Your browser did not save that change, so the widget URL
                    below still uses your previous settings. Check that this
                    site may store data, then try again.
                </p>
            ) : null}

            <CreateUrlBlock
                description="Use this single URL as an OBS Browser Source."
                label="Widget URL"
                url={urls.widgetUrl}
            />

            <p className="text-text-muted text-center text-xs">
                Add this URL as a Browser Source in OBS.
            </p>
        </div>
    )
}
