import { WIDGET_STYLE_OPTIONS } from '@/components/widget/widget.constants'
import { REGIONS } from '@/lib/riot/riot.constants'
import type { Region } from '@/lib/riot/riot.types'

export const BUILDER_REGIONS: Region[] = [...REGIONS]

export const STYLES = WIDGET_STYLE_OPTIONS.map(
    ({ description, label, style }) => ({
        desc: description,
        id: style,
        label,
    })
)

export const BUILDER_PUUID_STORAGE_KEY = 'statbox.builder.puuid'
export const BUILDER_SETTINGS_STORAGE_KEY = 'statbox.builder.settings'
