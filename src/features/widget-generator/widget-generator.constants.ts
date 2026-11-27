import type { Region } from '@/lib/riot/riot.types'

import { WIDGET_STYLE_OPTIONS } from '@/features/widget/widget.constants'
import { REGIONS } from '@/lib/riot/riot.constants'

export const BUILDER_REGIONS: Region[] = [...REGIONS]

export const STYLES = WIDGET_STYLE_OPTIONS.map(
    ({ description, label, style }) => ({
        desc: description,
        id: style,
        label,
    })
)
